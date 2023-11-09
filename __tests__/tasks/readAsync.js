const Task = require('../../index').Task

const read = async ({ task, context, message }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ done: true, async: true })
    }, task?.props?.delay ? parseInt(task?.props.delay) : 5000)
  })
}

class ReadAsync extends Task {
  async run ({ task, context, message }) {
    const result = await read({ task, context, message })
    return result
  }
}

module.exports = ReadAsync
