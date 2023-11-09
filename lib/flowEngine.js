const Tasks = require('./tasks')

const CursorTask = require('./coreTasks/CursorTask')
const IfTask = require('./coreTasks/IfTask')
const LoopTask = require('./coreTasks/LoopTask')
const RawSQLTask = require('./coreTasks/RawSQLTask')
const StartTask = require('./coreTasks/StartTask')
const TransactionTask = require('./coreTasks/TransactionTask')

const _coreTasks = {
  cursor: new CursorTask(),
  if: new IfTask(),
  loop: new LoopTask(),
  rawSQL: new RawSQLTask(),
  start: new StartTask(),
  transaction: new TransactionTask()
}

const Runtime = require('./Runtime')

class FlowEngine {
  constructor ({ flow, context = {}, tasks }) {
    this._flow = flow
    this._context = context
    this._tasks = new Tasks({ ..._coreTasks, ...tasks })
    this._runtime = new Runtime({ flow: this._flow, context: this._context, tasks: this._tasks })
  }

  get runtime () {
    return this._runtime
  }

  run () {
    try {
      this._runtime.start()
      return this._runtime
    } catch (e) {
      console.log(e)
      process.exit(1)
    }
  }
}

module.exports = FlowEngine
