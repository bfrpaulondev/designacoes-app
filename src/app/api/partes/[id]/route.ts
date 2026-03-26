import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb()
    const collection = db.collection('partes')
    
    const { id } = await params
    const data = await request.json()
    
    const { nome, descricao, duracaoMinutos, numParticipantes, tipo, sala, privilegiosMinimos, ordem, ativo } = data
    
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }
    
    if (nome !== undefined) updateData.nome = nome
    if (descricao !== undefined) updateData.descricao = descricao || null
    if (duracaoMinutos !== undefined) updateData.duracaoMinutos = Number(duracaoMinutos)
    if (numParticipantes !== undefined) updateData.numParticipantes = Number(numParticipantes) || 1
    if (tipo !== undefined) updateData.tipo = tipo || 'outros'
    if (sala !== undefined) updateData.sala = sala || 'ambas'
    if (privilegiosMinimos !== undefined) updateData.privilegiosMinimos = privilegiosMinimos ? JSON.stringify(privilegiosMinimos) : null
    if (ordem !== undefined) updateData.ordem = Number(ordem) || 0
    if (ativo !== undefined) updateData.ativo = ativo
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result) {
      return NextResponse.json(
        { error: 'Parte não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      parte: {
        id: result._id.toString(),
        nome: result.nome
      }
    })
  } catch (error) {
    console.error('Update parte error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar parte' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb()
    const collection = db.collection('partes')
    
    const { id } = await params
    
    // Soft delete - just mark as inactive
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ativo: false, updatedAt: new Date() } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete parte error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir parte' },
      { status: 500 }
    )
  }
}
