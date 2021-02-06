const Task = require('../../index').Task

class ReadAsync extends Task {
  run ({node, context, message}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({done: true, async: true})
      }, 5000)
    })
  }
}

module.exports = ReadAsync
