const LoopTask = require('../../index').LoopTask

class Loop extends LoopTask {
  async run ({ task, context, message } = {}) {
    const count = task.props.count
    if (!context?.[task.id]) {
      context[task.id] = { timesRun: 0 }
    } else {
      context[task.id].timesRun++
    }
    if (context[task.id].timesRun < count) {
      return { paths: ['loop'], isRunning: true }
    } else {
      return { paths: ['end'], isRunning: false }
    }
  }
}

module.exports = Loop
