import { NextResponse } from 'next/server'
import { getDb, getMongoClient } from '@/lib/mongodb'

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriLength: process.env.MONGODB_URI?.length || 0,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 30) + '...' || 'NOT SET',
    },
    connection: null,
    publicadoresTest: null
  }

  try {
    console.log('[Health] Attempting MongoDB connection...')
    
    const client = await getMongoClient()
    const db = await getDb()

    diagnostics.connection = {
      success: true,
    }

    // Try to ping the database
    const adminDb = client.db().admin()
    const pingResult = await adminDb.ping()
    diagnostics.connection.ping = pingResult ? 'success' : 'failed'

    // List collections to verify access
    const collections = await db.listCollections().toArray()
    diagnostics.connection.collections = collections.map((c: any) => c.name)

    // Test query on publicadors collection
    try {
      const collection = db.collection('publicadors')
      const count = await collection.countDocuments()
      const sample = await collection.find({}).limit(3).toArray()
      diagnostics.publicadoresTest = {
        success: true,
        count,
        sample: sample.map((p: any) => ({
          id: p._id.toString(),
          nome: p.nomeCompleto || p.nomePrimeiro
        }))
      }
    } catch (pubError: any) {
      diagnostics.publicadoresTest = {
        success: false,
        error: pubError.message
      }
    }

    console.log('[Health] MongoDB connection successful!')
    
    return NextResponse.json(diagnostics, { status: 200 })

  } catch (error: any) {
    console.error('[Health] MongoDB connection error:', error)
    
    let errorDetails: any = {
      success: false,
      error: error.message,
      name: error.name,
    }

    // Add specific hints based on error type
    if (error.name === 'MongoServerSelectionError' || error.message.includes('ENOTFOUND')) {
      errorDetails.hint = 'Cannot reach MongoDB server. Check if the cluster is running and network access is configured.'
      errorDetails.possibleCauses = [
        'MongoDB Atlas cluster is paused (free tier clusters pause after inactivity)',
        'IP address not whitelisted in MongoDB Atlas Network Access',
        'DNS resolution failed - check the cluster hostname',
      ]
    } else if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
      errorDetails.hint = 'Authentication failed. Check your username and password in the connection string.'
      errorDetails.possibleCauses = [
        'Wrong username or password',
        'User does not have access to this database',
        'Special characters in password not URL-encoded',
      ]
    } else if (error.message.includes('connection timeout')) {
      errorDetails.hint = 'Connection timeout. The server took too long to respond.'
      errorDetails.possibleCauses = [
        'Network access not configured for Vercel IPs',
        'Add 0.0.0.0/0 to MongoDB Atlas Network Access to allow all IPs',
        'Cluster is experiencing high load',
      ]
    }

    diagnostics.connection = errorDetails
    
    return NextResponse.json(diagnostics, { status: 500 })
  }
}
