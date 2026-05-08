const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 2026世界杯小组赛分组 (12组 × 4队)
const GROUP_TEAMS = {
  A: ['USA', 'BRA', 'GER', 'MAR'],
  B: ['MEX', 'ARG', 'FRA', 'SEN'],
  C: ['CAN', 'URU', 'ENG', 'NGA'],
  D: ['JAM', 'COL', 'ESP', 'CMR'],
  E: ['HON', 'ECU', 'POR', 'GHA'],
  F: ['CRC', 'PAR', 'NED', 'EGY'],
  G: ['BEL', 'TUN', 'JPN', 'PAN'],
  H: ['CRO', 'RSA', 'KOR', 'VEN'],
  I: ['SUI', 'CIV', 'AUS', 'NZL'],
  J: ['DEN', 'KSA', 'AUT', 'IRN'],
  K: ['POL', 'IRQ', 'SRB', 'QAT'],
  L: ['TUR', 'SCO', 'HUN', 'JOR'],
}

// 每对组的赛程: [组1, 组2] 及各轮次日期
// 组1用 18:00/22:00 UTC; 组2用 15:00/19:00 UTC
// 第三轮同组同时开赛
const PAIR_SCHEDULE = [
  { groups: ['A', 'B'], days: [[6, 12], [6, 19], [6, 26]] },
  { groups: ['C', 'D'], days: [[6, 13], [6, 20], [6, 27]] },
  { groups: ['E', 'F'], days: [[6, 14], [6, 21], [6, 28]] },
  { groups: ['G', 'H'], days: [[6, 15], [6, 22], [6, 29]] },
  { groups: ['I', 'J'], days: [[6, 16], [6, 23], [6, 30]] },
  { groups: ['K', 'L'], days: [[6, 17], [6, 24], [7, 1]] },
]

// 每组内的对阵: [主队索引, 客队索引, 轮次(0/1/2)]
const MATCHUPS = [
  { h: 0, a: 1, md: 0, slot: 0 }, // MD1: T1 vs T2
  { h: 2, a: 3, md: 0, slot: 1 }, // MD1: T3 vs T4
  { h: 0, a: 2, md: 1, slot: 0 }, // MD2: T1 vs T3
  { h: 1, a: 3, md: 1, slot: 1 }, // MD2: T2 vs T4
  { h: 0, a: 3, md: 2, slot: 0 }, // MD3: T1 vs T4 (同时)
  { h: 1, a: 2, md: 2, slot: 0 }, // MD3: T2 vs T3 (同时)
]

// slot时间: 组1用18/22, 组2用15/19; MD3同组同时
const HOURS = [
  [[18, 22], [15, 19]], // MD1/MD2: [组1_slot0, 组1_slot1], [组2_slot0, 组2_slot1]
  [[18, 22], [15, 19]],
  [[20, 20], [17, 17]], // MD3: 同时
]

function kickoffMs(year, month, day, hour) {
  return Date.UTC(year, month - 1, day, hour, 0, 0)
}

function buildMatches() {
  const matches = []
  let seq = 1

  PAIR_SCHEDULE.forEach(pair => {
    pair.groups.forEach((group, gIdx) => {
      const teams = GROUP_TEAMS[group]
      MATCHUPS.forEach(mu => {
        const [month, day] = pair.days[mu.md]
        const hour = HOURS[mu.md][gIdx][mu.slot]
        matches.push({
          matchId: `m${String(seq++).padStart(3, '0')}`,
          stage: `group_${group}`,
          homeTeam: teams[mu.h],
          awayTeam: teams[mu.a],
          kickoffTime: kickoffMs(2026, month, day, hour),
          status: 'upcoming',
          homeScore: null,
          awayScore: null,
          venue: '',
          createdAt: Date.now(),
        })
      })
    })
  })

  return matches
}

exports.main = async (event, context) => {
  try {
    // 检查是否已有比赛数据
    const existing = await db.collection('matches').count()
    if (existing.total > 0 && !event.force) {
      return { success: false, message: `已存在 ${existing.total} 场比赛数据，传入 force:true 可强制重新导入` }
    }

    const matches = buildMatches()

    // 分批写入 (云数据库单次最多20条)
    const BATCH = 20
    let inserted = 0
    for (let i = 0; i < matches.length; i += BATCH) {
      const batch = matches.slice(i, i + BATCH)
      await Promise.all(batch.map(m => db.collection('matches').add({ data: m })))
      inserted += batch.length
    }

    return { success: true, inserted, total: matches.length }
  } catch (err) {
    console.error('seedData error:', err)
    return { success: false, error: err.message }
  }
}
