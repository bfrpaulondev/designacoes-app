import { MongoClient, Collection, Db } from 'mongodb'
import 'dotenv/config'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set')
}

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (!client || !db) {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    })
    await client.connect()
    db = client.db('designacoes')
    console.log('[MongoDB] Connected successfully')
  }
  return db
}

export async function getCollection<T = any>(name: string): Promise<Collection<T>> {
  const database = await getDb()
  return database.collection<T>(name)
}

export { ObjectId } from 'mongodb'
