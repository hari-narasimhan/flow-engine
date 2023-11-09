const { Client } = require('pg')
const Cursor = require('pg-cursor')

const Task = require('./Task')

class CursorTask extends Task {
  get isLoop () {
    return true
  }

  async run ({ task, context, message } = {}) {
    try {
      const { query, maxRows } = task?.props
      const { CONNECTION_STRING } = context
      if (!context?.[task.id]) {
        // initialize the cursor
        const client = new Client({ connectionString: CONNECTION_STRING })
        await client.connect()
        const cursor = client.query(new Cursor(query))
        context[task.id] = { timesRun: 0, client, cursor }
      } else {
        context[task.id].timesRun++
      }

      const { client, cursor } = context[task.id]
      const rows = await cursor.read(maxRows || 1)
      // console.log('rows', rows, context[task.id].timesRun)
      if (rows?.length > 0) {
        return { paths: ['loop'], isRunning: true, rows, timesRun: context[task.id].timesRun }
      } else {
        await cursor.close()
        await client.end()
        return { paths: ['end'], isRunning: false }
      }
    } catch (e) {
      const { client, cursor } = context[task.id]
      await cursor.close()
      await client.end()
    }
  }
}

module.exports = CursorTask
