const FlowEngine = require('../index').FlowEngine
const Print = require('./tasks/print')
const { REMOTE_CONNECTION_STRING } = require('./config')

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
      name: 'second',
      type: 'cursor',
      props: { query: 'SELECT firstname, lastname FROM person.person ORDER BY firstname LIMIT 10', maxRows: 1 }
    },
    {
      id: 'third',
      name: 'thirdTask',
      type: 'function',
      props: {
        params: [{
          name: 'firstName',
          type: 'string',
          value: 'ctx.rows[0].firstname'
        }, {
          name: 'lastName',
          type: 'string',
          value: 'ctx.rows[0].lastname'
        }],
        scriptLanguage: 'javascript',
        script: 'let fullName = firstName + \' \' + lastName; return {fullName, score: Math.floor(Math.random() * 100)};',
        results: [{ name: 'fullName', type: 'string', value: 'fullName' }, { name: 'score', type: 'number', value: 'score' }]
      }
    },
    {
      id: 'fourth',
      name: 'fourthTask',
      type: 'print',
      // eslint-disable-next-line no-template-curly-in-string
      props: { message: 'full name is ${ctx.result.fullName}, score is ${ctx.result.score}' }
    },
    {
      id: 'fifth',
      name: 'fifthTask',
      type: 'print',
      props: { message: 'Done printing full name' }
    }
  ],
  connections: [
    { source: 'first', target: 'second' },
    { source: 'second', target: 'third' },
    { source: 'second', target: 'third', path: 'loop' },
    { source: 'third', target: 'fourth' },
    { source: 'fourth', target: 'second' },
    { source: 'second', target: 'fifth', path: 'end' }
  ]
}
const context = { REMOTE_CONNECTION_STRING }
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
  process.exit(1)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})
