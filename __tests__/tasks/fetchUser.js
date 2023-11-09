const Task = require('../../index').Task
const axios = require('axios')

class FetchUser extends Task {
  async run ({ task, context, message } = {}) {
    const url = task.props.url
    const result = await axios.get(url)
    return result.data.results[0].name
  }
}

module.exports = FetchUser
