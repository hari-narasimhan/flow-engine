const Task = require('../../index').Task
const axios = require('axios')

class ReadApi extends Task {
  async run ({node, context, message} = {}) {
    const url = node.props.url
    const result = await axios.get(url)
    return result.data
  }
}

module.exports = ReadApi
