const Task = require('./Task')
const db = require('../db')

class DBTask extends Task {
  getConnectionProps ({ task, context }) {
    const { dataLocation = 'remote' } = task.props
    const dao = db[dataLocation]
    const { REMOTE_CONNECTION_STRING, LOCAL_CONNECTION_STRING } = context
    const connectionString = dataLocation === 'remote' ? REMOTE_CONNECTION_STRING : LOCAL_CONNECTION_STRING
    return { dao, connectionString }
  }

  async run (options = {}) {
    // To be implemented by the derived class
    throw new Error('DBTask.run() must be implemented by the derived class')
  }
}

module.exports = DBTask
