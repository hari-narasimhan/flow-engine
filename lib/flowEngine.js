const Tasks = require('./tasks')
const Runtime = require('./runtime')

class FlowEngine {
  constructor({flow, context = {}, tasks}) {
    this._flow = flow
    this._context = context
    this._tasks = new Tasks(tasks)
    this._runtime = new Runtime({ flow: this._flow, context: this._context, tasks: this._tasks })
  }

  get runtime (){
    return this._runtime
  }

  run () {
    this._runtime.start()
    return this._runtime
  }
}

module.exports = FlowEngine
