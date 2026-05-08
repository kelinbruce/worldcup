const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { type, matchId, groupId } = event

  try {
    // 单场比赛详情 + 我的预测 + 好友预测
    if (type === 'matchDetail') {
      const matchRes = await db.collection('matches').where({ matchId }).get()
      if (matchRes.data.length === 0) return { error: '比赛不存在' }
      const match = matchRes.data[0]

      const myPredRes = await db.collection('predictions')
        .where({ userId: OPENID, matchId })
        .get()
      const myPrediction = myPredRes.data[0] || null

      // 好友预测（通过微信关系链，此处返回所有已预测该场的用户供前端开放数据 API 过滤）
      const allPredRes = await db.collection('predictions')
        .where({ matchId })
        .limit(100)
        .get()

      // 获取预测用户的头像昵称
      const userIds = [...new Set(allPredRes.data.map(p => p.userId))].filter(id => id !== OPENID)
      const usersRes = userIds.length > 0
        ? await db.collection('users').where({ userId: _.in(userIds) }).field({ userId: 1, nickname: 1, avatarUrl: 1 }).get()
        : { data: [] }
      const userMap = {}
      usersRes.data.forEach(u => { userMap[u.userId] = u })

      const resultText = { home_win: '主队胜', draw: '平局', away_win: '客队胜' }
      const friendPredictions = allPredRes.data
        .filter(p => p.userId !== OPENID && userMap[p.userId])
        .map(p => ({
          ...p,
          nickname: userMap[p.userId].nickname,
          avatarUrl: userMap[p.userId].avatarUrl,
          resultText: resultText[p.result] || '',
        }))

      return { match, myPrediction, friendPredictions }
    }

    // 冠军预测
    if (type === 'champion') {
      const myUserRes = await db.collection('users').where({ userId: OPENID }).get()
      const myUser = myUserRes.data[0] || {}
      const myPick = myUser.championPick
        ? { teamCode: myUser.championPick }
        : null

      const allUsersRes = await db.collection('users')
        .where({ championPick: _.neq(null) })
        .field({ userId: 1, nickname: 1, avatarUrl: 1, championPick: 1 })
        .limit(100)
        .get()

      // 统计各球队被选次数
      const stats = {}
      allUsersRes.data.forEach(u => {
        stats[u.championPick] = (stats[u.championPick] || 0) + 1
      })

      const friendPicks = allUsersRes.data
        .filter(u => u.userId !== OPENID)
        .map(u => ({
          userId: u.userId,
          nickname: u.nickname,
          avatarUrl: u.avatarUrl,
          teamCode: u.championPick,
        }))

      return { myPick, friendPicks, stats }
    }

    // 个人战绩 + 历史预测
    if (type === 'myStats') {
      const userRes = await db.collection('users').where({ userId: OPENID }).get()
      const user = userRes.data[0] || {}
      const correctRate = user.totalPredictions
        ? Math.round((user.correctPredictions / user.totalPredictions) * 100) + '%'
        : '0%'

      const histRes = await db.collection('predictions')
        .where({ userId: OPENID })
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get()

      // 获取每场比赛信息
      const matchIds = histRes.data.map(p => p.matchId)
      let matchMap = {}
      if (matchIds.length > 0) {
        const mRes = await db.collection('matches').where({ matchId: _.in(matchIds) }).get()
        mRes.data.forEach(m => { matchMap[m.matchId] = m })
      }

      const resultText = { home_win: '主队胜', draw: '平局', away_win: '客队胜' }
      const history = histRes.data.map(p => ({
        ...p,
        resultText: resultText[p.result] || '',
        match: matchMap[p.matchId] || null,
      })).filter(p => p.match)

      return {
        userInfo: { ...user, correctRate },
        history,
      }
    }

    // 我加入的群组
    if (type === 'myGroups') {
      const groupRes = await db.collection('predictionGroups')
        .where({ members: _.elemMatch(_.eq(OPENID)) })
        .get()
      return { groups: groupRes.data }
    }

    // 群组详情
    if (type === 'group' && groupId) {
      const groupRes = await db.collection('predictionGroups').where({ groupId }).get()
      if (groupRes.data.length === 0) return { error: '群组不存在' }
      const group = groupRes.data[0]

      // 成员排行榜
      const memberIds = group.members
      const usersRes = await db.collection('users')
        .where({ userId: _.in(memberIds) })
        .get()
      const leaderboard = usersRes.data
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((u, idx) => ({
          ...u,
          rank: idx + 1,
          isMe: u.userId === OPENID,
        }))

      // 最近比赛预测分布
      const recentMatchRes = await db.collection('matches')
        .orderBy('kickoffTime', 'desc')
        .limit(3)
        .get()
      const recentMatchIds = recentMatchRes.data.map(m => m.matchId)
      const groupPredRes = await db.collection('predictions')
        .where({ matchId: _.in(recentMatchIds), userId: _.in(memberIds) })
        .get()
      const matchPredMap = {}
      groupPredRes.data.forEach(p => {
        if (!matchPredMap[p.matchId]) {
          matchPredMap[p.matchId] = { home_win: 0, draw: 0, away_win: 0, total: 0, correct: 0 }
        }
        matchPredMap[p.matchId][p.result]++
        matchPredMap[p.matchId].total++
        if (p.earnedScore > 0) matchPredMap[p.matchId].correct++
      })
      const recentMatches = recentMatchRes.data.map(m => ({
        ...m,
        dist: matchPredMap[m.matchId] || { home_win: 0, draw: 0, away_win: 0 },
        groupCorrectRate: matchPredMap[m.matchId]
          ? Math.round((matchPredMap[m.matchId].correct / (matchPredMap[m.matchId].total || 1)) * 100)
          : 0,
      }))

      return { group, leaderboard, recentMatches }
    }

    return { error: '未知 type' }
  } catch (err) {
    return { error: err.message }
  }
}
