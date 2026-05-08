const api = require('../../utils/api')
const { formatRate, showToast, showLoading, hideLoading } = require('../../utils/util')

const app = getApp()

Page({
  data: {
    myGroups: [],
    currentGroup: null,
    groupLeaderboard: [],
    groupMatches: [],
    loading: true,
    view: 'list',
    creating: false,
    groupName: '',
  },

  onLoad(options) {
    if (options.groupId) {
      this.loadGroupDetail(options.groupId)
    } else {
      this.loadMyGroups()
    }
  },

  onPullDownRefresh() {
    if (this.data.view === 'list') {
      this.loadMyGroups().then(() => wx.stopPullDownRefresh())
    } else {
      this.loadGroupDetail(this.data.currentGroup.groupId)
        .then(() => wx.stopPullDownRefresh())
    }
  },

  loadMyGroups() {
    this.setData({ loading: true })
    return api.getMyGroups().then(res => {
      this.setData({ myGroups: res.groups || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  loadGroupDetail(groupId) {
    showLoading()
    this.setData({ loading: true })
    return api.getGroupInfo(groupId).then(res => {
      const board = (res.leaderboard || []).map((item, idx) => ({
        ...item,
        rank: idx + 1,
        rateText: formatRate(item.correctPredictions, item.totalPredictions),
      }))
      this.setData({
        currentGroup: res.group,
        groupLeaderboard: board,
        groupMatches: res.recentMatches || [],
        view: 'detail',
        loading: false,
      })
    }).catch(() => this.setData({ loading: false }))
      .finally(() => hideLoading())
  },

  enterGroup(e) {
    const { groupid } = e.currentTarget.dataset
    this.loadGroupDetail(groupid)
  },

  backToList() {
    this.setData({ view: 'list' })
    this.loadMyGroups()
  },

  onGroupNameInput(e) {
    this.setData({ groupName: e.detail.value })
  },

  createGroup() {
    const { groupName, creating } = this.data
    if (!groupName.trim()) {
      showToast('请输入群组名称')
      return
    }
    if (creating) return
    this.setData({ creating: true })
    showLoading('创建中...')
    api.createGroup(groupName.trim()).then(res => {
      this.setData({ creating: false, groupName: '' })
      showToast('创建成功！', 'success')
      this.loadGroupDetail(res.groupId)
    }).catch(err => {
      this.setData({ creating: false })
      showToast(err.message || '创建失败')
    }).finally(() => hideLoading())
  },

  shareGroup() {
    const { currentGroup } = this.data
    wx.showShareMenu({ withShareTicket: true })
  },

  onShareAppMessage() {
    const { currentGroup } = this.data
    if (currentGroup) {
      return {
        title: `加入「${currentGroup.name}」世界杯竞猜群，一起玩！`,
        path: `/pages/group/index?groupId=${currentGroup.groupId}`,
      }
    }
    return { title: '球友竞猜 - 世界杯竞猜', path: '/pages/index/index' }
  },
})
