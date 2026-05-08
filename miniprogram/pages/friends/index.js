const api = require('../../utils/api')
const { formatRate } = require('../../utils/util')

Page({
  data: {
    activeTab: 'leaderboard',
    filterTab: 'all',
    leaderboard: [],
    loading: true,
    myRank: null,
  },

  onLoad() {
    this.loadLeaderboard()
  },

  onPullDownRefresh() {
    this.loadLeaderboard().then(() => wx.stopPullDownRefresh())
  },

  loadLeaderboard() {
    this.setData({ loading: true })
    return api.getLeaderboard({ type: 'friends', filter: this.data.filterTab })
      .then(res => {
        const list = (res.list || []).map((item, idx) => ({
          ...item,
          rank: idx + 1,
          rateText: formatRate(item.correctPredictions, item.totalPredictions),
          isMe: item.isMe || false,
        }))
        const myRank = list.find(i => i.isMe)
        this.setData({ leaderboard: list, myRank, loading: false })
      })
      .catch(() => this.setData({ loading: false }))
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ filterTab: filter }, () => this.loadLeaderboard())
  },
})
