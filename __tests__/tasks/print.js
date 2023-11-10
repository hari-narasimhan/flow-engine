'use strict'
const Task = require('../../index').Task

class Print extends Task {
  _print (task, ctx) {
    // eslint-disable-next-line no-eval
    return eval('`' + task.props.message + '`')
  }

  async run ({ task, context, message } = {}) {
    console.log(this._print(task, message))
  }
}

module.exports = Print
