const Task = require('../../index').Task

class CapitalizeUser extends Task {
  async run ({node, context, message} = {}) {
    return {title: message.title, first: message.first.toUpperCase(), last: message.last.toUpperCase()}
  }
}

module.exports = CapitalizeUser
