const api = require('../../utils/api')
const { buildMatchDisplay, getResultText, showToast, showLoading, hideLoading } = require('../../utils/util')

Page({
  data: {
    matchId: '',
    match: null,
    myPrediction: null,
    friendPredictions: [],
    friendStats: { home_win: [], draw: [], away_win: [] },
    friendStatsPercent: { home_win: 0, draw: 0, away_win: 0 },
    selectedResult: '',
    homeScoreInput: '',
    awayScoreInput: '',
    submitting: false,
    showFriends: false,
    loading: true,
  },

  onLoad(options) {
    const matchId = options.matchId
    this.setData({ matchId })
    this.loadData(matchId)
  },

  onPullDownRefresh() {
    this.loadData(this.data.matchId).then(() => wx.stopPullDownRefresh())
  },

  loadData(matchId) {
    showLoading()
    return api.getMatchDetail(matchId).then(res => {
      const match = buildMatchDisplay(res.match)
      const myPrediction = res.myPrediction || null
      const friendPredictions = res.friendPredictions || []
      const friendStats = this.buildFriendStats(friendPredictions)

      this.setData({
        match,
        myPrediction,
        friendPredictions,
        friendStats: friendStats.grouped,
        friendStatsPercent: friendStats.percent,
        selectedResult: myPrediction ? myPrediction.result : '',
        homeScoreInput: myPrediction && myPrediction.homeScore !== null ? String(myPrediction.homeScore) : '',
        awayScoreInput: myPrediction && myPrediction.awayScore !== null ? String(myPrediction.awayScore) : '',
        loading: false,
      })
    }).catch(() => {
      this.setData({ loading: false })
      showToast('加载失败，请重试')
    }).finally(() => hideLoading())
  },

  buildFriendStats(friends) {
    const grouped = { home_win: [], draw: [], away_win: [] }
    friends.forEach(f => {
      if (grouped[f.result]) grouped[f.result].push(f)
    })
    const total = friends.length || 1
    const percent = {
      home_win: Math.round((grouped.home_win.length / total) * 100),
      draw: Math.round((grouped.draw.length / total) * 100),
      away_win: Math.round((grouped.away_win.length / total) * 100),
    }
    return { grouped, percent }
  },

  selectResult(e) {
    const { result } = e.currentTarget.dataset
    if (!this.data.match.predictable) return
    this.setData({ selectedResult: result })
  },

  onHomeScoreInput(e) {
    this.setData({ homeScoreInput: e.detail.value })
  },

  onAwayScoreInput(e) {
    this.setData({ awayScoreInput: e.detail.value })
  },

  submitPrediction() {
    const { selectedResult, homeScoreInput, awayScoreInput, matchId, submitting } = this.data
    if (submitting) return
    if (!selectedResult) {
      showToast('请选择胜平负结果')
      return
    }

    const homeScore = homeScoreInput !== '' ? parseInt(homeScoreInput) : null
    const awayScore = awayScoreInput !== '' ? parseInt(awayScoreInput) : null

    if ((homeScoreInput !== '' && isNaN(homeScore)) || (awayScoreInput !== '' && isNaN(awayScore))) {
      showToast('请输入有效比分')
      return
    }

    this.setData({ submitting: true })
    showLoading('提交中...')

    api.submitPrediction({
      matchId,
      result: selectedResult,
      homeScore,
      awayScore,
    }).then(res => {
      this.setData({ myPrediction: res.prediction, submitting: false })
      showToast('预测成功！', 'success')
    }).catch(err => {
      this.setData({ submitting: false })
      showToast(err.message || '提交失败，请重试')
    }).finally(() => hideLoading())
  },

  toggleFriends() {
    this.setData({ showFriends: !this.data.showFriends })
  },

  getResultText(result) {
    return getResultText(result)
  },

  onShareAppMessage() {
    const { match } = this.data
    if (!match) return {}
    return {
      title: `${match.homeTeamInfo.flag}${match.homeTeamInfo.name} VS ${match.awayTeamInfo.flag}${match.awayTeamInfo.name}，快来竞猜！`,
      path: `/pages/match-detail/index?matchId=${match.matchId}`,
    }
  },
})
