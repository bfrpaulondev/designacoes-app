import { Router, Request, Response } from 'express'
import { getCollection, ObjectId } from '../db'

const router = Router()

// GET - Listar designações por semana
router.get('/', async (req: Request, res: Response) => {
  try {
    const { semanaId } = req.query
    const collection = await getCollection('designacaos')

    const query: any = {}
    if (semanaId) {
      query.semanaId = new ObjectId(semanaId as string)
    }

    const designacoes = await collection
      .find(query)
      .sort({ ordem: 1 })
      .toArray()

    const result = designacoes.map(d => ({
      id: d._id.toString(),
      semanaId: d.semanaId?.toString() || null,
      parteId: d.parteId?.toString() || null,
      sala: d.sala,
      publicadorId: d.publicadorId?.toString() || null,
      observacoes: d.observacoes || null,
      ordem: d.ordem
    }))

    res.json({ designacoes: result })
  } catch (error: any) {
    console.error('Get designacoes error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST - Criar ou atualizar designação
router.post('/', async (req: Request, res: Response) => {
  try {
    const { semanaId, parteId, sala, publicadorId, observacoes, ordem } = req.body
    const collection = await getCollection('designacaos')

    if (!semanaId || !parteId || !sala || !publicadorId) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' })
    }

    // Verificar se já existe designação para esta parte/sala/ordem
    const existing = await collection.findOne({
      semanaId: new ObjectId(semanaId),
      parteId: new ObjectId(parteId),
      sala,
      ordem: ordem || 1
    })

    if (existing) {
      // Atualizar existente
      await collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            publicadorId: new ObjectId(publicadorId),
            observacoes: observacoes || null,
            updatedAt: new Date()
          }
        }
      )

      res.json({
        id: existing._id.toString(),
        updated: true
      })
    } else {
      // Criar nova
      const novaDesignacao = {
        semanaId: new ObjectId(semanaId),
        parteId: new ObjectId(parteId),
        sala,
        publicadorId: new ObjectId(publicadorId),
        observacoes: observacoes || null,
        ordem: ordem || 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await collection.insertOne(novaDesignacao)

      res.status(201).json({
        id: result.insertedId.toString(),
        ...novaDesignacao
      })
    }
  } catch (error: any) {
    console.error('Create designacao error:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT - Atualizar designação
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { publicadorId, observacoes } = req.body
    const collection = await getCollection('designacaos')

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          publicadorId: publicadorId ? new ObjectId(publicadorId) : null,
          observacoes: observacoes || null,
          updatedAt: new Date()
        }
      }
    )

    res.json({ success: true })
  } catch (error: any) {
    console.error('Update designacao error:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE - Remover designação
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const collection = await getCollection('designacaos')

    await collection.deleteOne({ _id: new ObjectId(id) })

    res.json({ success: true })
  } catch (error: any) {
    console.error('Delete designacao error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
