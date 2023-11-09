const DBTask = require('./DBTask')

class CursorTask extends DBTask {
  get isLoop () {
    return true
  }

  async run ({ task, context, message } = {}) {
    const { query, maxRows } = task?.props
    const { dao, connectionString } = this.getConnectionProps({ task, context })
    try {
      if (!context?.[task.id]) {
        // initialize the cursor
        await dao.createCursor({ name: task.id, query, connectionString })
        context[task.id] = { timesRun: 0 }
      } else {
        context[task.id].timesRun++
      }

      const rows = await dao.readCursor({ name: task.id, maxRows: maxRows || 1 })
      // console.log('rows', rows, context[task.id].timesRun)
      if (rows?.length > 0) {
        return { paths: ['loop'], isRunning: true, rows, timesRun: context[task.id].timesRun }
      } else {
        // close the cursor
        await dao.closeCursor({ name: task.id })
        return { paths: ['end'], isRunning: false }
      }
    } catch (e) {
      await dao.closeCursor({ name: task.id })
      throw e
    }
  }
}

module.exports = CursorTask
