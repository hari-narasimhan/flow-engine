const createClient = async ({ connectionString }) => {
  throw new Error('Not implemented')
}

const createCursor = async ({ query, maxRows, client }) => {
  throw new Error('Not implemented')
}

const readCursor = async ({ cursor, maxRows }) => {
  throw new Error('Not implemented')
}

const closeCursor = async ({ cursor }) => {
  throw new Error('Not implemented')
}

const closeClient = async ({ client }) => {
  throw new Error('Not implemented')
}

module.exports = {
  closeClient,
  closeCursor,
  createClient,
  createCursor,
  readCursor
}
