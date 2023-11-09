const clients = {}
const cursors = {}

// eslint-disable-next-line no-unused-vars
const localDBProvider = require(`./providers/${process.env.LOCAL_DB_PROVIDER || 'sqlite3'}`)
const remoteDBProvider = require(`./providers/${process.env.REMOTE_DB_PROVIDER || 'pg'}`)

const createLocalDBClient = ({ name }) => {
  throw new Error('Not implemented')
}

const createLocalDBCursor = ({ name, connectionString }) => {
  throw new Error('Not implemented')
}

const createRemoteDBClient = async ({ name, connectionString }) => {
  if (clients[name]) { return clients[name] }
  const client = await remoteDBProvider.createClient({ connectionString })
  clients[name] = client
  return client
}

const createRemoteDBCursor = async ({ name, query, connectionString }) => {
  if (cursors[name]) {
    throw new Error(`Cursor ${name} already exists`)
  }
  // console.log('createRemoteDBCursor', name, query, connectionString)
  // const client = await createRemoteDBClient({name, connectionString})
  const { client, cursor } = await remoteDBProvider.createCursor({ name, query, connectionString })
  cursors[name] = cursor
  clients[name] = client
  return cursor
}

const getRemoteDBCursor = ({ name }) => {
  return cursors[name]
}

const closeRemoteDBCursor = async ({ name }) => {
  await remoteDBProvider.closeCursor({ cursor: cursors[name] })
  await remoteDBProvider.closeClient({ client: clients[name] })
}

const readRemoteDBCursor = ({ name, maxRows }) => {
  return remoteDBProvider.readCursor({ cursor: cursors[name], maxRows })
}

const executeRemoteDBRaw = async ({ sql, connectionString }) => {
  const result = await remoteDBProvider.executeRaw({ sql, connectionString })
  return result
}

const createRemoteDBTransaction = async ({ name, connectionString }) => {
  console.log('createRemoteDBTransaction', name, connectionString)
  const client = await remoteDBProvider.createClient({ connectionString })
  clients[name] = client
  return client
}

const commitRemoteDBTransaction = async ({ name }) => {
  const client = clients[name]
  await remoteDBProvider.commitTransaction({ client })
}

const rollbackRemoteDBTransaction = async ({ name }) => {
  const client = clients[name]
  await remoteDBProvider.rollbackTransaction({ client })
}

const executeInRemoteDBTransactionContext = async ({ name, sql }) => {
  const client = clients[name]
  if (!client) {
    throw new Error(`No transaction context found for ${name}`)
  }
  const result = await remoteDBProvider.executeInTransaction({ client, sql })
  return result
}
module.exports = {
  createLocalDBClient,
  createLocalDBCursor,
  createRemoteDBClient,
  createRemoteDBCursor,
  getRemoteDBCursor,
  closeRemoteDBCursor,
  readRemoteDBCursor,
  executeRemoteDBRaw,
  createRemoteDBTransaction,
  commitRemoteDBTransaction,
  rollbackRemoteDBTransaction,
  executeInRemoteDBTransactionContext
}
