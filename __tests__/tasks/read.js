const Task = require('../../index').Task

class Read extends Task {
  async run ({node, context, message} = {}) {
    return { done: true, async: false }
  }
}

module.exports = Read
