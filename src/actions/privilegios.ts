'use server'

import { Privilegio, connectDB } from '@/lib/db'

// ============================================
// PRIVILÉGIOS - SERVER ACTIONS
// ============================================

export interface PrivilegioResponse {
  id: string
  nome: string
  ordem: number
}

function formatPrivilegio(p: any): PrivilegioResponse {
  return {
    id: p._id.toString(),
    nome: p.nome,
    ordem: p.ordem || 0
  }
}

// GET - Buscar todos os privilégios
export async function getPrivilegios(): Promise<{ success: boolean; data?: PrivilegioResponse[]; error?: string }> {
  try {
    await connectDB()
    
    const privilegios = await Privilegio.find({})
      .sort({ ordem: 1 })
      .lean()
    
    return { 
      success: true, 
      data: privilegios.map(formatPrivilegio) 
    }
  } catch (error: any) {
    console.error('Erro ao buscar privilégios:', error)
    return { 
      success: false, 
      data: [], 
      error: error.message || 'Erro ao buscar privilégios' 
    }
  }
}

// GET - Criar privilégios padrão
export async function criarPrivilegiosPadrao(): Promise<{ success: boolean; data?: PrivilegioResponse[]; error?: string }> {
  try {
    await connectDB()
    
    const privilegiosPadrao = [
      { nome: 'Estudante', ordem: 1 },
      { nome: 'Publicador Não Batizado', ordem: 2 },
      { nome: 'Publicador Batizado', ordem: 3 },
      { nome: 'Pioneiro Auxiliar', ordem: 4 },
      { nome: 'Pioneiro Regular', ordem: 5 },
      { nome: 'Servo Ministerial', ordem: 6 },
      { nome: 'Ancião', ordem: 7 },
      { nome: 'Superintendente Viajante', ordem: 8 },
    ]
    
    const criados: any[] = []
    
    for (const priv of privilegiosPadrao) {
      const existing = await Privilegio.findOne({ nome: priv.nome })
      if (!existing) {
        const novo = await Privilegio.create(priv)
        criados.push(formatPrivilegio(novo))
      } else {
        criados.push(formatPrivilegio(existing))
      }
    }
    
    return { success: true, data: criados }
  } catch (error: any) {
    console.error('Erro ao criar privilégios:', error)
    return { success: false, data: [], error: error.message || 'Erro ao criar privilégios' }
  }
}

// Tipos de Publicador
export const TIPOS_PUBLICADOR = [
  { valor: 'estudante', label: 'Estudante' },
  { valor: 'publicador_nao_batizado', label: 'Publicador Não Batizado' },
  { valor: 'publicador_batizado', label: 'Publicador Batizado' },
  { valor: 'pioneiro_auxiliar', label: 'Pioneiro Auxiliar' },
  { valor: 'pioneiro_regular', label: 'Pioneiro Regular' },
]

// Privilégios de Serviço
export const PRIVILEGIOS_SERVICO = [
  { valor: 'nenhum', label: 'Nenhum' },
  { valor: 'ungido', label: 'Ungido' },
  { valor: 'anciao', label: 'Ancião' },
  { valor: 'servo_ministerial', label: 'Servo Ministerial' },
  { valor: 'superintendente_viajante', label: 'Superintendente Viajante' },
]

// Status
export const STATUS_PUBLICADOR = [
  { valor: 'ativo', label: 'Ativo', cor: '#22C55E' },
  { valor: 'inativo', label: 'Inativo', cor: '#6B7280' },
  { valor: 'mudou', label: 'Mudou', cor: '#F59E0B' },
  { valor: 'faleceu', label: 'Faleceu', cor: '#EF4444' },
  { valor: 'restrito', label: 'Restricto', cor: '#DC2626' },
]

// Tipos de Restrição
export const TIPOS_RESTRICAO = [
  { valor: 'nao_pode_ler', label: 'Não pode ler' },
  { valor: 'nao_pode_demonstrar', label: 'Não pode demonstrar' },
  { valor: 'restricao_menores', label: 'Restrição de menores' },
  { valor: 'outros', label: 'Outros' },
]
