class Flow {
  constructor (flow) {
    this._flow = flow
  }

  get flow () {
    return this._flow || {}
  }

  get nodes () {
    return this._flow.nodes || []
  }

  get connections () {
    return this._flow.connections || [] 
  }

  getNode (id) {
    return this.nodes.find((n) => n.id === id)
  }

  getInboundConnections (nodeId) {
    return this.connections.filter((c) => c.target === nodeId).map(n => n.source)
  }

  getOutboundConnections (nodeId) {
    return this.connections.filter((c) => c.source === nodeId).map(n => n.target)
  }

  get startNode () {
    // Find a node with no inbound connections
    const starts = this.nodes.filter((n) => {
      const inbound = this.getInboundConnections(n.id)
      return inbound.length === 0
    })
    if (starts.length > 1) {
      throw new Error('FlowEngine does not support multiple start nodes')
    }

    return starts[0] || null
  }
  
  get endNode() {
    const nodesCount = this.nodes.length
    if (nodesCount === 0) {
      return null
    }
    return this.nodes[nodesCount - 1]
  }
}

module.exports = Flow
