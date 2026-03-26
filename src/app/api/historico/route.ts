import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    
    const { searchParams } = new URL(request.url)
    const parteId = searchParams.get('parteId')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!parteId) {
      return NextResponse.json(
        { error: 'ID da parte é obrigatório' },
        { status: 400 }
      )
    }
    
    const designacoesCollection = db.collection('designacaos')
    const publicadoresCollection = db.collection('publicadors')
    const semanasCollection = db.collection('semanadesignacaos')
    
    const designacoes = await designacoesCollection
      .find({ parteId: new ObjectId(parteId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    const historico = await Promise.all(designacoes.map(async (d) => {
      let publicadorNome = null
      let semanaData = null
      
      if (d.publicadorId) {
        const pub = await publicadoresCollection.findOne({ _id: d.publicadorId })
        publicadorNome = pub?.nomeCompleto || `${pub?.nomePrimeiro || ''} ${pub?.nomeUltimo || ''}`.trim()
      }
      
      if (d.semanaId) {
        const semana = await semanasCollection.findOne({ _id: d.semanaId })
        semanaData = semana?.dataInicio?.toISOString()
      }
      
      return {
        id: d._id.toString(),
        publicadorId: d.publicadorId?.toString() || null,
        publicadorNome,
        semanaData,
        sala: d.sala,
        ordem: d.ordem,
        dataDesignacao: d.createdAt?.toISOString() || null
      }
    }))
    
    return NextResponse.json({ historico })
  } catch (error) {
    console.error('Get historico error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    )
  }
}
