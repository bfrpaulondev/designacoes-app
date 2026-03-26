import { Router, Request, Response } from 'express'
import { getCollection, ObjectId } from '../db'

const router = Router()

// GET - Listar todas as etiquetas
router.get('/', async (req: Request, res: Response) => {
  try {
    const collection = await getCollection('etiquetas')
    const etiquetas = await collection
      .find({ ativo: { $ne: false } })
      .sort({ ordem: 1, nome: 1 })
      .toArray()

    const result = etiquetas.map(e => ({
      id: e._id.toString(),
      nome: e.nome,
      icone: e.icone || 'Tag',
      cor: e.cor || '#6B7280',
      descricao: e.descricao || null,
      ordem: e.ordem || 0,
      ativo: e.ativo !== false
    }))

    res.json({ etiquetas: result })
  } catch (error: any) {
    console.error('Get etiquetas error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST - Criar nova etiqueta
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, icone, cor, descricao, ordem } = req.body
    const collection = await getCollection('etiquetas')

    // Verificar se já existe
    const existing = await collection.findOne({ 
      nome: { $regex: new RegExp(`^${nome}$`, 'i') } 
    })

    if (existing) {
      return res.status(400).json({ error: 'Já existe uma etiqueta com este nome' })
    }

    const novaEtiqueta = {
      nome,
      icone: icone || 'Tag',
      cor: cor || '#6B7280',
      descricao: descricao || null,
      ordem: ordem || 0,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(novaEtiqueta)

    res.status(201).json({
      id: result.insertedId.toString(),
      ...novaEtiqueta
    })
  } catch (error: any) {
    console.error('Create etiqueta error:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT - Atualizar etiqueta
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { nome, icone, cor, descricao, ordem } = req.body
    const collection = await getCollection('etiquetas')

    const updateData: any = { updatedAt: new Date() }
    if (nome !== undefined) updateData.nome = nome
    if (icone !== undefined) updateData.icone = icone
    if (cor !== undefined) updateData.cor = cor
    if (descricao !== undefined) updateData.descricao = descricao
    if (ordem !== undefined) updateData.ordem = ordem

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    res.json({ success: true })
  } catch (error: any) {
    console.error('Update etiqueta error:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE - Remover etiqueta (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const collection = await getCollection('etiquetas')

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ativo: false, updatedAt: new Date() } }
    )

    res.json({ success: true })
  } catch (error: any) {
    console.error('Delete etiqueta error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
