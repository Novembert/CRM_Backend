exports.likeRelation = (value) => {
  return value ? {
    $regex: '.*' + value + '.*'
  } : null
}

exports.clearFilters = (obj) => {
  let keys = Object.keys(obj)
  for (let i = 0; i < keys.length ; i++) {
    if (obj[keys[i]] == null) {
      delete obj[keys[i]]
    }
  }
  return obj
}

exports.calculateSkip = (page, paginate) => {
  return page && paginate ? (page - 1) * paginate : 0
}

exports.generateOrder = (order, orderType) => {
  return {[`${order}`]: orderType == 'asc' ? 1 : -1}
}