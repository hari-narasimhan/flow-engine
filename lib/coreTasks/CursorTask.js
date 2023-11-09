const db = require('../db')
const LoopTask = require('./LoopTask')

class CursorTask extends LoopTask {
  async run ({ task, context, message } = {}) {
    try {
      const { query, maxRows } = task?.props
      const { CONNECTION_STRING } = context

      if (!context?.[task.id]) {
        // initialize the cursor
        await db.createRemoteDBCursor({ name: task.id, query, connectionString: CONNECTION_STRING })
        context[task.id] = { timesRun: 0 }
      } else {
        context[task.id].timesRun++
      }

      const rows = await db.readRemoteDBCursor({ name: task.id, maxRows: maxRows || 1 })
      // console.log('rows', rows, context[task.id].timesRun)
      if (rows?.length > 0) {
        return { paths: ['loop'], isRunning: true, rows, timesRun: context[task.id].timesRun }
      } else {
        // close the cursor
        await db.closeRemoteDBCursor({ name: task.id })
        return { paths: ['end'], isRunning: false }
      }
    } catch (e) {
      await db.closeRemoteDBCursor({ name: task.id })
      throw e
    }
  }
}

module.exports = CursorTask
