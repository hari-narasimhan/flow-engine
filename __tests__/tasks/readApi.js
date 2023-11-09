const Task = require('../../index').Task
const axios = require('axios')

class ReadApi extends Task {
  async run ({ task, context, message } = {}) {
    const url = task.props.url
    const result = await axios.get(url)
    return result.data
  }
}

module.exports = ReadApi
