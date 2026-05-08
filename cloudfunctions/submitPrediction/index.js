const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { type, matchId, result, homeScore, awayScore, teamCode, groupId } = event

  try {
    // 冠军预测
    if (type === 'champion') {
      const userRes = await db.collection('users').where({ userId: OPENID }).get()
      if (userRes.data.length > 0 && userRes.data[0].championPick) {
        return { error: '冠军预测已提交，不可修改' }
      }
      await db.collection('users').where({ userId: OPENID }).update({
        data: {
          championPick: teamCode,
          updatedAt: db.serverDate(),
        },
      })
      const teamInfo = require('./teams')[teamCode] || { name: teamCode, flag: '' }
      return {
        pick: {
          teamCode,
          teamName: teamInfo.name,
          teamFlag: teamInfo.flag,
        },
      }
    }

    // 单场比赛预测
    // 1. 校验比赛是否存在且在截止时间前
    const matchRes = await db.collection('matches').where({ matchId }).get()
    if (matchRes.data.length === 0) return { error: '比赛不存在' }
    const match = matchRes.data[0]
    if (Date.now() >= match.kickoffTime - 30 * 60 * 1000) {
      return { error: '预测时间已截止' }
    }

    // 2. 计算结果文本
    const resultText = { home_win: '主队胜', draw: '平局', away_win: '客队胜' }

    // 3. 查找已有预测（upsert）
    const existRes = await db.collection('predictions')
      .where({ userId: OPENID, matchId })
      .get()

    const predData = {
      userId: OPENID,
      matchId,
      groupId: groupId || null,
      result,
      resultText: resultText[result],
      homeScore: homeScore !== undefined ? homeScore : null,
      awayScore: awayScore !== undefined ? awayScore : null,
      earnedScore: 0,
      settled: false,
      updatedAt: db.serverDate(),
    }

    let prediction
    if (existRes.data.length > 0) {
      const docId = existRes.data[0]._id
      await db.collection('predictions').doc(docId).update({ data: predData })
      prediction = { ...existRes.data[0], ...predData, predictionId: docId }
    } else {
      predData.createdAt = db.serverDate()
      predData.predictionId = `${OPENID}_${matchId}_${Date.now()}`
      const addRes = await db.collection('predictions').add({ data: predData })
      prediction = { ...predData, _id: addRes._id }
      // 增加预测计数
      await db.collection('users').where({ userId: OPENID }).update({
        data: { totalPredictions: db.command.inc(1) },
      })
    }

    return { prediction }
  } catch (err) {
    return { error: err.message }
  }
}
