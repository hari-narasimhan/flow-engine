const { FlowEngine } = require('../index')
const Print = require('./tasks/print')
const sql = `
DROP TABLE IF EXISTS "person"."person_view";
CREATE TABLE "person"."person_view" AS 
  SELECT firstname as first_name, lastname as last_name FROM person.person ORDER BY firstname LIMIT 10; 
  SELECT * FROM "person"."person_view";
`

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
      type: 'transaction',
      props: {}
    },
    {
      id: 'second',
      name: 'secondTask',
      type: 'rawSQL',
      props: { sql, transactionContext: 'first' }
    },
    {
      id: 'third',
      name: 'ThirdTask',
      type: 'print',
      props: { message: 'done transaction' }
    }
  ],
  connections: [
    { source: 'start', target: 'first' },
    { source: 'first', target: 'second', path: 'begin' },
    { source: 'second', target: 'first' },
    { source: 'first', target: 'third', path: 'end' }
  ]
}
const context = { REMOTE_CONNECTION_STRING: 'postgres://aw_app_role:password@localhost:5432/adventure_works' }
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
  process.exit(1)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})
