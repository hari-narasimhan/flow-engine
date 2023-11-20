const EventEmitter = require('events')
const Flow = require('./flow')

const STATUS = {
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
}

class Runtime extends EventEmitter {
  constructor ({ flow, context, tasks } = {}) {
    super()
    this._flow = new Flow(flow)
    this._context = context
    this._tasks = tasks
    this._isRunning = false
    this._started = false
    this._completed = false
    this._state = {}
  }

  get context () {
    return this._context
  }

  set context (context) {
    this._context = context
  }

  get flow () {
    return this._flow
  }

  get state () {
    return this._state
  }

  get tasks () {
    return this._tasks
  }

  get startTask () {
    return this.flow.startTask
  }

  get isRunning () {
    return this._isRunning
  }

  set isRunning (isRunning) {
    this._isRunning = isRunning
  }

  allTasksTraversed () {
    const tasksRun = Object.keys(this.state).length
    const completed = Object.keys(this.state).filter((s) => this.state[s].status === STATUS.COMPLETED)
    return completed.length === tasksRun
  }

  start () {
    this.runTask({ task: this.startTask })
    this.isRunning = true
    this.emit('start', { task: this.startTask })
  }

  inboundConnectionsAreValid (ic) {
    let count = 0
    ic.forEach((c) => {
      if (this.state[c] === undefined) {
        count++
      }
    })
    return count === 0
  }

  async runTask ({ task, prevTask, message = {} } = {}) {
    // console.log('run task', task, prevTask, message)
    let canRun = false
    // console.log(task.type, this.tasks.get(task.type))
    if (this.tasks.get(task.type).isLoop || this.tasks.get(task.type).isTransaction) {
      canRun = true
    } else {
      if (prevTask) {
        const _prevTask = this.tasks.get(prevTask.type)
        const inboundConnections = this.flow.getInboundConnections(task.id)
        // If this task accepts many inbound connections from a previous fork,
        // we must ensure all the previous tasks have been completed before running the current task
        if (!this.inboundConnectionsAreValid(inboundConnections)) {
          throw new Error(`Task ${task.id} cannot be run because not all inbound have been run`)
        }
        const allCompleted = inboundConnections.filter((c) => this.state[c].status === STATUS.COMPLETED)
        if (inboundConnections.length === allCompleted.length || _prevTask.isLoop || _prevTask.isTransaction) {
          canRun = true
        }
      } else {
        canRun = true
      }
    }

    if (canRun) {
      this.state[task.id] = { status: STATUS.RUNNING }
      const _task = this.tasks.get(task.type)
      try {
        const result = await _task.run({ task, context: this.context, message })
        await this.completeTask({ task, message: result })
      } catch (error) {
        // If the currently run task is a subtask, identify the parent and notify it of the error
        let transactionRollbackNotImplemented = false
        if (task?.transactionContext) {
          const _transactionTask = this.tasks.get(task.transactionContext)
          if (typeof _transactionTask?.rollback !== 'function') {
            transactionRollbackNotImplemented = true
          }
          await _transactionTask.rollback({ task, context: this.context, message })
        }

        this.emit('error', { error })
        if (transactionRollbackNotImplemented) {
          throw new Error(`Task ${task.transactionContext} is not a transaction task or does not implement a rollback method`)
        }
        throw error
      }
    }
  }

  async completeTask ({ task, message }) {
    // console.log('complete task', task, message)
    if (!message?.isRunning) {
      this.state[task.id].status = STATUS.COMPLETED
    }
    let outboundConnections = []
    if (message?.paths?.length > 0) {
      outboundConnections = this.flow.getOutboundConnectionsByPaths(task.id, message.paths)
    } else {
      outboundConnections = this.flow.getOutboundConnections(task.id)
    }
    outboundConnections.map((outTask) => this.runTask({
      task: this.flow.getTask(outTask),
      prevTask: task,
      message
    }))

    if (this.allTasksTraversed()) {
      this.isRunning = false
      this.emit('end', { message, state: this.state })
    }
  }
}

module.exports = Runtime
