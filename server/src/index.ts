import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import publicadoresRoutes from './routes/publicadores'
import etiquetasRoutes from './routes/etiquetas'
import partesRoutes from './routes/partes'
import semanasRoutes from './routes/semanas'
import designacoesRoutes from './routes/designacoes'
import configRoutes from './routes/config'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://designacoes-app.vercel.app'],
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const { getDb } = await import('./db')
    const db = await getDb()
    await db.command({ ping: 1 })
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    })
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/publicadores', publicadoresRoutes)
app.use('/api/etiquetas', etiquetasRoutes)
app.use('/api/partes', partesRoutes)
app.use('/api/semanas', semanasRoutes)
app.use('/api/designacoes', designacoesRoutes)
app.use('/api/config', configRoutes)

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
