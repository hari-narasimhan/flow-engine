'use strict'
const Task = require('../../index').Task

class If extends Task {
  async run ({ task, context, message } = {}) {
    const expr = task.props.expr
    // Eval is dangerous
    // eslint-disable-next-line no-eval
    const path = eval(expr) ? task?.props.truthPath || 'true' : task.props.falsePath || 'false'
    return { paths: [path] }
  }
}

module.exports = If
