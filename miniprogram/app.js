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
      env: 'YOUR_ENV_ID',
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
      if (result && result.openId) {
        this.globalData.openId = result.openId
        this.globalData.isLoggedIn = true
        wx.setStorageSync('openId', result.openId)
        if (result.userInfo) {
          this.globalData.userInfo = result.userInfo
          wx.setStorageSync('userInfo', result.userInfo)
        }
        return result
      }
      throw new Error('登录失败')
    })
  },

  // 更新本地用户信息
  updateUserInfo(info) {
    this.globalData.userInfo = { ...this.globalData.userInfo, ...info }
    wx.setStorageSync('userInfo', this.globalData.userInfo)
  },
})
