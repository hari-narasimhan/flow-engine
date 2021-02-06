class Tasks {
  constructor (tasks = {}) {
    this._tasks = tasks
  }

  get (name) {
    return this._tasks[name] || null
  }
}

module.exports = Tasks
