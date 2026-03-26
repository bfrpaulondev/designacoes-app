import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('[API Publicadores] Starting GET...')
    
    const db = await getDb()
    console.log('[API Publicadores] Got database connection')
    
    const collection = db.collection('publicadors')
    
    const docs = await collection.find({ status: { $ne: 'deletado' } })
      .sort({ nomeCompleto: 1 })
      .toArray()
    
    console.log('[API Publicadores] Found:', docs.length, 'publicadores')
    
    const formattedPublicadores = docs.map((p: any) => ({
      id: p._id.toString(),
      nome: p.nomeCompleto || `${p.nomePrimeiro || ''} ${p.nomeUltimo || ''}`.trim(),
      nomeCompleto: p.nomeCompleto || `${p.nomePrimeiro || ''} ${p.nomeUltimo || ''}`.trim(),
      nomePrimeiro: p.nomePrimeiro,
      nomeUltimo: p.nomeUltimo,
      email: p.email || null,
      telefone: p.telemovel || p.telefoneCasa || null,
      telemovel: p.telemovel || null,
      dataNascimento: p.dataNascimento?.toISOString() || null,
      dataBatismo: p.dataBatismo?.toISOString() || null,
      foto: p.foto || null,
      status: p.status || 'ativo',
      tipoPublicador: p.tipoPublicador || 'publicador_batizado',
      privilegioServico: p.privilegioServico || 'nenhum',
      observacoes: p.observacoes || null,
      privilegios: [],
      etiquetas: [],
      restricoes: p.restricoes?.filter((r: any) => r.ativo) || [],
      grupoCampo: p.grupoCampo || null,
      grupoLimpeza: p.grupoLimpeza || null,
      cidade: p.cidade || null,
      morada: p.morada || null,
      latitude: p.latitude || null,
      longitude: p.longitude || null,
      genero: p.genero || 'masculino'
    }))
    
    return NextResponse.json({ publicadores: formattedPublicadores })
  } catch (error: any) {
    console.error('[API Publicadores] Error:', error.message)
    console.error('[API Publicadores] Stack:', error.stack)
    return NextResponse.json(
      { error: 'Erro ao buscar publicadores', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API Publicadores] Starting POST...')
    
    const db = await getDb()
    const collection = db.collection('publicadors')
    
    const data = await request.json()
    
    // Support both old schema (nome) and new schema (nomePrimeiro/nomeUltimo)
    let nomePrimeiro = data.nomePrimeiro
    let nomeUltimo = data.nomeUltimo
    
    if (!nomePrimeiro && !nomeUltimo && data.nome) {
      const parts = data.nome.split(' ')
      nomePrimeiro = parts[0]
      nomeUltimo = parts.length > 1 ? parts[parts.length - 1] : ''
    }
    
    if (!nomePrimeiro || !nomeUltimo) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }
    
    // Build full name
    const nomeCompleto = [nomePrimeiro, data.nomeMeio, nomeUltimo].filter(Boolean).join(' ')
    
    const newDoc = {
      nomePrimeiro,
      nomeMeio: data.nomeMeio || null,
      nomeUltimo,
      sufixo: data.sufixo || null,
      nomeCompleto,
      etiqueta: data.etiqueta || null,
      genero: data.genero || 'masculino',
      email: data.email || null,
      telemovel: data.telemovel || data.telefone || null,
      telefoneCasa: data.telefoneCasa || null,
      morada: data.morada || null,
      cidade: data.cidade || null,
      codigoPostal: data.codigoPostal || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
      dataBatismo: data.dataBatismo ? new Date(data.dataBatismo) : null,
      tipoPublicador: data.tipoPublicador || 'publicador_batizado',
      privilegioServico: data.privilegioServico || 'nenhum',
      status: data.status || 'ativo',
      observacoes: data.observacoes || null,
      privilegios: data.privilegios || [],
      etiquetas: data.etiquetas || [],
      grupoCampo: data.grupoCampo || null,
      grupoLimpeza: data.grupoLimpeza || null,
      restricoes: data.restricoes?.map((r: any) => ({
        tipo: r.tipo,
        descricao: r.descricao || null,
        ativo: true
      })) || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(newDoc)
    
    return NextResponse.json({ 
      publicador: {
        id: result.insertedId.toString(),
        nome: nomeCompleto
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('[API Publicadores] Create error:', error.message)
    return NextResponse.json(
      { error: 'Erro ao criar publicador', details: error.message },
      { status: 500 }
    )
  }
}
