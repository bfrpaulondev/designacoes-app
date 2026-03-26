import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('[Status] Starting...')
    const db = await getDb()
    console.log('[Status] Connected to DB')
    
    // Count documents in each collection
    const usersCount = await db.collection('users').countDocuments()
    const publicadoresCount = await db.collection('publicadors').countDocuments()
    const privilegiosCount = await db.collection('privilegios').countDocuments()
    const partesCount = await db.collection('partes').countDocuments()
    
    return NextResponse.json({ 
      success: true,
      counts: {
        users: usersCount,
        publicadores: publicadoresCount,
        privilegios: privilegiosCount,
        partes: partesCount
      },
      initialized: usersCount > 0
    })
  } catch (error) {
    console.error('[Status] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao verificar status',
      initialized: false 
    })
  }
}
