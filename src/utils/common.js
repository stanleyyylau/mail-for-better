import http from './httpRequest'

export const replaceOwnedByWithName = async(list) => {
    const res = await http({
        url: http.adornUrl('/sys/user/list'),
        method: 'get',
        params: http.adornParams({
          'page': 1,
          'limit': 99999,
        })
      })
    const users = res.data.page.list
    return list.map(item => ({
        ...item,
        ownedBy: users.filter(user => user.userId === item.ownedBy)[0] ? users.filter(user => user.userId === item.ownedBy)[0].username : ''
      }))
}

export const replaceTagIdWithName = async(list) => {
    const res = await http({
        url: http.adornUrl('/generator/m4gtags/list'),
        method: 'get',
        params: http.adornParams({
          'page': 1,
          'limit': 99999,
        })
      })
    const tags = res.data.page.list
    return list.map(item => ({
        ...item,
        tagId: tags.filter(tag => tag.id === item.tagId)[0] ? tags.filter(tag => tag.id === item.tagId)[0].tag : ''
      }))
}

export const replaceMultiTagIdWithName = async(list) => {
  const res = await http({
      url: http.adornUrl('/generator/m4grealtags/list'),
      method: 'get',
      params: http.adornParams({
        'page': 1,
        'limit': 99999,
      })
    })
  const tags = res.data.page.list
  return list.map(item => ({
      ...item,
      realTags: item.realTags ? item.realTags.map(tagId => {
        return tags.filter(tag => tag.id === tagId)[0] ? tags.filter(tag => tag.id === tagId)[0].tag : ''
      }): []
    }))
}

export const fetchTagOptionsData = async() => {
    const res = await http({
        url: http.adornUrl('/generator/m4gtags/list'),
        method: 'get',
        params: http.adornParams({
          'page': 1,
          'limit': 99999,
        })
      })
    const tags = res.data.page.list
    return tags.map(tag => ({
        label: tag.tag,
        value: tag.id
    }))
}

export const campaignStatusMap = (list) => {
    const statusmap = {
        1: "未发送",
        2: "已定时",
        3: "正在发送",
        4: "发送完成",
        5: "已取消"
    }
    return list.map(item => ({
        ...item,
        status: statusmap[item.status]
    }))
}

export const appendIsOwnerField = async (list) => {
  const res = await http({
    url: http.adornUrl('/sys/user/info'),
    method: 'get',
  })
  const user = res.data.user
  console.log('res', user)
  return list.map(item => ({
    ...item,
    isOwner: user.userId === 1 || user.userId === item.ownedBy
  }))
}