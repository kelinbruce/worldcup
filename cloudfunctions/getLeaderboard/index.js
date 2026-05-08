const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { type, filter, groupId } = event

  try {
    let userIds = []

    if (type === 'group' && groupId) {
      const groupRes = await db.collection('predictionGroups').where({ groupId }).get()
      if (groupRes.data.length === 0) return { list: [] }
      userIds = groupRes.data[0].members
    }
    // 好友榜：由于微信限制，这里返回所有用户，前端配合开放数据API过滤
    // 实际部署时需要通过 wx.getFriendCloudStorage 在客户端获取好友数据
    else {
      const allRes = await db.collection('users')
        .orderBy('totalScore', 'desc')
        .limit(50)
        .get()
      const list = allRes.data.map((u, idx) => ({
        ...u,
        rank: idx + 1,
        isMe: u.userId === OPENID,
      }))
      return { list }
    }

    const usersRes = await db.collection('users')
      .where({ userId: _.in(userIds) })
      .get()
    const sorted = usersRes.data.sort((a, b) => b.totalScore - a.totalScore)
    const list = sorted.map((u, idx) => ({
      ...u,
      rank: idx + 1,
      isMe: u.userId === OPENID,
    }))

    return { list }
  } catch (err) {
    return { error: err.message }
  }
}
