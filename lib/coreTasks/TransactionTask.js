const db = require('../db')
const Task = require('./Task')
const { v4: uuidV4 } = require('uuid')

class TransactionTask extends Task {
  get isTransaction () {
    return true
  }

  async run ({ task, context, message } = {}) {
    try {
      const { CONNECTION_STRING } = context
      if (!context?.[task.id]) {
        // initialize the client
        context[task.id] = { transactionRef: uuidV4(), timesRun: 0 }
        await db.createRemoteDBTransaction({ name: task.id, connectionString: CONNECTION_STRING })
      } else {
        context[task.id].timesRun++
      }

      if (context[task.id].timesRun === 0) {
        return { paths: ['begin'], isRunning: true }
      } else {
        // commit the transaction
        await db.commitRemoteDBTransaction({ name: task.id })
        return { paths: ['end'], isRunning: false }
      }
    } catch (e) {
      await db.rollbackRemoteDBTransaction({ name: task.id })
      throw e
    }
  }

  async rollback ({ task, context, message } = {}) {
    try {
      await db.rollbackRemoteDBTransaction({ name: task.transactionContext })
    } catch (e) {
      throw new Error(`Error rolling back transaction ${task.transactionContext}`)
    }
  }
}

module.exports = TransactionTask
