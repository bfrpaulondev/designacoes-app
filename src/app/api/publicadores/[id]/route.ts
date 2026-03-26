import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb()
    
    const { id } = await params
    
    const publicadoresCollection = db.collection('publicadors')
    const designacoesCollection = db.collection('designacaos')
    const partesCollection = db.collection('partes')
    const semanasCollection = db.collection('semanadesignacaos')
    
    const publicador = await publicadoresCollection.findOne({ 
      _id: new ObjectId(id),
      status: { $ne: 'deletado' }
    })
    
    if (!publicador) {
      return NextResponse.json(
        { error: 'Publicador não encontrado' },
        { status: 404 }
      )
    }
    
    // Get designacoes for this publicador
    const designacoes = await designacoesCollection
      .find({ publicadorId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()
    
    // Get parte and semana info for each designacao
    const designacoesWithDetails = await Promise.all(
      designacoes.map(async (d) => {
        const parte = d.parteId ? await partesCollection.findOne({ _id: d.parteId }) : null
        const semana = d.semanaId ? await semanasCollection.findOne({ _id: d.semanaId }) : null
        
        return {
          id: d._id.toString(),
          parteNome: parte?.nome || 'Parte',
          sala: d.sala,
          semana: semana?.dataInicio?.toISOString(),
          observacoes: d.observacoes
        }
      })
    )
    
    const formattedPublicador = {
      id: publicador._id.toString(),
      nome: publicador.nomeCompleto || `${publicador.nomePrimeiro || ''} ${publicador.nomeUltimo || ''}`.trim(),
      nomeCompleto: publicador.nomeCompleto || `${publicador.nomePrimeiro || ''} ${publicador.nomeUltimo || ''}`.trim(),
      nomePrimeiro: publicador.nomePrimeiro,
      nomeUltimo: publicador.nomeUltimo,
      email: publicador.email || null,
      telefone: publicador.telemovel || publicador.telefoneCasa || null,
      telemovel: publicador.telemovel || null,
      dataNascimento: publicador.dataNascimento?.toISOString() || null,
      dataBatismo: publicador.dataBatismo?.toISOString() || null,
      foto: publicador.foto || null,
      status: publicador.status || 'ativo',
      tipoPublicador: publicador.tipoPublicador || 'publicador_batizado',
      privilegioServico: publicador.privilegioServico || 'nenhum',
      observacoes: publicador.observacoes || null,
      privilegios: [],
      etiquetas: [],
      restricoes: publicador.restricoes?.filter((r: { ativo: boolean }) => r.ativo) || [],
      grupoCampo: publicador.grupoCampo || null,
      grupoLimpeza: publicador.grupoLimpeza || null,
      cidade: publicador.cidade || null,
      morada: publicador.morada || null,
      latitude: publicador.latitude || null,
      longitude: publicador.longitude || null,
      genero: publicador.genero || 'masculino',
      historicoDesignacoes: designacoesWithDetails
    }
    
    return NextResponse.json({ publicador: formattedPublicador })
  } catch (error) {
    console.error('Get publicador error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar publicador' },
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
    
    const { id } = await params
    const data = await request.json()
    
    const collection = db.collection('publicadors')
    
    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }
    
    // Support both old schema (nome) and new schema (nomePrimeiro/nomeUltimo)
    if (data.nomePrimeiro !== undefined) {
      updateData.nomePrimeiro = data.nomePrimeiro
    }
    if (data.nomeUltimo !== undefined) {
      updateData.nomeUltimo = data.nomeUltimo
    }
    if (data.nomeMeio !== undefined) {
      updateData.nomeMeio = data.nomeMeio || null
    }
    if (data.sufixo !== undefined) {
      updateData.sufixo = data.sufixo || null
    }
    
    // Calculate nomeCompleto if nome fields provided
    if (data.nomePrimeiro || data.nomeUltimo || data.nomeMeio) {
      const currentDoc = await collection.findOne({ _id: new ObjectId(id) })
      if (currentDoc) {
        const nomePrimeiro = data.nomePrimeiro ?? currentDoc.nomePrimeiro
        const nomeMeio = data.nomeMeio ?? currentDoc.nomeMeio
        const nomeUltimo = data.nomeUltimo ?? currentDoc.nomeUltimo
        updateData.nomeCompleto = [nomePrimeiro, nomeMeio, nomeUltimo].filter(Boolean).join(' ')
      }
    }
    
    // Map old schema fields to new schema
    if (data.nome && !data.nomePrimeiro && !data.nomeUltimo) {
      const parts = data.nome.split(' ')
      updateData.nomePrimeiro = parts[0]
      updateData.nomeUltimo = parts.length > 1 ? parts[parts.length - 1] : ''
      updateData.nomeCompleto = data.nome
    }
    
    if (data.email !== undefined) updateData.email = data.email || null
    if (data.telefone !== undefined) updateData.telemovel = data.telefone || null
    if (data.telemovel !== undefined) updateData.telemovel = data.telemovel || null
    if (data.morada !== undefined) updateData.morada = data.morada || null
    if (data.cidade !== undefined) updateData.cidade = data.cidade || null
    if (data.latitude !== undefined) updateData.latitude = data.latitude || null
    if (data.longitude !== undefined) updateData.longitude = data.longitude || null
    if (data.dataNascimento !== undefined) updateData.dataNascimento = data.dataNascimento ? new Date(data.dataNascimento) : null
    if (data.dataBatismo !== undefined) updateData.dataBatismo = data.dataBatismo ? new Date(data.dataBatismo) : null
    if (data.status !== undefined) updateData.status = data.status || 'ativo'
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes || null
    if (data.privilegios !== undefined) updateData.privilegios = data.privilegios || []
    if (data.etiquetas !== undefined) updateData.etiquetas = data.etiquetas || []
    if (data.tipoPublicador !== undefined) updateData.tipoPublicador = data.tipoPublicador
    if (data.privilegioServico !== undefined) updateData.privilegioServico = data.privilegioServico
    if (data.grupoCampo !== undefined) updateData.grupoCampo = data.grupoCampo || null
    if (data.grupoLimpeza !== undefined) updateData.grupoLimpeza = data.grupoLimpeza || null
    if (data.genero !== undefined) updateData.genero = data.genero
    
    if (data.restricoes !== undefined) {
      updateData.restricoes = data.restricoes.map((r: { tipo: string; descricao: string }) => ({
        tipo: r.tipo,
        descricao: r.descricao || null,
        ativo: true
      }))
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result) {
      return NextResponse.json(
        { error: 'Publicador não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      publicador: {
        id: result._id.toString(),
        nome: result.nomeCompleto || result.nomePrimeiro
      }
    })
  } catch (error) {
    console.error('Update publicador error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar publicador' },
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
    
    const { id } = await params
    const collection = db.collection('publicadors')
    
    // Soft delete - just update status
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'deletado', updatedAt: new Date() } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete publicador error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir publicador' },
      { status: 500 }
    )
  }
}
