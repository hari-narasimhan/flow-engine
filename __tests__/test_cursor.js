const { FlowEngine } = require('../index')
// const Read = require('./tasks/read')
// const ReadAsync = require('./tasks/readAsync')
// const ReadApi = require('./tasks/readApi')
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
      type: 'cursor',
      props: { query: 'SELECT firstname, lastname FROM person.person ORDER BY firstname LIMIT 10', maxRows: 1 }
    },
    {
      id: 'second',
      name: 'secondTask',
      type: 'print',
      // eslint-disable-next-line no-template-curly-in-string
      props: { message: '${message.timesRun + 1} processing person ${message.rows[0].firstname} ${message.rows[0].lastname}' }
    }
    // {
    //     id: 'third',
    //     name: 'thirdTask',
    //     type: 'print',
    //     props: { message: 'done printing the cursor' }
    //   }
  ],
  connections: [
    { source: 'start', target: 'first' },
    { source: 'first', target: 'second', path: 'loop' },
    { source: 'second', target: 'first' }
    // { source: 'first', target: 'third', path: 'end'}
  ]
}
const context = { CONNECTION_STRING: 'postgres://harinarasimhan:@localhost:5432/adventure_works' }
const flowEngine = new FlowEngine({
  flow: complexFlow,
  context,
  tasks: {
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
