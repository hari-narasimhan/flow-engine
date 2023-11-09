const DBTask = require('./DBTask')
class RawSQLTask extends DBTask {
  async run ({ task, context, message } = {}) {
    const { sql, transactionContext } = task.props
    const { dao, connectionString } = this.getConnectionProps({ task, context })
    let result = null
    if (!sql) {
      throw new Error('No SQL provided')
    }

    if (transactionContext) {
      result = await dao.executeInTransaction({ name: transactionContext, sql })
    } else {
      result = await dao.executeRaw({ sql, connectionString })
    }
    return { isRunning: false, result }
  }
}
module.exports = RawSQLTask
