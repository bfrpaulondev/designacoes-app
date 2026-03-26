import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('[API Etiquetas] Starting GET...')
    
    const db = await getDb()
    const collection = db.collection('etiquetas')
    
    const docs = await collection
      .find({ ativo: { $ne: false } })
      .sort({ ordem: 1, nome: 1 })
      .toArray()
    
    console.log('[API Etiquetas] Found:', docs.length, 'etiquetas')
    
    const formattedEtiquetas = docs.map((e) => ({
      id: e._id.toString(),
      nome: e.nome,
      icone: e.icone || 'Tag',
      cor: e.cor || '#6B7280',
      descricao: e.descricao,
      ordem: e.ordem || 0,
      ativo: e.ativo !== false
    }))
    
    return NextResponse.json({ etiquetas: formattedEtiquetas })
  } catch (error: any) {
    console.error('[API Etiquetas] Error:', error.message)
    return NextResponse.json(
      { error: 'Erro ao buscar etiquetas', etiquetas: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API Etiquetas] Starting POST...')
    
    const db = await getDb()
    const collection = db.collection('etiquetas')
    
    const data = await request.json()
    
    // Verificar se já existe
    const existing = await collection.findOne({ 
      nome: { $regex: new RegExp(`^${data.nome}$`, 'i') } 
    })
    
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma etiqueta com este nome' },
        { status: 400 }
      )
    }
    
    const newDoc = {
      nome: data.nome,
      icone: data.icone || 'Tag',
      cor: data.cor || '#6B7280',
      descricao: data.descricao || null,
      ordem: data.ordem || 0,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(newDoc)
    
    return NextResponse.json({ 
      etiqueta: {
        id: result.insertedId.toString(),
        nome: newDoc.nome,
        icone: newDoc.icone,
        cor: newDoc.cor,
        descricao: newDoc.descricao,
        ordem: newDoc.ordem
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('[API Etiquetas] Create error:', error.message)
    return NextResponse.json(
      { error: 'Erro ao criar etiqueta' },
      { status: 500 }
    )
  }
}
