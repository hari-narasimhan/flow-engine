const FlowEngine = require('../index').FlowEngine
const Read = require('./tasks/read')
const ReadAsync = require('./tasks/readAsync')
const ReadApi = require('./tasks/readApi')
const Print = require('./tasks/print')

const complexFlow = {
  tasks: [
    {
      id: 'first',
      name: 'firstTask',
      type: 'read',
      props: {}
    },
    {
      id: 'second',
      name: 'secondTask',
      type: 'readApi',
      props: { url: 'https://randomuser.me/api/?gender=female' }
    },
    {
      id: 'third',
      name: 'thirdTask',
      type: 'readAsync',
      props: { delay: 1000 }
    },
    {
      id: 'fourth',
      name: 'fourthTask',
      type: 'if',
      props: { expr: 'message.results[0].gender === \'male\'' }
    },
    {
      id: 'fifth',
      name: 'fifthTask',
      type: 'print',
      path: 'true',
      props: { message: 'the user is male' }
    },
    {
      id: 'sixth',
      name: 'sixthTask',
      type: 'print',
      path: 'false',
      props: { message: 'the user is female' }
    }
  ],
  connections: [
    { source: 'first', target: 'second' },
    { source: 'second', target: 'third' },
    { source: 'second', target: 'fourth' },
    { source: 'fourth', target: 'fifth', path: 'true' },
    { source: 'fourth', target: 'sixth', path: 'false' }

  ]
}
const context = {}
const flowEngine = new FlowEngine({
  flow: complexFlow,
  context,
  tasks: { read: new Read(), readAsync: new ReadAsync(), readApi: new ReadApi(), print: new Print() }
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
