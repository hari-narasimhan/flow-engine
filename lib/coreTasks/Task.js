'use strict'
class Task {
  async run (options = {}) {
    // To be implemented by the derived class
    throw new Error('Task.run() must be implemented by the derived class')
  }
}

module.exports = Task
