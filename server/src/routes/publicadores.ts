import { Router, Request, Response } from 'express'
import { getCollection, ObjectId } from '../db'

const router = Router()

// GET - Listar todos os publicadores
router.get('/', async (req: Request, res: Response) => {
  try {
    const collection = await getCollection('publicadors')
    const publicadores = await collection
      .find({ status: { $ne: 'deletado' } })
      .sort({ nomeCompleto: 1 })
      .toArray()

    const result = publicadores.map(p => ({
      id: p._id.toString(),
      nome: p.nomeCompleto || `${p.nomePrimeiro || ''} ${p.nomeUltimo || ''}`.trim(),
      nomeCompleto: p.nomeCompleto,
      nomePrimeiro: p.nomePrimeiro,
      nomeUltimo: p.nomeUltimo,
      email: p.email || null,
      telemovel: p.telemovel || null,
      genero: p.genero || 'masculino',
      tipoPublicador: p.tipoPublicador || 'publicador_batizado',
      privilegioServico: p.privilegioServico || 'nenhum',
      grupoCampo: p.grupoCampo || null,
      grupoLimpeza: p.grupoLimpeza || null,
      cidade: p.cidade || null,
      morada: p.morada || null,
      latitude: p.latitude || null,
      longitude: p.longitude || null,
      status: p.status || 'ativo',
      etiquetas: p.etiquetas || [],
      restricoes: p.restricoes || [],
      observacoes: p.observacoes || null
    }))

    res.json({ publicadores: result })
  } catch (error: any) {
    console.error('Get publicadores error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET - Buscar publicador por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const collection = await getCollection('publicadors')
    const publicador = await collection.findOne({ _id: new ObjectId(id) })

    if (!publicador) {
      return res.status(404).json({ error: 'Publicador não encontrado' })
    }

    res.json({
      id: publicador._id.toString(),
      nome: publicador.nomeCompleto,
      nomePrimeiro: publicador.nomePrimeiro,
      nomeUltimo: publicador.nomeUltimo,
      email: publicador.email,
      telemovel: publicador.telemovel,
      genero: publicador.genero,
      tipoPublicador: publicador.tipoPublicador,
      privilegioServico: publicador.privilegioServico,
      grupoCampo: publicador.grupoCampo,
      grupoLimpeza: publicador.grupoLimpeza,
      cidade: publicador.cidade,
      morada: publicador.morada,
      latitude: publicador.latitude,
      longitude: publicador.longitude,
      status: publicador.status,
      etiquetas: publicador.etiquetas || [],
      restricoes: publicador.restricoes || [],
      observacoes: publicador.observacoes
    })
  } catch (error: any) {
    console.error('Get publicador error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST - Criar novo publicador
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body
    const collection = await getCollection('publicadors')

    const nomeCompleto = [data.nomePrimeiro, data.nomeMeio, data.nomeUltimo]
      .filter(Boolean)
      .join(' ')

    const novoPublicador = {
      nomePrimeiro: data.nomePrimeiro,
      nomeMeio: data.nomeMeio || null,
      nomeUltimo: data.nomeUltimo,
      nomeCompleto,
      genero: data.genero || 'masculino',
      email: data.email || null,
      telemovel: data.telemovel || null,
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
      grupoCampo: data.grupoCampo || null,
      grupoLimpeza: data.grupoLimpeza || null,
      etiquetas: data.etiquetas || [],
      restricoes: data.restricoes || [],
      status: data.status || 'ativo',
      observacoes: data.observacoes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(novoPublicador)

    res.status(201).json({
      id: result.insertedId.toString(),
      nome: nomeCompleto,
      ...novoPublicador
    })
  } catch (error: any) {
    console.error('Create publicador error:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT - Atualizar publicador
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body
    const collection = await getCollection('publicadors')

    const updateData: any = { updatedAt: new Date() }

    // Campos permitidos para atualização
    const campos = [
      'nomePrimeiro', 'nomeMeio', 'nomeUltimo', 'genero', 'email', 
      'telemovel', 'telefoneCasa', 'morada', 'cidade', 'codigoPostal',
      'latitude', 'longitude', 'dataNascimento', 'dataBatismo',
      'tipoPublicador', 'privilegioServico', 'grupoCampo', 'grupoLimpeza',
      'etiquetas', 'restricoes', 'status', 'observacoes'
    ]

    for (const campo of campos) {
      if (data[campo] !== undefined) {
        if (campo === 'dataNascimento' || campo === 'dataBatismo') {
          updateData[campo] = data[campo] ? new Date(data[campo]) : null
        } else {
          updateData[campo] = data[campo]
        }
      }
    }

    // Recalcular nomeCompleto se necessário
    if (data.nomePrimeiro || data.nomeMeio || data.nomeUltimo) {
      const atual = await collection.findOne({ _id: new ObjectId(id) })
      if (atual) {
        const nomePrimeiro = data.nomePrimeiro ?? atual.nomePrimeiro
        const nomeMeio = data.nomeMeio ?? atual.nomeMeio
        const nomeUltimo = data.nomeUltimo ?? atual.nomeUltimo
        updateData.nomeCompleto = [nomePrimeiro, nomeMeio, nomeUltimo].filter(Boolean).join(' ')
      }
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    res.json({ success: true })
  } catch (error: any) {
    console.error('Update publicador error:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE - Remover publicador (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const collection = await getCollection('publicadors')

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'deletado', updatedAt: new Date() } }
    )

    res.json({ success: true })
  } catch (error: any) {
    console.error('Delete publicador error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
