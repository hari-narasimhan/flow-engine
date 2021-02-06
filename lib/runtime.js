const EventEmitter = require('events')
const Flow = require('./flow')

const STATUS = {
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
}

class Runtime extends EventEmitter {
  constructor ({flow, context, tasks} = {}) {
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

  get startNode () {
    return this.flow.startNode
  }

  get isRunning () {
    return this._isRunning
  }

  set isRunning (isRunning) {
    this._isRunning = isRunning
  }

  allNodesTraversed () {
    const completed = Object.keys(this.state).filter((s) => this.state[s].status === STATUS.COMPLETED)
    return completed.length === this.flow.nodes.length
  }

  start () {
    this.runNode({node: this.startNode})
    this.isRunning = true
    this.emit('start', {node: this.startNode})
  }

  async runNode ({node, prevNode, message = {}} = {}) {
    let canRun = false
    if (prevNode) {
      const inboundConnections = this.flow.getInboundConnections(node.id)
      const allCompleted = inboundConnections.filter((c) => this.state[c].status === STATUS.COMPLETED)
      if (inboundConnections.length === allCompleted.length) {
        canRun = true
      }
    } else {
      canRun = true
    }

    if (canRun) {
      this.state[node.id] = { status: STATUS.RUNNING }
      const task = this.tasks.get(node.type)
      try {
        const result = await task.run({node, context: this.context, message})
        this.completeNode({ node, message: result })
      } catch (error) {
        this.emit('error', { error })
        throw error
      }
    }
  }

  completeNode({node, message}) {
    this.state[node.id].status = STATUS.COMPLETED
    
    const outboundConnections = this.flow.getOutboundConnections(node.id)
    
    if (this.allNodesTraversed()) {
      this.isRunning = false
      this.emit('end', { message })
      return
    }
    
    // We have not reached the end, let us continue
    outboundConnections.map((outNode) => this.runNode({
      node: this.flow.getNode(outNode),
      prevNode: node,
      message
    }))
  }
}

module.exports = Runtime
