const FlowEngine = require('../index').FlowEngine
const Read = require('./tasks/read')
const ReadAsync = require('./tasks/readAsync')
const ReadApi = require('./tasks/readApi')

it('should run a simple flow', async (done) => {
  const simpleFlow = {
    nodes: [
      {
        id: 'first',
        name: 'firstNode',
        type: 'readApi',
        props: { url: 'https://randomuser.me/api' }
      },
      {
        id: 'second',
        name: 'secondNode',
        type: 'readAsync',
        props: {}
      },
      {
        id: 'third',
        name: 'thirdNode',
        type: 'readApi',
        props: { url: 'https://randomuser.me/api/' }
      },
      {
        id: 'fourth',
        name: 'fourthNode',
        type: 'read',
        props: {}
      }
    ],
    connections: [
      { source: 'first', target: 'second' },
      { source: 'second', target: 'third' },
      { source: 'third', target: 'fourth' }
    ]
  }
  const context = {}
  const flowEngine = new FlowEngine(
    { flow: simpleFlow,
      context,
      tasks: { read: new Read(), readAsync: new ReadAsync(), readApi: new ReadApi() }       
    })
  // flow.setRunners({ read: new Read(), readAsync: new ReadAsync(), readApi: new ReadApi() })
  const runtime = flowEngine.run()
  runtime.on('end', (result) => {
    // expect(result.message).toEqual({ done: true, async: false })
    console.log(JSON.stringify(result, undefined, 2))
    done()
  })
}, 10000)

it('should run a complex flow', async (done) => {
  const complexFlow = {
    nodes: [
      {
        id: 'first',
        name: 'firstNode',
        type: 'readApi',
        props: { url: 'https://randomuser.me/api' }
      },
      {
        id: 'second',
        name: 'secondNode',
        type: 'readAsync',
        props: {}
      },
      {
        id: 'third',
        name: 'thirdNode',
        type: 'read',
        props: { url: 'https://randomuser.me/api/' }
      },
      {
        id: 'fourth',
        name: 'fourthNode',
        type: 'read',
        props: {}
      }
    ],
    connections: [
      { source: 'first', target: 'second' },
      { source: 'second', target: 'third' },
      { source: 'second', target: 'fourth' }
    ]
  }
  const context = {}
  const flowEngine = new FlowEngine({
    flow: complexFlow,
    context,
    tasks: { read: new Read(), readAsync: new ReadAsync(), readApi: new ReadApi() }
  })
  const runtime = flowEngine.run()
  runtime.on('end', (result) => {
    console.log(JSON.stringify(result, undefined, 2))
    expect(result.message).toEqual({ done: true, async: false })
    console.log('done')
    done()
  })
}, 10000)

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})
