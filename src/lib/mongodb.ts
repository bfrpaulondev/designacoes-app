import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

// Extend global type
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

async function createClient(): Promise<MongoClient> {
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 1,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  })
  
  await client.connect()
  console.log('[MongoDB] New client connected')
  return client
}

export async function getMongoClient(): Promise<MongoClient> {
  // In development, use global to preserve across HMR
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClient()
    }
    return global._mongoClientPromise
  }
  
  // In production (Vercel serverless), create new connection each time
  // This is because serverless functions may have cold starts
  // and connections may not be properly reused
  return createClient()
}

export async function getDb() {
  const client = await getMongoClient()
  return client.db('designacoes')
}

export default getMongoClient
