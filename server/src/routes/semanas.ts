import { Router, Request, Response } from 'express'
import { getCollection, ObjectId } from '../db.js'

const router = Router()

// GET - Listar todas as semanas
router.get('/', async (req: Request, res: Response) => {
  try {
    const collection = await getCollection('semanadesignacaos')
    const semanas = await collection
      .find({})
      .sort({ dataInicio: -1 })
      .toArray()

    const result = semanas.map(s => ({
      id: s._id.toString(),
      dataInicio: s.dataInicio,
      dataFim: s.dataFim,
      observacoes: s.observacoes || null,
      status: s.status || 'rascunho'
    }))

    res.json({ semanas: result })
  } catch (error: any) {
    console.error('Get semanas error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET - Buscar semana por ID com designações
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const semanasCollection = await getCollection('semanadesignacaos')
    const designacoesCollection = await getCollection('designacaos')
    const partesCollection = await getCollection('partes')
    const publicadoresCollection = await getCollection('publicadors')

    const semana = await semanasCollection.findOne({ _id: new ObjectId(id) })

    if (!semana) {
      return res.status(404).json({ error: 'Semana não encontrada' })
    }

    // Buscar designações da semana
    const designacoes = await designacoesCollection
      .find({ semanaId: new ObjectId(id) })
      .sort({ ordem: 1 })
      .toArray()

    // Popular com dados de partes e publicadores
    const designacoesPopuladas = await Promise.all(
      designacoes.map(async (d) => {
        let parte = null
        let publicador = null

        if (d.parteId) {
          const parteDoc = await partesCollection.findOne({ _id: d.parteId })
          if (parteDoc) {
            parte = {
              id: parteDoc._id.toString(),
              nome: parteDoc.nome
            }
          }
        }

        if (d.publicadorId) {
          const pubDoc = await publicadoresCollection.findOne({ _id: d.publicadorId })
          if (pubDoc) {
            publicador = {
              id: pubDoc._id.toString(),
              nome: pubDoc.nomeCompleto
            }
          }
        }

        return {
          id: d._id.toString(),
          parteId: d.parteId?.toString() || null,
          sala: d.sala,
          publicadorId: d.publicadorId?.toString() || null,
          observacoes: d.observacoes || null,
          ordem: d.ordem,
          parte,
          publicador
        }
      })
    )

    res.json({
      id: semana._id.toString(),
      dataInicio: semana.dataInicio,
      dataFim: semana.dataFim,
      observacoes: semana.observacoes || null,
      status: semana.status || 'rascunho',
      designacoes: designacoesPopuladas
    })
  } catch (error: any) {
    console.error('Get semana error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST - Criar nova semana
router.post('/', async (req: Request, res: Response) => {
  try {
    const { dataInicio, observacoes } = req.body
    const collection = await getCollection('semanadesignacaos')

    const inicio = new Date(dataInicio)
    const fim = new Date(inicio)
    fim.setDate(fim.getDate() + 6)

    const novaSemana = {
      dataInicio: inicio,
      dataFim: fim,
      observacoes: observacoes || null,
      status: 'rascunho',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(novaSemana)

    res.status(201).json({
      id: result.insertedId.toString(),
      dataInicio: inicio,
      dataFim: fim,
      status: 'rascunho'
    })
  } catch (error: any) {
    console.error('Create semana error:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT - Atualizar semana
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { observacoes, status } = req.body
    const collection = await getCollection('semanadesignacaos')

    const updateData: any = { updatedAt: new Date() }
    if (observacoes !== undefined) updateData.observacoes = observacoes
    if (status !== undefined) updateData.status = status

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    res.json({ success: true })
  } catch (error: any) {
    console.error('Update semana error:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE - Remover semana
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const semanasCollection = await getCollection('semanadesignacaos')
    const designacoesCollection = await getCollection('designacaos')

    // Remover designações da semana
    await designacoesCollection.deleteMany({ semanaId: new ObjectId(id) })
    
    // Remover semana
    await semanasCollection.deleteOne({ _id: new ObjectId(id) })

    res.json({ success: true })
  } catch (error: any) {
    console.error('Delete semana error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
