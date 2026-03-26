import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// API para migrar dados antigos para o novo schema
export async function POST() {
  try {
    console.log('[Migrate] Starting migration...')
    const db = await getDb()
    const collection = db.collection('publicadors')
    
    // Buscar todos os publicadores
    const publicadores = await collection.find({}).toArray()
    console.log('[Migrate] Found', publicadores.length, 'publicadores')
    
    let updated = 0
    let errors = 0
    
    for (const p of publicadores) {
      try {
        const updates: any = {}
        
        // Se tem nome mas não tem nomePrimeiro/nomeUltimo
        if ((p as any).nome && !p.nomePrimeiro && !p.nomeUltimo) {
          const nome = (p as any).nome
          const parts = nome.split(' ')
          updates.nomePrimeiro = parts[0]
          updates.nomeUltimo = parts.length > 1 ? parts[parts.length - 1] : parts[0]
          updates.nomeCompleto = nome
        }
        
        // Se não tem nomeCompleto
        if (!p.nomeCompleto && p.nomePrimeiro) {
          const parts = [p.nomePrimeiro, p.nomeMeio, p.nomeUltimo].filter(Boolean)
          updates.nomeCompleto = parts.join(' ')
          if (p.sufixo) {
            updates.nomeCompleto += ` ${p.sufixo}`
          }
        }
        
        // Se não tem genero
        if (!p.genero) {
          updates.genero = 'masculino'
        }
        
        // Se não tem status
        if (!p.status) {
          updates.status = 'ativo'
        }
        
        // Se não tem tipoPublicador
        if (!p.tipoPublicador) {
          updates.tipoPublicador = 'publicador_batizado'
        }
        
        // Se não tem privilegioServico
        if (!p.privilegioServico) {
          updates.privilegioServico = 'nenhum'
        }
        
        // Se há atualizações
        if (Object.keys(updates).length > 0) {
          await collection.updateOne(
            { _id: p._id },
            { $set: updates }
          )
          updated++
        }
      } catch (e) {
        console.error('[Migrate] Error updating publicador:', p._id, e)
        errors++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      stats: {
        total: publicadores.length,
        updated,
        errors
      }
    })
  } catch (error: any) {
    console.error('[Migrate] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDb()
    const collection = db.collection('publicadors')
    
    // Verificar status dos dados
    const total = await collection.countDocuments({})
    const comNomeCompleto = await collection.countDocuments({ nomeCompleto: { $exists: true, $ne: null } })
    const semNomeCompleto = await collection.countDocuments({ 
      $or: [
        { nomeCompleto: { $exists: false } },
        { nomeCompleto: null },
        { nomeCompleto: '' }
      ]
    })
    const semGenero = await collection.countDocuments({ genero: { $exists: false } })
    
    return NextResponse.json({
      stats: {
        total,
        comNomeCompleto,
        semNomeCompleto,
        semGenero,
        needsMigration: semNomeCompleto > 0 || semGenero > 0
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
