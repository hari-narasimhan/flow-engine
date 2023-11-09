const Task = require('../../index').Task

class CapitalizeUser extends Task {
  async run ({ task, context, message } = {}) {
    return { title: message.title, first: message.first.toUpperCase(), last: message.last.toUpperCase() }
  }
}

module.exports = CapitalizeUser
