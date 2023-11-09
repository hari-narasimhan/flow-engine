const { Client } = require('pg')
const Cursor = require('pg-cursor')

const createClient = async ({ connectionString }) => {
  const client = new Client({ connectionString })
  await client.connect()
  return client
}

const createCursor = async ({ query, connectionString }) => {
  const client = await createClient({ connectionString })
  const cursor = client.query(new Cursor(query))
  return { cursor, client }
}

const readCursor = async ({ cursor, maxRows }) => {
  const rows = await cursor.read(maxRows || 1)
  return rows
}

const closeCursor = async ({ cursor }) => {
  await cursor?.close()
  return true
}

const closeClient = async ({ client }) => {
  await client?.end()
  return true
}

const executeRaw = async ({ sql, connectionString }) => {
  const client = new Client({ connectionString })
  try {
    await client.connect()
    const result = await client.query(sql)
    await closeClient({ client })
    return result
  } catch (e) {
    await closeClient({ client })
    throw e
  }
}

const createTransaction = async ({ connectionString }) => {
  const client = await createClient({ connectionString })
  await client.query('BEGIN')
  return client
}

const commitTransaction = async ({ client }) => {
  await client.query('COMMIT')
  await closeClient({ client })
}

const rollbackTransaction = async ({ client }) => {
  await client.query('ROLLBACK')
  await closeClient({ client })
}

const executeInTransaction = async ({ client, sql }) => {
  const result = await client.query(sql)
  return result
}

module.exports = {
  closeClient,
  closeCursor,
  createClient,
  createCursor,
  executeRaw,
  readCursor,
  createTransaction,
  commitTransaction,
  rollbackTransaction,
  executeInTransaction
}
