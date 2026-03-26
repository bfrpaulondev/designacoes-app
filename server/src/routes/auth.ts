import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getCollection, ObjectId } from '../db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'designacoes_secret_key_2024'

// POST - Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const collection = await getCollection('users')
    const user = await collection.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST - Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    const collection = await getCollection('users')
    const existing = await collection.findOne({ email: email.toLowerCase() })

    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await collection.insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'designador',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    res.status(201).json({
      id: result.insertedId.toString(),
      email: email.toLowerCase(),
      name,
      role: role || 'designador'
    })
  } catch (error: any) {
    console.error('Register error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET - Current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    const collection = await getCollection('users')
    const user = await collection.findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router
