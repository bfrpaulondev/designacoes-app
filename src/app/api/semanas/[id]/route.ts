import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb()
    
    const semanasCollection = db.collection('semanadesignacaos')
    const designacoesCollection = db.collection('designacaos')
    const partesCollection = db.collection('partes')
    const publicadoresCollection = db.collection('publicadors')
    
    const { id } = await params
    
    const semana = await semanasCollection.findOne({ _id: new ObjectId(id) })
    
    if (!semana) {
      return NextResponse.json(
        { error: 'Semana não encontrada' },
        { status: 404 }
      )
    }
    
    const designacoes = await designacoesCollection
      .find({ semanaId: new ObjectId(id) })
      .sort({ ordem: 1 })
      .toArray()
    
    // Fetch parte and publicador details for each designacao
    const designacoesWithDetails = await Promise.all(
      designacoes.map(async (d) => {
        let parte = null
        let publicador = null
        
        if (d.parteId) {
          const parteDoc = await partesCollection.findOne({ _id: d.parteId })
          if (parteDoc) {
            parte = {
              id: parteDoc._id.toString(),
              nome: parteDoc.nome,
              descricao: parteDoc.descricao || null,
              duracaoMinutos: parteDoc.duracaoMinutos,
              numParticipantes: parteDoc.numParticipantes,
              tipo: parteDoc.tipo,
              sala: parteDoc.sala
            }
          }
        }
        
        if (d.publicadorId) {
          const pubDoc = await publicadoresCollection.findOne({ _id: d.publicadorId })
          if (pubDoc) {
            publicador = {
              id: pubDoc._id.toString(),
              nome: pubDoc.nomeCompleto || `${pubDoc.nomePrimeiro || ''} ${pubDoc.nomeUltimo || ''}`.trim(),
              privilegios: [],
              restricoes: pubDoc.restricoes?.filter((r: { ativo: boolean }) => r.ativo) || []
            }
          }
        }
        
        return {
          id: d._id.toString(),
          semanaId: semana._id.toString(),
          parteId: d.parteId?.toString() || null,
          sala: d.sala,
          publicadorId: d.publicadorId?.toString() || null,
          observacoes: d.observacoes || null,
          ordem: d.ordem,
          publicador,
          parte
        }
      })
    )
    
    const formattedSemana = {
      id: semana._id.toString(),
      dataInicio: semana.dataInicio.toISOString(),
      dataFim: semana.dataFim.toISOString(),
      observacoes: semana.observacoes || null,
      status: semana.status,
      designacoes: designacoesWithDetails
    }
    
    return NextResponse.json({ semana: formattedSemana })
  } catch (error) {
    console.error('Get semana error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar semana' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb()
    const collection = db.collection('semanadesignacaos')
    
    const { id } = await params
    const data = await request.json()
    
    const { observacoes, status } = data
    
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }
    
    if (observacoes !== undefined) updateData.observacoes = observacoes || null
    if (status !== undefined) updateData.status = status
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result) {
      return NextResponse.json(
        { error: 'Semana não encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      semana: {
        id: result._id.toString(),
        status: result.status
      }
    })
  } catch (error) {
    console.error('Update semana error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar semana' },
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
    const semanasCollection = db.collection('semanadesignacaos')
    const designacoesCollection = db.collection('designacaos')
    
    const { id } = await params
    
    // Delete all designacoes for this semana first
    await designacoesCollection.deleteMany({ semanaId: new ObjectId(id) })
    
    // Delete the semana
    await semanasCollection.deleteOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete semana error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir semana' },
      { status: 500 }
    )
  }
}
