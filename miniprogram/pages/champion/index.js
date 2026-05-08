const api = require('../../utils/api')
const { getAllTeams } = require('../../utils/teams')
const { showToast, showLoading, hideLoading, formatRate } = require('../../utils/util')

const app = getApp()

Page({
  data: {
    teams: getAllTeams(),
    myPick: null,
    friendPicks: [],
    teamStats: [],
    selectedCode: '',
    submitting: false,
    loading: true,
    activeTab: 'pick',
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    if (!app.globalData.isLoggedIn) {
      showToast('请先登录')
      wx.navigateBack()
    }
  },

  loadData() {
    showLoading()
    return api.getChampionPredictions().then(res => {
      const myPick = res.myPick || null
      const friendPicks = res.friendPicks || []
      const teamStats = this.buildTeamStats(res.stats || {})
      this.setData({
        myPick,
        friendPicks,
        teamStats,
        selectedCode: myPick ? myPick.teamCode : '',
        loading: false,
      })
    }).catch(() => this.setData({ loading: false }))
      .finally(() => hideLoading())
  },

  buildTeamStats(stats) {
    const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1
    return getAllTeams()
      .map(t => ({
        ...t,
        count: stats[t.code] || 0,
        percent: Math.round(((stats[t.code] || 0) / total) * 100),
      }))
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count)
  },

  selectTeam(e) {
    if (this.data.myPick) {
      showToast('冠军预测已提交，不可修改')
      return
    }
    const { code } = e.currentTarget.dataset
    this.setData({ selectedCode: code })
  },

  submitChampionPick() {
    const { selectedCode, submitting, myPick } = this.data
    if (myPick) {
      showToast('已提交冠军预测，不可修改')
      return
    }
    if (!selectedCode) {
      showToast('请选择一支球队')
      return
    }
    if (submitting) return

    wx.showModal({
      title: '确认提交',
      content: '冠军预测提交后不可修改，确认吗？',
      success: res => {
        if (!res.confirm) return
        this.setData({ submitting: true })
        showLoading('提交中...')
        api.submitChampionPrediction(selectedCode).then(result => {
          this.setData({ myPick: result.pick, submitting: false })
          showToast('预测成功！', 'success')
        }).catch(err => {
          this.setData({ submitting: false })
          showToast(err.message || '提交失败')
        }).finally(() => hideLoading())
      },
    })
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },
})
