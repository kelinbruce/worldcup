const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { filter } = event

  try {
    let query = db.collection('matches')
    const now = Date.now()

    if (filter === 'today') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      query = query.where({
        kickoffTime: _.gte(todayStart.getTime()).and(_.lte(todayEnd.getTime())),
      })
    } else if (filter && filter.startsWith('group_')) {
      query = query.where({ stage: filter })
    } else if (filter === 'round32' || filter === 'round16' || filter === 'qf' || filter === 'sf' || filter === 'final') {
      query = query.where({ stage: filter })
    }

    const matchRes = await query.orderBy('kickoffTime', 'asc').limit(50).get()
    const matches = matchRes.data

    // 批量获取当前用户的预测
    if (matches.length === 0) return { matches: [] }
    const matchIds = matches.map(m => m.matchId)
    const predRes = await db.collection('predictions')
      .where({ userId: OPENID, matchId: _.in(matchIds) })
      .get()
    const predMap = {}
    predRes.data.forEach(p => {
      predMap[p.matchId] = p
    })

    // 统计各场比赛好友预测人数（使用开放数据）
    const enrichedMatches = matches.map(m => {
      const pred = predMap[m.matchId]
      if (pred) {
        const actualResult = m.homeScore > m.awayScore ? 'home_win'
          : m.homeScore < m.awayScore ? 'away_win' : 'draw'
        const resultText = { home_win: '主队胜', draw: '平局', away_win: '客队胜' }
        pred.resultText = resultText[pred.result] || ''
        if (m.status === 'finished') {
          pred.earnedScore = calcScore(pred, m)
        }
      }
      return { ...m, myPrediction: pred || null }
    })

    return { matches: enrichedMatches }
  } catch (err) {
    return { error: err.message }
  }
}

function calcScore(pred, match) {
  const actualResult = match.homeScore > match.awayScore ? 'home_win'
    : match.homeScore < match.awayScore ? 'away_win' : 'draw'
  if (pred.result !== actualResult) return 0
  if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) return 30
  if (pred.homeScore !== null) {
    const diff = Math.abs((pred.homeScore - pred.awayScore) - (match.homeScore - match.awayScore))
    if (diff <= 1) return 15
  }
  return 10
}
