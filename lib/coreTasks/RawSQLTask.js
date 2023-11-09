const Task = require('./Task')
const db = require('../db')

class RawSQLTask extends Task {
  async run ({ task, context, message } = {}) {
    const { sql, transactionContext } = task.props
    let result = null
    if (!sql) {
      throw new Error('No SQL provided')
    }
    const { CONNECTION_STRING } = context
    if (transactionContext) {
      result = await db.executeInRemoteDBTransactionContext({ name: transactionContext, sql })
    } else {
      result = await db.executeRemoteDBRaw({ sql, connectionString: CONNECTION_STRING })
    }
    return { isRunning: false, result }
  }
}
module.exports = RawSQLTask
