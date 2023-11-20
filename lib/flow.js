class Flow {
  constructor (flow) {
    this._flow = flow
  }

  get flow () {
    return this._flow || {}
  }

  get tasks () {
    return this._flow.tasks || []
  }

  get connections () {
    return this._flow.connections || []
  }

  getTask (id) {
    return this.tasks.find((n) => n.id === id)
  }

  getTaskByName (name) {
    return this.tasks.find((n) => n.name === name)
  }

  getInboundConnections (taskId) {
    return this.connections.filter((c) => c.target === taskId).map(n => n.source)
  }

  getOutboundConnections (taskId) {
    return this.connections.filter((c) => c.source === taskId).map(n => n.target)
  }

  getOutboundConnectionsByPaths (taskId, paths = []) {
    return this.connections
      .filter(c => c.source === taskId && paths.includes(c.path))
      .map(n => n.target)
  }

  getSubtaskParent (taskId) {
    // iterate the connections and find the parent task which is a transaction
    const inboundConnections = this.getInboundConnections(taskId)
    // For a subtask, there should only be one inbound connection
    if (inboundConnections.length !== 1) {
      return null
    }
    while (true) {
      const parentTask = this.getTask(inboundConnections[0])
      if (parentTask.isTransaction) {
        return parentTask
      }
    }
  }

  get startTask () {
    // Find a task with no inbound connections
    const starts = this.tasks.filter((n) => {
      const inbound = this.getInboundConnections(n.id)
      return inbound.length === 0
    })
    if (starts.length > 1) {
      throw new Error('FlowEngine does not support multiple start tasks')
    }

    return starts[0] || null
  }

  get endTask () {
    const tasksCount = this.tasks.length
    if (tasksCount === 0) {
      return null
    }
    return this.tasks[tasksCount - 1]
  }
}

module.exports = Flow
