import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    
    const { searchParams } = new URL(request.url)
    const parteId = searchParams.get('parteId')
    const tipo = searchParams.get('tipo')
    const privilegiosMinimos = searchParams.get('privilegiosMinimos')
    
    const publicadoresCollection = db.collection('publicadors')
    const designacoesCollection = db.collection('designacaos')
    const privilegiosCollection = db.collection('privilegios')
    
    let publicadores = await publicadoresCollection
      .find({ status: 'ativo' })
      .toArray()
    
    // Get privileges for each publicador
    const publicadoresWithPrivilegios = await Promise.all(
      publicadores.map(async (p) => {
        let privilegiosList: { id: string; nome: string }[] = []
        if (p.privilegios && p.privilegios.length > 0) {
          const privIds = p.privilegios.map((id: ObjectId) => new ObjectId(id))
          const privs = await privilegiosCollection.find({ _id: { $in: privIds } }).toArray()
          privilegiosList = privs.map(priv => ({
            id: priv._id.toString(),
            nome: priv.nome
          }))
        }
        return { ...p, privilegiosList }
      })
    )
    
    let filteredPublicadores = publicadoresWithPrivilegios
    
    if (privilegiosMinimos) {
      try {
        const requiredPrivs = JSON.parse(privilegiosMinimos)
        filteredPublicadores = filteredPublicadores.filter(p => 
          p.privilegiosList.some(priv => requiredPrivs.includes(priv.nome))
        )
      } catch {
        // ignore parse errors
      }
    }
    
    if (tipo === 'leitura') {
      filteredPublicadores = filteredPublicadores.filter(p => 
        !p.restricoes?.some((r: { tipo: string; ativo: boolean }) => r.tipo === 'nao_pode_ler' && r.ativo)
      )
    }
    if (tipo === 'demonstracao') {
      filteredPublicadores = filteredPublicadores.filter(p => 
        !p.restricoes?.some((r: { tipo: string; ativo: boolean }) => r.tipo === 'nao_pode_demonstrar' && r.ativo)
      )
    }
    
    const publicadoresWithLastDesignacao = await Promise.all(
      filteredPublicadores.map(async (p) => {
        const lastDesignacao = await designacoesCollection.findOne(
          { publicadorId: p._id },
          { sort: { createdAt: -1 } }
        )
        
        const diasSemDesignacao = lastDesignacao 
          ? Math.floor((Date.now() - new Date(lastDesignacao.createdAt!).getTime()) / (1000 * 60 * 60 * 24))
          : 9999
        
        return {
          id: p._id.toString(),
          nome: p.nomeCompleto || `${p.nomePrimeiro || ''} ${p.nomeUltimo || ''}`.trim(),
          privilegios: p.privilegiosList,
          restricoes: p.restricoes?.filter((r: { ativo: boolean }) => r.ativo).map((r: { tipo: string; descricao: string }) => ({
            tipo: r.tipo,
            descricao: r.descricao
          })) || [],
          ultimaDesignacao: lastDesignacao?.createdAt?.toISOString() || null,
          diasSemDesignacao
        }
      })
    )
    
    publicadoresWithLastDesignacao.sort((a, b) => b.diasSemDesignacao - a.diasSemDesignacao)
    
    return NextResponse.json({ publicadores: publicadoresWithLastDesignacao })
  } catch (error) {
    console.error('Get publicadores disponiveis error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar publicadores disponíveis' },
      { status: 500 }
    )
  }
}
