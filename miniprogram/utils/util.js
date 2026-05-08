const { getTeam } = require('./teams')

// 格式化比赛时间
function formatMatchTime(timestamp) {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hour}:${min}`
}

// 格式化倒计时
function formatCountdown(targetTimestamp) {
  const now = Date.now()
  const diff = targetTimestamp - now
  if (diff <= 0) return '已开始'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${mins}分钟`
  return `${mins}分钟`
}

// 判断比赛是否可以预测（开赛前30分钟截止）
function canPredict(kickoffTimestamp) {
  return Date.now() < kickoffTimestamp - 30 * 60 * 1000
}

// 获取比赛状态文字
function getMatchStatusText(status) {
  const map = {
    upcoming: '未开始',
    live: '进行中',
    finished: '已结束',
  }
  return map[status] || status
}

// 获取预测结果文字
function getResultText(result) {
  const map = {
    home_win: '主队胜',
    draw: '平局',
    away_win: '客队胜',
  }
  return map[result] || ''
}

// 计算本场积分（服务端也有同样逻辑，前端仅用于展示）
function calcEarnedScore(prediction, match) {
  if (!prediction || !match || match.status !== 'finished') return 0
  const actualResult = match.homeScore > match.awayScore ? 'home_win'
    : match.homeScore < match.awayScore ? 'away_win' : 'draw'
  const resultCorrect = prediction.result === actualResult
  if (!resultCorrect) return 0
  // 比分完全正确
  if (prediction.homeScore === match.homeScore && prediction.awayScore === match.awayScore) {
    return 30
  }
  // 差一球
  const scoreDiff = Math.abs(
    (prediction.homeScore - prediction.awayScore) - (match.homeScore - match.awayScore)
  )
  if (scoreDiff <= 1 && prediction.homeScore !== null) return 10 + 5
  return 10
}

// 格式化正确率
function formatRate(correct, total) {
  if (!total) return '0%'
  return Math.round((correct / total) * 100) + '%'
}

// 获取赛阶显示名
function getStageText(stage) {
  const map = {
    group_A: '小组赛 A 组',
    group_B: '小组赛 B 组',
    group_C: '小组赛 C 组',
    group_D: '小组赛 D 组',
    group_E: '小组赛 E 组',
    group_F: '小组赛 F 组',
    group_G: '小组赛 G 组',
    group_H: '小组赛 H 组',
    group_I: '小组赛 I 组',
    group_J: '小组赛 J 组',
    group_K: '小组赛 K 组',
    group_L: '小组赛 L 组',
    round32: '32强',
    round16: '16强',
    qf: '8强',
    sf: '4强',
    final: '决赛',
  }
  return map[stage] || stage
}

// 构建比赛展示对象（附加球队信息）
function buildMatchDisplay(match) {
  return {
    ...match,
    homeTeamInfo: getTeam(match.homeTeam),
    awayTeamInfo: getTeam(match.awayTeam),
    timeText: formatMatchTime(match.kickoffTime),
    statusText: getMatchStatusText(match.status),
    stageText: getStageText(match.stage),
    predictable: canPredict(match.kickoffTime),
  }
}

// 云函数调用封装
function callCloud(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data: data || {},
      success: res => resolve(res.result),
      fail: err => reject(err),
    })
  })
}

// 显示 loading
function showLoading(title) {
  wx.showLoading({ title: title || '加载中...', mask: true })
}

function hideLoading() {
  wx.hideLoading()
}

function showToast(title, icon) {
  wx.showToast({ title, icon: icon || 'none', duration: 2000 })
}

module.exports = {
  formatMatchTime,
  formatCountdown,
  canPredict,
  getMatchStatusText,
  getResultText,
  calcEarnedScore,
  formatRate,
  getStageText,
  buildMatchDisplay,
  callCloud,
  showLoading,
  hideLoading,
  showToast,
}
