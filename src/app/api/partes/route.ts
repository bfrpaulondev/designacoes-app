import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const collection = db.collection('partes')
    
    const docs = await collection
      .find({ ativo: true })
      .sort({ ordem: 1 })
      .toArray()
    
    const formattedPartes = docs.map((p) => ({
      id: p._id.toString(),
      nome: p.nome,
      descricao: p.descricao || null,
      duracaoMinutos: p.duracaoMinutos,
      numParticipantes: p.numParticipantes,
      tipo: p.tipo,
      sala: p.sala,
      privilegiosMinimos: p.privilegiosMinimos || null,
      ordem: p.ordem,
      ativo: p.ativo
    }))
    
    return NextResponse.json({ partes: formattedPartes })
  } catch (error) {
    console.error('Get partes error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar partes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()
    const collection = db.collection('partes')
    
    const data = await request.json()
    
    const { nome, descricao, duracaoMinutos, numParticipantes, tipo, sala, privilegiosMinimos, ordem } = data
    
    if (!nome || duracaoMinutos === undefined) {
      return NextResponse.json(
        { error: 'Nome e duração são obrigatórios' },
        { status: 400 }
      )
    }
    
    const newDoc = {
      nome,
      descricao: descricao || null,
      duracaoMinutos: Number(duracaoMinutos),
      numParticipantes: Number(numParticipantes) || 1,
      tipo: tipo || 'outros',
      sala: sala || 'ambas',
      privilegiosMinimos: privilegiosMinimos ? JSON.stringify(privilegiosMinimos) : null,
      ordem: Number(ordem) || 0,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(newDoc)
    
    return NextResponse.json({ 
      parte: {
        id: result.insertedId.toString(),
        nome: newDoc.nome
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create parte error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar parte' },
      { status: 500 }
    )
  }
}
