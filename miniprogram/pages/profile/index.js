const api = require('../../utils/api')
const { formatRate, buildMatchDisplay, showToast } = require('../../utils/util')
const { getTeam } = require('../../utils/teams')

const app = getApp()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    stats: null,
    historyPredictions: [],
    loading: true,
    activeTab: 'stats',
  },

  onShow() {
    const { userInfo, isLoggedIn } = app.globalData
    this.setData({ userInfo, isLoggedIn })
    if (isLoggedIn) this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  loadData() {
    this.setData({ loading: true })
    return api.getMyStats().then(res => {
      const stats = res.userInfo || null
      const championTeam = stats && stats.championPick ? getTeam(stats.championPick) : null
      const history = (res.history || []).map(p => ({
        ...p,
        match: buildMatchDisplay(p.match),
      }))
      this.setData({ stats, championTeam, historyPredictions: history, loading: false })
      if (stats) app.updateUserInfo(stats)
    }).catch(() => this.setData({ loading: false }))
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  onLogin() {
    wx.getUserProfile({
      desc: '用于完善竞猜档案',
      success: () => {
        app.doLogin().then(() => {
          this.setData({ isLoggedIn: true })
          this.loadData()
        }).catch(() => showToast('登录失败'))
      },
    })
  },

  goMatchDetail(e) {
    const { matchid } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/match-detail/index?matchId=${matchid}` })
  },
})
