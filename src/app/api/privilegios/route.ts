import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const collection = db.collection('privilegios')
    
    const docs = await collection
      .find({})
      .sort({ ordem: 1 })
      .toArray()
    
    const formattedPrivilegios = docs.map((p) => ({
      id: p._id.toString(),
      nome: p.nome,
      ordem: p.ordem || 0
    }))
    
    return NextResponse.json({ privilegios: formattedPrivilegios })
  } catch (error: any) {
    console.error('[API Privilegios] Error:', error.message)
    return NextResponse.json(
      { error: 'Erro ao buscar privilégios', privilegios: [] },
      { status: 500 }
    )
  }
}
