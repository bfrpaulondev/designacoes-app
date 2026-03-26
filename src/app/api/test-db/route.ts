import { NextResponse } from 'next/server'
import { getDb, getMongoClient } from '@/lib/mongodb'

export async function GET() {
  const result: any = {
    timestamp: new Date().toISOString(),
    steps: []
  }

  try {
    // Step 1: Connect using native driver
    result.steps.push({ step: 'connecting_to_mongodb' })
    
    const client = await getMongoClient()
    result.steps.push({ step: 'connected_to_mongodb' })

    // Step 2: Get database
    const db = await getDb()
    result.steps.push({ step: 'got_db_reference' })

    // Step 3: Query collection
    const collection = db.collection('publicadors')
    result.steps.push({ step: 'got_collection' })

    const count = await collection.countDocuments()
    result.steps.push({ step: 'count_documents', count })

    const docs = await collection.find({}).limit(5).toArray()
    result.steps.push({ step: 'found_documents', count: docs.length })

    result.success = true
    result.data = {
      count,
      sample: docs.map(d => ({ id: d._id.toString(), nome: d.nomeCompleto || d.nomePrimeiro }))
    }

    return NextResponse.json(result)
  } catch (error: any) {
    result.success = false
    result.error = error.message
    result.errorName = error.name
    result.stack = error.stack
    return NextResponse.json(result, { status: 500 })
  }
}
