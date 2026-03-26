import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    
    const { searchParams } = new URL(request.url)
    const semanaId = searchParams.get('semanaId')
    const format = searchParams.get('format') || 'json'
    
    if (!semanaId) {
      return NextResponse.json(
        { error: 'ID da semana é obrigatório' },
        { status: 400 }
      )
    }
    
    const semanasCollection = db.collection('semanadesignacaos')
    const designacoesCollection = db.collection('designacaos')
    const publicadoresCollection = db.collection('publicadors')
    const partesCollection = db.collection('partes')
    const configCollection = db.collection('configuracaos')
    
    const semana = await semanasCollection.findOne({ _id: new ObjectId(semanaId) })
    
    if (!semana) {
      return NextResponse.json(
        { error: 'Semana não encontrada' },
        { status: 404 }
      )
    }
    
    const designacoes = await designacoesCollection
      .find({ semanaId: new ObjectId(semanaId) })
      .sort({ ordem: 1 })
      .toArray()
    
    const config = await configCollection.findOne({ chave: 'nomeCongregacao' })
    const nomeCongregacao = config?.valor || 'Congregação'
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    // Get details for each designacao
    const designacoesWithDetails = await Promise.all(
      designacoes.map(async (d) => {
        let parte = null
        let publicador = null
        
        if (d.parteId) {
          const parteDoc = await partesCollection.findOne({ _id: d.parteId })
          if (parteDoc) {
            parte = {
              nome: parteDoc.nome,
              descricao: parteDoc.descricao,
              duracaoMinutos: parteDoc.duracaoMinutos
            }
          }
        }
        
        if (d.publicadorId) {
          const pubDoc = await publicadoresCollection.findOne({ _id: d.publicadorId })
          if (pubDoc) {
            publicador = {
              nome: pubDoc.nomeCompleto || `${pubDoc.nomePrimeiro || ''} ${pubDoc.nomeUltimo || ''}`.trim()
            }
          }
        }
        
        return {
          ...d,
          parte,
          publicador
        }
      })
    )
    
    if (format === 'csv') {
      let csv = `Designações - ${nomeCongregacao}\n`
      csv += `Semana: ${formatDate(semana.dataInicio)} a ${formatDate(semana.dataFim)}\n\n`
      csv += 'Parte;Sala;Publicador;Observações\n'
      
      for (const d of designacoesWithDetails) {
        csv += `"${d.parte?.nome || ''}";"${d.sala}";"${d.publicador?.nome || ''}";"${d.observacoes || ''}"\n`
      }
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="designacoes-${formatDate(semana.dataInicio).replace(/\//g, '-')}.csv"`
        }
      })
    }
    
    const data = {
      congregacao: nomeCongregacao,
      semana: {
        inicio: formatDate(semana.dataInicio),
        fim: formatDate(semana.dataFim)
      },
      designacoes: designacoesWithDetails.map(d => ({
        parte: d.parte?.nome || '',
        descricao: d.parte?.descricao || '',
        duracao: `${d.parte?.duracaoMinutos || 0} min`,
        sala: d.sala,
        publicador: d.publicador?.nome || '',
        observacoes: d.observacoes || ''
      }))
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar designações' },
      { status: 500 }
    )
  }
}
