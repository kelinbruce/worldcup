const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 第三方体育数据 API 配置（API-Football）
// 需要在云函数环境变量中配置 API_FOOTBALL_KEY
const API_BASE = 'https://v3.football.api-sports.io'
const API_KEY = process.env.API_FOOTBALL_KEY || 'YOUR_API_KEY'

// 2026 世界杯 League ID（上线前确认）
const WC_LEAGUE_ID = 1

/**
 * 同步赛程数据（定时触发器每小时执行）
 * 1. 拉取赛程列表写入 matches 集合
 * 2. 更新进行中比赛的实时比分
 * 3. 对已结束且未结算的比赛触发结算
 */
exports.main = async (event, context) => {
  const { action = 'sync' } = event

  try {
    if (action === 'sync') {
      await syncSchedule()
      await updateLiveScores()
      await triggerSettlement()
    } else if (action === 'live') {
      await updateLiveScores()
    }
    return { success: true }
  } catch (err) {
    console.error('syncMatchData error:', err)
    return { error: err.message }
  }
}

async function fetchAPI(path, params = {}) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
  const url = `${API_BASE}${path}?${query}`
  const res = await cloud.callFunction({
    name: 'httpRequest',
    data: { url, headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' } },
  }).catch(() => null)
  return res ? res.result : null
}

async function syncSchedule() {
  const data = await fetchAPI('/fixtures', { league: WC_LEAGUE_ID, season: 2026 })
  if (!data || !data.response) return

  const fixtures = data.response
  for (const fixture of fixtures) {
    const f = fixture.fixture
    const teams = fixture.teams
    const goals = fixture.goals

    const stageMap = {
      'Group Stage': `group_${fixture.league.round.replace('Group Stage - ', '').replace('Group ', '')}`,
      'Round of 32': 'round32',
      'Round of 16': 'round16',
      'Quarter-finals': 'qf',
      'Semi-finals': 'sf',
      'Final': 'final',
    }
    const statusMap = { 'NS': 'upcoming', '1H': 'live', 'HT': 'live', '2H': 'live', 'ET': 'live', 'PEN': 'live', 'FT': 'finished', 'AET': 'finished', 'PEN': 'finished' }

    const matchData = {
      matchId: String(f.id),
      stage: stageMap[fixture.league.round] || fixture.league.round,
      homeTeam: teams.home.name.toUpperCase().slice(0, 3),
      awayTeam: teams.away.name.toUpperCase().slice(0, 3),
      homeTeamFull: teams.home.name,
      awayTeamFull: teams.away.name,
      kickoffTime: new Date(f.date).getTime(),
      status: statusMap[f.status.short] || 'upcoming',
      homeScore: goals.home !== null ? goals.home : null,
      awayScore: goals.away !== null ? goals.away : null,
      venue: f.venue ? f.venue.name : '',
      updatedAt: db.serverDate(),
    }

    const existing = await db.collection('matches').where({ matchId: matchData.matchId }).get()
    if (existing.data.length > 0) {
      await db.collection('matches').where({ matchId: matchData.matchId }).update({ data: matchData })
    } else {
      matchData.createdAt = db.serverDate()
      await db.collection('matches').add({ data: matchData })
    }
  }
}

async function updateLiveScores() {
  const liveData = await fetchAPI('/fixtures', { league: WC_LEAGUE_ID, season: 2026, live: 'all' })
  if (!liveData || !liveData.response) return
  for (const fixture of liveData.response) {
    await db.collection('matches').where({ matchId: String(fixture.fixture.id) }).update({
      data: {
        homeScore: fixture.goals.home,
        awayScore: fixture.goals.away,
        status: 'live',
      },
    })
  }
}

async function triggerSettlement() {
  const finishedRes = await db.collection('matches')
    .where({ status: 'finished' })
    .get()

  for (const match of finishedRes.data) {
    if (match.homeScore === null) continue
    const unsettled = await db.collection('predictions')
      .where({ matchId: match.matchId, settled: false })
      .count()
    if (unsettled.total > 0) {
      await cloud.callFunction({
        name: 'settleMatch',
        data: {
          matchId: match.matchId,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
        },
      })
    }
  }
}
