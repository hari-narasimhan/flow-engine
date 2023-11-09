const Task = require('./Task')

class StartTask extends Task {
  get isStart () {
    return true
  }

  async run ({ task, context, message } = {}) {
    return { start: true }
  }
}

module.exports = StartTask
