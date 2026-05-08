const api = require('./utils/api')

App({
  globalData: {
    userInfo: null,
    openId: null,
    isLoggedIn: false,
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'cloud1-d7gcq7de67f18291b',
      traceUser: true,
    })
    this.checkLogin()
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    const openId = wx.getStorageSync('openId')
    if (userInfo && openId) {
      this.globalData.userInfo = userInfo
      this.globalData.openId = openId
      this.globalData.isLoggedIn = true
    }
  },

  // 登录并拉取用户信息，返回 Promise
  doLogin() {
    return api.login().then(result => {
      console.log('云函数login返回:', JSON.stringify(result))
      if (result && result.openId) {
        this.globalData.openId = result.openId
        this.globalData.isLoggedIn = true
        wx.setStorageSync('openId', result.openId)
        const userInfo = result.userInfo || { userId: result.openId, nickname: '球友', avatarUrl: '', totalScore: 0 }
        this.globalData.userInfo = userInfo
        wx.setStorageSync('userInfo', userInfo)
        return result
      }
      console.error('login result无效:', JSON.stringify(result))
      throw new Error(result && result.error ? result.error : '登录失败，请检查云函数是否已上传')
    })
  },

  // 更新本地用户信息
  updateUserInfo(info) {
    this.globalData.userInfo = { ...this.globalData.userInfo, ...info }
    wx.setStorageSync('userInfo', this.globalData.userInfo)
  },
})
