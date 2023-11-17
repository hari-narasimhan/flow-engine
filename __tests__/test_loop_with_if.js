const FlowEngine = require('../index').FlowEngine
const Print = require('./tasks/print')

const complexFlow = {
  tasks: [
    {
      id: 'first',
      name: 'firstTask',
      type: 'start',
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
      type: 'print',
      props: { message: 'before if' }
    },
    {
      id: 'fourth',
      name: 'fourthTask',
      type: 'if',
      props: { expr: 'context.second.timesRun !== 3' }
    },
    {
      id: 'fifth',
      name: 'fifthTask',
      type: 'print',
      props: { message: 'if returns true' }
    },
    {
      id: 'sixth',
      name: 'sixthTask',
      type: 'print',
      props: { message: 'if returns false' }
    },
    {
      id: 'seventh',
      name: 'seventhTask',
      type: 'print',
      props: { message: 'after if true' }
    },
    {
      id: 'eighth',
      name: 'eighthTask',
      type: 'print',
      props: { message: 'after if false' }
    },
    {
      id: 'ninth',
      name: 'ninthTask',
      type: 'print',
      props: { message: 'loop completed' }
    }
  ],
  connections: [
    { source: 'first', target: 'second' },
    { source: 'second', target: 'third', path: 'loop' },
    { source: 'third', target: 'fourth' },
    { source: 'fourth', target: 'fifth', path: 'true' },
    { source: 'fourth', target: 'sixth', path: 'false' },
    { source: 'fifth', target: 'seventh' },
    { source: 'sixth', target: 'eighth' },
    { source: 'seventh', target: 'second' },
    { source: 'eighth', target: 'second' },
    { source: 'second', target: 'ninth', path: 'end' }
  ]
}
const context = {}
const flowEngine = new FlowEngine({
  flow: complexFlow,
  context,
  tasks: { print: new Print() }
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
