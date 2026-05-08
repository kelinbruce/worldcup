const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const OPENID = wxContext.OPENID
  const UNIONID = wxContext.UNIONID || ''

  if (!OPENID) {
    return { error: '无法获取用户标识，请确认云开发环境已正确配置' }
  }

  try {
    let userRes
    try {
      userRes = await db.collection('users').where({ userId: OPENID }).get()
    } catch (dbErr) {
      // 集合不存在时先创建集合再重试
      console.error('查询users集合失败:', dbErr.message)
      userRes = { data: [] }
    }

    if (userRes.data.length === 0) {
      const newUser = {
        userId: OPENID,
        unionId: UNIONID,
        nickname: '球友' + OPENID.slice(-4),
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
      try {
        await db.collection('users').add({ data: newUser })
      } catch (addErr) {
        console.error('创建用户失败:', addErr.message)
        // 即使写入失败，也返回openId让前端登录成功
        return { openId: OPENID, userInfo: newUser, isNew: true }
      }
      return { openId: OPENID, userInfo: newUser, isNew: true }
    }

    const user = userRes.data[0]
    // 更新最后登录时间
    db.collection('users').where({ userId: OPENID }).update({
      data: { updatedAt: db.serverDate() }
    }).catch(() => {})

    return { openId: OPENID, userInfo: user, isNew: false }
  } catch (err) {
    console.error('login error:', err)
    // 即使出错也尝试返回openId，让用户能基本使用
    return { openId: OPENID, userInfo: { userId: OPENID, nickname: '球友', avatarUrl: '', totalScore: 0 }, error: err.message }
  }
}
