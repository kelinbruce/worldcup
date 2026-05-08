const api = require('../../utils/api')
const { buildMatchDisplay, formatCountdown, showToast } = require('../../utils/util')
const { getTeam } = require('../../utils/teams')

const app = getApp()

// 世界杯开幕时间 UTC（2026-06-11 20:00 美东时间）
const WORLDCUP_START = new Date('2026-06-12T00:00:00Z').getTime()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    countdown: '',
    championPick: null,
    todayMatches: [],
    loading: true,
  },

  onLoad() {
    this.updateCountdown()
    this.countdownTimer = setInterval(() => this.updateCountdown(), 60000)
  },

  onShow() {
    const { userInfo, isLoggedIn } = app.globalData
    this.setData({ userInfo, isLoggedIn })
    if (isLoggedIn) {
      this.loadData()
    }
  },

  onUnload() {
    clearInterval(this.countdownTimer)
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  updateCountdown() {
    this.setData({ countdown: formatCountdown(WORLDCUP_START) })
  },

  loadData() {
    return Promise.all([
      this.loadTodayMatches(),
      this.loadUserInfo(),
    ])
  },

  loadTodayMatches() {
    return api.getMatches({ filter: 'today' }).then(res => {
      const list = (res.matches || []).map(buildMatchDisplay)
      this.setData({ todayMatches: list, loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  loadUserInfo() {
    return api.getMyStats().then(res => {
      if (res && res.userInfo) {
        const championPick = res.userInfo.championPick
          ? getTeam(res.userInfo.championPick)
          : null
        this.setData({ userInfo: res.userInfo, championPick })
        app.updateUserInfo(res.userInfo)
      }
    }).catch(() => {})
  },

  onLogin() {
    wx.getUserProfile({
      desc: '用于完善竞猜档案',
      success: profileRes => {
        const { nickName, avatarUrl } = profileRes.userInfo
        app.doLogin().then(res => {
          this.setData({ isLoggedIn: true })
          showToast('登录成功')
          this.loadData()
        }).catch(() => showToast('登录失败，请重试'))
      },
      fail: () => showToast('需要授权才能参与竞猜'),
    })
  },

  goChampion() {
    wx.navigateTo({ url: '/pages/champion/index' })
  },

  goMatchDetail(e) {
    const { matchid } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/match-detail/index?matchId=${matchid}` })
  },

  goMatches() {
    wx.switchTab({ url: '/pages/matches/index' })
  },

  onShareAppMessage() {
    return {
      title: '来球友竞猜，一起预测世界杯冠军！',
      path: '/pages/index/index',
    }
  },
})
