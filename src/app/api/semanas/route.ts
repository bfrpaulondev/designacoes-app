import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const db = await getDb()
    
    const semanasCollection = db.collection('semanadesignacaos')
    const designacoesCollection = db.collection('designacaos')
    const partesCollection = db.collection('partes')
    const publicadoresCollection = db.collection('publicadors')
    
    const semanas = await semanasCollection
      .find({})
      .sort({ dataInicio: -1 })
      .toArray()
    
    const semanasWithDesignacoes = await Promise.all(semanas.map(async (s) => {
      const designacoes = await designacoesCollection
        .find({ semanaId: s._id })
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
                privilegios: []
              }
            }
          }
          
          return {
            id: d._id.toString(),
            semanaId: s._id.toString(),
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
      
      return {
        id: s._id.toString(),
        dataInicio: s.dataInicio.toISOString(),
        dataFim: s.dataFim.toISOString(),
        observacoes: s.observacoes || null,
        status: s.status,
        designacoes: designacoesWithDetails
      }
    }))
    
    return NextResponse.json({ semanas: semanasWithDesignacoes })
  } catch (error) {
    console.error('Get semanas error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar semanas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()
    const collection = db.collection('semanadesignacaos')
    
    const data = await request.json()
    
    const { dataInicio, observacoes } = data
    
    if (!dataInicio) {
      return NextResponse.json(
        { error: 'Data de início é obrigatória' },
        { status: 400 }
      )
    }
    
    const inicio = new Date(dataInicio)
    const fim = new Date(inicio)
    fim.setDate(fim.getDate() + 6)
    
    const newDoc = {
      dataInicio: inicio,
      dataFim: fim,
      observacoes: observacoes || null,
      status: 'rascunho',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(newDoc)
    
    return NextResponse.json({ 
      semana: {
        id: result.insertedId.toString(),
        dataInicio: inicio.toISOString(),
        dataFim: fim.toISOString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create semana error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar semana' },
      { status: 500 }
    )
  }
}
