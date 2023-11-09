const DBTask = require('./DBTask')
const { v4: uuidV4 } = require('uuid')

class TransactionTask extends DBTask {
  get isTransaction () {
    return true
  }

  async run ({ task, context, message } = {}) {
    const { dao, connectionString } = this.getConnectionProps({ task, context })
    try {
      if (!context?.[task.id]) {
        // initialize the client
        context[task.id] = { transactionRef: uuidV4(), timesRun: 0 }
        await dao.createTransaction({ name: task.id, connectionString })
      } else {
        context[task.id].timesRun++
      }

      if (context[task.id].timesRun === 0) {
        return { paths: ['begin'], isRunning: true }
      } else {
        // commit the transaction
        await dao.commitTransaction({ name: task.id })
        return { paths: ['end'], isRunning: false }
      }
    } catch (e) {
      await dao.rollbackTransaction({ name: task.id })
      throw e
    }
  }

  async rollback ({ task, context, message } = {}) {
    try {
      const { dao } = this.getConnectionProps({ task, context })
      await dao.rollbackTransaction({ name: task.transactionContext })
    } catch (e) {
      throw new Error(`Error rolling back transaction ${task.transactionContext}`)
    }
  }
}

module.exports = TransactionTask
