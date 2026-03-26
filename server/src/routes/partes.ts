import { Router, Request, Response } from 'express'
import { getCollection, ObjectId } from '../db.js'

const router = Router()

// GET - Listar todas as partes
router.get('/', async (req: Request, res: Response) => {
  try {
    const collection = await getCollection('partes')
    const partes = await collection
      .find({ ativo: { $ne: false } })
      .sort({ ordem: 1 })
      .toArray()

    const result = partes.map(p => ({
      id: p._id.toString(),
      nome: p.nome,
      descricao: p.descricao || null,
      duracaoMinutos: p.duracaoMinutos || 0,
      numParticipantes: p.numParticipantes || 1,
      tipo: p.tipo || 'outros',
      sala: p.sala || 'ambas',
      privilegiosMinimos: p.privilegiosMinimos || null,
      ordem: p.ordem || 0
    }))

    res.json({ partes: result })
  } catch (error: any) {
    console.error('Get partes error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST - Criar nova parte
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, descricao, duracaoMinutos, numParticipantes, tipo, sala, privilegiosMinimos, ordem } = req.body
    const collection = await getCollection('partes')

    const novaParte = {
      nome,
      descricao: descricao || null,
      duracaoMinutos: duracaoMinutos || 0,
      numParticipantes: numParticipantes || 1,
      tipo: tipo || 'outros',
      sala: sala || 'ambas',
      privilegiosMinimos: privilegiosMinimos || null,
      ordem: ordem || 0,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(novaParte)

    res.status(201).json({
      id: result.insertedId.toString(),
      ...novaParte
    })
  } catch (error: any) {
    console.error('Create parte error:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT - Atualizar parte
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body
    const collection = await getCollection('partes')

    const updateData: any = { updatedAt: new Date() }
    const campos = ['nome', 'descricao', 'duracaoMinutos', 'numParticipantes', 'tipo', 'sala', 'privilegiosMinimos', 'ordem', 'ativo']
    
    for (const campo of campos) {
      if (data[campo] !== undefined) {
        updateData[campo] = data[campo]
      }
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    res.json({ success: true })
  } catch (error: any) {
    console.error('Update parte error:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE - Remover parte (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const collection = await getCollection('partes')

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ativo: false, updatedAt: new Date() } }
    )

    res.json({ success: true })
  } catch (error: any) {
    console.error('Delete parte error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
