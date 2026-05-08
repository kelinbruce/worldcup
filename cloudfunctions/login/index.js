const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID, UNIONID } = cloud.getWXContext()

  try {
    const userRes = await db.collection('users').where({ userId: OPENID }).get()

    if (userRes.data.length === 0) {
      // 新用户，创建档案
      const newUser = {
        userId: OPENID,
        unionId: UNIONID || '',
        nickname: '',
        avatarUrl: '',
        championPick: null,
        totalScore: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        exactScoreCount: 0,
        resultScore: 0,
        exactScore: 0,
        nearScore: 0,
        championScore: 0,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      }
      await db.collection('users').add({ data: newUser })
      return { openId: OPENID, userInfo: newUser, isNew: true }
    }

    const user = userRes.data[0]
    return { openId: OPENID, userInfo: user, isNew: false }
  } catch (err) {
    return { error: err.message }
  }
}
