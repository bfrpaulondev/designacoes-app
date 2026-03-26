import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const collection = db.collection('configuracaos')
    
    const configs = await collection.find({}).toArray()
    
    const config: Record<string, string> = {}
    for (const c of configs) {
      config[c.chave] = c.valor
    }
    
    return NextResponse.json({ config })
  } catch (error) {
    console.error('Get config error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()
    const collection = db.collection('configuracaos')
    
    const data = await request.json()
    
    for (const [chave, valor] of Object.entries(data)) {
      await collection.updateOne(
        { chave },
        { $set: { chave, valor: valor as string, updatedAt: new Date() } },
        { upsert: true }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update config error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
