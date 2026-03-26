import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    
    const collection = db.collection('etiquetas')
    
    const data = await request.json()
    
    // Verificar se a etiqueta existe
    const existing = await collection.findOne({ _id: new ObjectId(id) })
    if (!existing) {
      return NextResponse.json(
        { error: 'Etiqueta não encontrada' },
        { status: 404 }
      )
    }
    
    // Verificar se já existe outra etiqueta com o mesmo nome
    if (data.nome) {
      const duplicate = await collection.findOne({
        _id: { $ne: new ObjectId(id) },
        nome: { $regex: new RegExp(`^${data.nome}$`, 'i') }
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Já existe uma etiqueta com este nome' },
          { status: 400 }
        )
      }
    }
    
    const updateData: any = { updatedAt: new Date() }
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.icone !== undefined) updateData.icone = data.icone
    if (data.cor !== undefined) updateData.cor = data.cor
    if (data.descricao !== undefined) updateData.descricao = data.descricao
    if (data.ordem !== undefined) updateData.ordem = data.ordem
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    const updated = await collection.findOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({ 
      etiqueta: {
        id: updated!._id.toString(),
        nome: updated!.nome,
        icone: updated!.icone,
        cor: updated!.cor,
        descricao: updated!.descricao,
        ordem: updated!.ordem
      }
    })
  } catch (error: any) {
    console.error('[API Etiquetas] Update error:', error.message)
    return NextResponse.json(
      { error: 'Erro ao atualizar etiqueta' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    
    const collection = db.collection('etiquetas')
    
    // Soft delete
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ativo: false, updatedAt: new Date() } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API Etiquetas] Delete error:', error.message)
    return NextResponse.json(
      { error: 'Erro ao excluir etiqueta' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    
    const collection = db.collection('etiquetas')
    
    const etiqueta = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!etiqueta) {
      return NextResponse.json(
        { error: 'Etiqueta não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      etiqueta: {
        id: etiqueta._id.toString(),
        nome: etiqueta.nome,
        icone: etiqueta.icone,
        cor: etiqueta.cor,
        descricao: etiqueta.descricao,
        ordem: etiqueta.ordem
      }
    })
  } catch (error: any) {
    console.error('[API Etiquetas] Get error:', error.message)
    return NextResponse.json(
      { error: 'Erro ao buscar etiqueta' },
      { status: 500 }
    )
  }
}
