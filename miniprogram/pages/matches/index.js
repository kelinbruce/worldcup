const api = require('../../utils/api')
const { buildMatchDisplay, getStageText } = require('../../utils/util')

const STAGES = [
  { key: 'group', label: '小组赛' },
  { key: 'round32', label: '32强' },
  { key: 'round16', label: '16强' },
  { key: 'qf', label: '8强' },
  { key: 'sf', label: '4强' },
  { key: 'final', label: '决赛' },
]

const GROUP_TABS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

Page({
  data: {
    stages: STAGES,
    currentStage: 0,
    groupTabs: GROUP_TABS,
    currentGroup: 0,
    matchGroups: [],
    loading: true,
  },

  onLoad() {
    this.loadMatches()
  },

  onPullDownRefresh() {
    this.loadMatches().then(() => wx.stopPullDownRefresh())
  },

  loadMatches() {
    const stage = STAGES[this.data.currentStage]
    let filter = stage.key
    if (stage.key === 'group') {
      filter = `group_${GROUP_TABS[this.data.currentGroup]}`
    }
    this.setData({ loading: true })
    return api.getMatches({ filter }).then(res => {
      const matches = (res.matches || []).map(buildMatchDisplay)
      // 按日期分组
      const grouped = this.groupByDate(matches)
      this.setData({ matchGroups: grouped, loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  groupByDate(matches) {
    const map = {}
    matches.forEach(m => {
      const date = new Date(m.kickoffTime)
      const key = `${date.getMonth() + 1}月${date.getDate()}日`
      if (!map[key]) map[key] = { date: key, list: [] }
      map[key].list.push(m)
    })
    return Object.values(map)
  },

  onStageChange(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ currentStage: idx, currentGroup: 0 }, () => this.loadMatches())
  },

  onGroupChange(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ currentGroup: idx }, () => this.loadMatches())
  },

  goMatchDetail(e) {
    const { matchid } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/match-detail/index?matchId=${matchid}` })
  },

  isGroupStage() {
    return STAGES[this.data.currentStage].key === 'group'
  },
})
