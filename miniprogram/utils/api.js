const { callCloud } = require('./util')

// 用户登录
function login() {
  return callCloud('login')
}

// 获取比赛列表
function getMatches(params) {
  return callCloud('getMatches', params || {})
}

// 获取单场比赛详情（含好友预测）
function getMatchDetail(matchId) {
  return callCloud('getPredictions', { matchId, type: 'matchDetail' })
}

// 提交/修改预测
function submitPrediction(data) {
  return callCloud('submitPrediction', data)
}

// 获取好友预测列表（单场）
function getFriendPredictions(matchId) {
  return callCloud('getPredictions', { matchId, type: 'friends' })
}

// 获取好友积分排行榜
function getLeaderboard(params) {
  return callCloud('getLeaderboard', params || {})
}

// 获取冠军预测列表（好友）
function getChampionPredictions() {
  return callCloud('getPredictions', { type: 'champion' })
}

// 提交冠军预测
function submitChampionPrediction(teamCode) {
  return callCloud('submitPrediction', { type: 'champion', teamCode })
}

// 创建竞猜群
function createGroup(name) {
  return callCloud('createGroup', { name })
}

// 获取群信息
function getGroupInfo(groupId) {
  return callCloud('getPredictions', { groupId, type: 'group' })
}

// 加入群
function joinGroup(groupId) {
  return callCloud('createGroup', { action: 'join', groupId })
}

// 获取个人战绩
function getMyStats() {
  return callCloud('getPredictions', { type: 'myStats' })
}

module.exports = {
  login,
  getMatches,
  getMatchDetail,
  submitPrediction,
  getFriendPredictions,
  getLeaderboard,
  getChampionPredictions,
  submitChampionPrediction,
  createGroup,
  getGroupInfo,
  joinGroup,
  getMyStats,
}
