const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

/**
 * 比赛结算云函数（由定时触发器或管理后台调用）
 * event: { matchId, homeScore, awayScore }
 */
exports.main = async (event, context) => {
  const { matchId, homeScore, awayScore } = event

  if (homeScore === undefined || awayScore === undefined || !matchId) {
    return { error: '参数缺失' }
  }

  try {
    // 1. 更新比赛状态和比分
    await db.collection('matches').where({ matchId }).update({
      data: {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        status: 'finished',
        updatedAt: db.serverDate(),
      },
    })

    const actualResult = homeScore > awayScore ? 'home_win'
      : homeScore < awayScore ? 'away_win' : 'draw'

    // 2. 获取该场所有未结算预测
    const predRes = await db.collection('predictions')
      .where({ matchId, settled: false })
      .limit(500)
      .get()

    const predictions = predRes.data
    if (predictions.length === 0) return { settled: 0 }

    // 3. 批量计算积分并更新
    const updateTasks = predictions.map(async pred => {
      const earned = calcScore(pred, { homeScore, awayScore, actualResult })
      const isCorrect = pred.result === actualResult
      const isExact = pred.homeScore === homeScore && pred.awayScore === awayScore
      const isNear = isCorrect && pred.homeScore !== null
        && Math.abs((pred.homeScore - pred.awayScore) - (homeScore - awayScore)) <= 1
        && !isExact

      await db.collection('predictions').doc(pred._id).update({
        data: {
          earnedScore: earned,
          settled: true,
          updatedAt: db.serverDate(),
        },
      })

      // 更新用户积分
      const scoreInc = {}
      scoreInc.totalScore = _.inc(earned)
      if (isCorrect) {
        scoreInc.correctPredictions = _.inc(1)
        scoreInc.resultScore = _.inc(10)
      }
      if (isExact) {
        scoreInc.exactScoreCount = _.inc(1)
        scoreInc.exactScore = _.inc(20) // 比分正确额外加的 20（总 30，含胜平负 10）
      }
      if (isNear) {
        scoreInc.nearScore = _.inc(5)
      }

      await db.collection('users').where({ userId: pred.userId }).update({ data: scoreInc })
    })

    await Promise.all(updateTasks)

    // 4. 更新各竞猜群正确率
    const groupIds = [...new Set(predictions.filter(p => p.groupId).map(p => p.groupId))]
    for (const gid of groupIds) {
      await updateGroupStats(gid)
    }

    return { settled: predictions.length, matchId }
  } catch (err) {
    return { error: err.message }
  }
}

function calcScore(pred, { homeScore, awayScore, actualResult }) {
  if (pred.result !== actualResult) return 0
  if (pred.homeScore === homeScore && pred.awayScore === awayScore) return 30
  if (pred.homeScore !== null) {
    const diff = Math.abs((pred.homeScore - pred.awayScore) - (homeScore - awayScore))
    if (diff <= 1) return 15
  }
  return 10
}

async function updateGroupStats(groupId) {
  const groupRes = await db.collection('predictionGroups').where({ groupId }).get()
  if (groupRes.data.length === 0) return
  const members = groupRes.data[0].members
  const predRes = await db.collection('predictions')
    .where({ groupId, userId: db.command.in(members) })
    .get()
  const total = predRes.data.length
  const correct = predRes.data.filter(p => p.earnedScore > 0).length
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0
  await db.collection('predictionGroups').where({ groupId }).update({
    data: { totalCorrectRate: rate, totalMatches: total },
  })
}
