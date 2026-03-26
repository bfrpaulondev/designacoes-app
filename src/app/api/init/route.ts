import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    const db = await getDb()
    const usersCollection = db.collection('users')
    
    const existingUser = await usersCollection.findOne({})
    if (existingUser) {
      return NextResponse.json({ 
        message: 'Sistema já foi inicializado',
        initialized: true 
      })
    }
    
    // Create default admin user
    const hashedPassword = await hashPassword('admin123')
    await usersCollection.insertOne({
      email: 'admin@congregacao.local',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Create default privilegios
    const privilegiosCollection = db.collection('privilegios')
    const privilegiosDefault = [
      { nome: 'Estudante', ordem: 1, createdAt: new Date() },
      { nome: 'Publicador Não Batizado', ordem: 2, createdAt: new Date() },
      { nome: 'Publicador Batizado', ordem: 3, createdAt: new Date() },
      { nome: 'Pioneiro Auxiliar', ordem: 4, createdAt: new Date() },
      { nome: 'Pioneiro Regular', ordem: 5, createdAt: new Date() },
      { nome: 'Servo Ministerial', ordem: 6, createdAt: new Date() },
      { nome: 'Ancião', ordem: 7, createdAt: new Date() }
    ]
    
    await privilegiosCollection.insertMany(privilegiosDefault)
    
    // Create default partes
    const partesCollection = db.collection('partes')
    const partesDefault = [
      { nome: 'Presidente', duracaoMinutos: 0, numParticipantes: 1, tipo: 'presidente', sala: 'A', privilegiosMinimos: JSON.stringify(['Ancião', 'Servo Ministerial']), ordem: 1, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Presidente (Sala B)', duracaoMinutos: 0, numParticipantes: 1, tipo: 'presidente', sala: 'B', privilegiosMinimos: JSON.stringify(['Ancião', 'Servo Ministerial']), ordem: 2, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Leitura da Bíblia', duracaoMinutos: 4, numParticipantes: 1, tipo: 'leitura', sala: 'ambas', ordem: 3, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Iniciando conversas', duracaoMinutos: 3, numParticipantes: 2, tipo: 'demonstracao', sala: 'ambas', ordem: 4, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Cultivando o interesse', duracaoMinutos: 4, numParticipantes: 2, tipo: 'demonstracao', sala: 'ambas', ordem: 5, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Fazendo discípulos', duracaoMinutos: 5, numParticipantes: 2, tipo: 'demonstracao', sala: 'ambas', ordem: 6, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Conselheiro', duracaoMinutos: 1, numParticipantes: 1, tipo: 'conselheiro', sala: 'A', privilegiosMinimos: JSON.stringify(['Ancião', 'Servo Ministerial']), ordem: 7, createdAt: new Date(), updatedAt: new Date() },
      { nome: 'Conselheiro (Sala B)', duracaoMinutos: 1, numParticipantes: 1, tipo: 'conselheiro', sala: 'B', privilegiosMinimos: JSON.stringify(['Ancião', 'Servo Ministerial']), ordem: 8, createdAt: new Date(), updatedAt: new Date() }
    ]
    
    await partesCollection.insertMany(partesDefault)
    
    // Create default config
    const configCollection = db.collection('configuracaos')
    await configCollection.insertMany([
      { chave: 'nomeCongregacao', valor: 'Nossa Congregação', createdAt: new Date(), updatedAt: new Date() },
      { chave: 'logo', valor: '', createdAt: new Date(), updatedAt: new Date() }
    ])
    
    return NextResponse.json({ 
      message: 'Sistema inicializado com sucesso!',
      initialized: true,
      adminCredentials: {
        email: 'admin@congregacao.local',
        password: 'admin123'
      }
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json(
      { error: 'Erro ao inicializar sistema' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('[Init GET] Starting...')
    const db = await getDb()
    console.log('[Init GET] Connected to DB')
    
    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({})
    console.log('[Init GET] Found user:', !!user)
    
    return NextResponse.json({ 
      initialized: !!user 
    })
  } catch (error) {
    console.error('[Init GET] Error:', error)
    return NextResponse.json({ initialized: false })
  }
}
