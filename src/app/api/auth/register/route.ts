import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()
    const collection = db.collection('users')
    
    const { email, password, name, role } = await request.json()
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }
    
    const existingUser = await collection.findOne({ email })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }
    
    const hashedPassword = await hashPassword(password)
    
    const result = await collection.insertOne({
      email,
      password: hashedPassword,
      name,
      role: role || 'designador',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      user: {
        id: result.insertedId.toString(),
        email,
        name,
        role: role || 'designador'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}
