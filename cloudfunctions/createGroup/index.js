const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, name, groupId } = event

  try {
    // 加入已有群组
    if (action === 'join' && groupId) {
      const groupRes = await db.collection('predictionGroups').where({ groupId }).get()
      if (groupRes.data.length === 0) return { error: '群组不存在' }
      const group = groupRes.data[0]
      if (group.members.includes(OPENID)) return { groupId, already: true }
      await db.collection('predictionGroups').where({ groupId }).update({
        data: { members: _.push(OPENID) },
      })
      return { groupId, joined: true }
    }

    // 创建新群组
    const newGroupId = `group_${OPENID.slice(-6)}_${Date.now()}`
    const groupData = {
      groupId: newGroupId,
      name: name || '竞猜群',
      creatorId: OPENID,
      members: [OPENID],
      totalCorrectRate: 0,
      totalMatches: 0,
      memberCount: 1,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    }
    await db.collection('predictionGroups').add({ data: groupData })
    return { groupId: newGroupId, group: groupData }
  } catch (err) {
    return { error: err.message }
  }
}
