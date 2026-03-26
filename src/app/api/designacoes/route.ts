import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()
    const collection = db.collection('designacaos')
    
    const data = await request.json()
    
    const { semanaId, parteId, sala, publicadorId, observacoes, ordem } = data
    
    if (!semanaId || !parteId || !sala || !publicadorId) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }
    
    // Check if exists
    const existing = await collection.findOne({
      semanaId: new ObjectId(semanaId),
      parteId: new ObjectId(parteId),
      sala,
      ordem: ordem || 1
    })
    
    if (existing) {
      // Update existing
      await collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            publicadorId: new ObjectId(publicadorId),
            observacoes: observacoes || null,
            updatedAt: new Date()
          }
        }
      )
      
      return NextResponse.json({ 
        designacao: {
          id: existing._id.toString(),
          publicadorId,
          parteId
        }
      })
    }
    
    // Create new
    const newDoc = {
      semanaId: new ObjectId(semanaId),
      parteId: new ObjectId(parteId),
      sala,
      publicadorId: new ObjectId(publicadorId),
      observacoes: observacoes || null,
      ordem: ordem || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(newDoc)
    
    return NextResponse.json({ 
      designacao: {
        id: result.insertedId.toString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create designacao error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar designação' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb()
    const collection = db.collection('designacaos')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da designação é obrigatório' },
        { status: 400 }
      )
    }
    
    await collection.deleteOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete designacao error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir designação' },
      { status: 500 }
    )
  }
}
