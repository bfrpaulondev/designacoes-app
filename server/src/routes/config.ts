import { Router, Request, Response } from 'express'
import { getCollection, ObjectId } from '../db'

const router = Router()

// GET - Buscar configurações
router.get('/', async (req: Request, res: Response) => {
  try {
    const collection = await getCollection('configuracaos')
    const configs = await collection.find({}).toArray()

    const config: Record<string, string> = {}
    for (const c of configs) {
      config[c.chave] = c.valor
    }

    res.json({ config })
  } catch (error: any) {
    console.error('Get config error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST - Atualizar configurações
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body
    const collection = await getCollection('configuracaos')

    for (const [chave, valor] of Object.entries(data)) {
      await collection.updateOne(
        { chave },
        { $set: { chave, valor: valor as string, updatedAt: new Date() } },
        { upsert: true }
      )
    }

    res.json({ success: true })
  } catch (error: any) {
    console.error('Update config error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
