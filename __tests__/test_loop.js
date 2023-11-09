const { FlowEngine } = require('../index')
const Read = require('./tasks/read')
const ReadAsync = require('./tasks/readAsync')
const ReadApi = require('./tasks/readApi')
// const IfTask = require('./tasks/if')
const Print = require('./tasks/print')
// const Loop = require('./tasks/loop')

const complexFlow = {
  tasks: [
    {
      id: 'start',
      name: 'startTask',
      type: 'start',
      props: { name: 'startTask', description: 'Starting complex task' }
    },
    {
      id: 'first',
      name: 'firstTask',
      type: 'read',
      props: {}
    },
    {
      id: 'second',
      name: 'secondTask',
      type: 'loop',
      props: { count: 10 }
    },
    {
      id: 'third',
      name: 'thirdTask',
      type: 'readApi',
      path: 'loop',
      props: { url: 'https://randomuser.me/api/' }
    },
    {
      id: 'fourth',
      name: 'fourthTask',
      type: 'print',
      props: { message: 'printing inside loop' }
    },
    {
      id: 'fifth',
      name: 'fifthTask',
      type: 'print',
      path: 'end',
      props: { message: 'loop completed' }
    }
  ],
  connections: [
    { source: 'start', target: 'first' },
    { source: 'first', target: 'second' },
    { source: 'second', target: 'third', path: 'loop' },
    { source: 'third', target: 'fourth' },
    { source: 'fourth', target: 'second' },
    { source: 'second', target: 'fifth', path: 'end' }

  ]
}
const context = {}
const flowEngine = new FlowEngine({
  flow: complexFlow,
  context,
  tasks: {
    read: new Read(),
    readAsync: new ReadAsync(),
    readApi: new ReadApi(),
    print: new Print()
  }
})
const runtime = flowEngine.run()
runtime.on('end', (result) => {
  console.log(JSON.stringify(result, undefined, 2))
  // console.log('result', result)
  // expect(result.message).toEqual({ done: true, async: false })
  console.log('done')
  // done()
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})
