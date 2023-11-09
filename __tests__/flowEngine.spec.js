const FlowEngine = require('../index').FlowEngine
const Read = require('./tasks/read')
const ReadAsync = require('./tasks/readAsync')
const ReadApi = require('./tasks/readApi')

it('should run a simple flow', (done) => {
  const simpleFlow = {
    tasks: [
      {
        id: 'first',
        name: 'firstTask',
        type: 'readApi',
        props: { url: 'https://randomuser.me/api' }
      },
      {
        id: 'second',
        name: 'secondTask',
        type: 'readAsync',
        props: {}
      },
      {
        id: 'third',
        name: 'thirdTask',
        type: 'readApi',
        props: { url: 'https://randomuser.me/api/' }
      },
      {
        id: 'fourth',
        name: 'fourthTask',
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
    {
      flow: simpleFlow,
      context,
      tasks: { read: new Read(), readAsync: new ReadAsync(), readApi: new ReadApi() }
    })
  // flow.setRunners({ read: new Read(), readAsync: new ReadAsync(), readApi: new ReadApi() })
  const runtime = flowEngine.run()
  runtime.on('end', (result) => {
    expect(result.state).toEqual(
      {
        first: { status: 'COMPLETED' },
        second: { status: 'COMPLETED' },
        third: { status: 'COMPLETED' },
        fourth: { status: 'COMPLETED' }
      }
    )
    done()
  })
}, 10000)

it('should run a complex flow', (done) => {
  const complexFlow = {
    tasks: [
      {
        id: 'first',
        name: 'firstTask',
        type: 'readApi',
        props: { url: 'https://randomuser.me/api/' }
      },
      {
        id: 'second',
        name: 'secondTask',
        type: 'readAsync',
        props: {}
      },
      {
        id: 'third',
        name: 'thirdTask',
        type: 'read',
        props: { url: 'https://randomuser.me/api/' }
      },
      {
        id: 'fourth',
        name: 'fourthTask',
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
  // const runtime =
  flowEngine.runtime.on('end', (result) => {
    console.log('runtime::end::complex', JSON.stringify(result, undefined, 2))
    console.log('message', result.message)
    expect(result.state).toEqual(
      {
        first: { status: 'COMPLETED' },
        second: { status: 'COMPLETED' },
        third: { status: 'COMPLETED' },
        fourth: { status: 'COMPLETED' }
      }
    )
    done()
  })
  flowEngine.run()
}, 10000)

it('should run a complex flow with fork and join', (done) => {
  const complexFlow = {
    tasks: [
      {
        id: 'first',
        name: 'firstTask',
        type: 'readApi',
        props: { url: 'https://randomuser.me/api/' }
      },
      {
        id: 'second',
        name: 'secondTask',
        type: 'readAsync',
        props: {}
      },
      {
        id: 'third',
        name: 'thirdTask',
        type: 'read',
        props: { url: 'https://randomuser.me/api/' }
      },
      {
        id: 'fourth',
        name: 'fourthTask',
        type: 'read',
        props: {}
      },
      {
        id: 'fifth',
        name: 'fifthTask',
        type: 'readAsync',
        props: {}
      }
    ],
    connections: [
      { source: 'first', target: 'second' },
      { source: 'second', target: 'third' },
      { source: 'second', target: 'fourth' },
      { source: 'third', target: 'fifth' },
      { source: 'fourth', target: 'fifth' }

    ]
  }
  const context = {}
  const flowEngine = new FlowEngine({
    flow: complexFlow,
    context,
    tasks: { read: new Read(), readAsync: new ReadAsync(), readApi: new ReadApi() }
  })
  flowEngine.runtime.on('end', (result) => {
    console.log('runtime::end::fork-join', JSON.stringify(result, undefined, 2))
    console.log('message', result.message)
    expect(result.state).toEqual(
      {
        first: { status: 'COMPLETED' },
        second: { status: 'COMPLETED' },
        third: { status: 'COMPLETED' },
        fourth: { status: 'COMPLETED' },
        fifth: { status: 'COMPLETED' }
      }
    )
    done()
  })
  flowEngine.run()
}, 20000)

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})
