'use server'

import { revalidatePath } from 'next/cache'
import { Etiqueta, connectDB } from '@/lib/db'

// ============================================
// ETIQUETAS - SERVER ACTIONS
// ============================================

export interface EtiquetaFormData {
  nome: string
  icone?: string
  cor?: string
  descricao?: string
  ordem?: number
}

export interface EtiquetaResponse {
  id: string
  nome: string
  icone: string
  cor: string
  descricao?: string
  ordem: number
  ativo: boolean
}

// Ícones disponíveis para etiquetas
export const ICONE_ETIQUETA = [
  { valor: 'Tag', label: 'Etiqueta', preview: '🏷️' },
  { valor: 'Key', label: 'Chave', preview: '🔑' },
  { valor: 'Home', label: 'Casa', preview: '🏠' },
  { valor: 'Users', label: 'Grupo', preview: '👥' },
  { valor: 'MapPin', label: 'Localização', preview: '📍' },
  { valor: 'Phone', label: 'Telefone', preview: '📞' },
  { valor: 'Mail', label: 'Email', preview: '📧' },
  { valor: 'Calendar', label: 'Calendário', preview: '📅' },
  { valor: 'Clock', label: 'Relógio', preview: '⏰' },
  { valor: 'Star', label: 'Estrela', preview: '⭐' },
  { valor: 'Heart', label: 'Coração', preview: '❤️' },
  { valor: 'AlertCircle', label: 'Alerta', preview: '⚠️' },
  { valor: 'CheckCircle', label: 'Confirmado', preview: '✅' },
  { valor: 'XCircle', label: 'Cancelado', preview: '❌' },
  { valor: 'Shield', label: 'Escudo', preview: '🛡️' },
  { valor: 'Zap', label: 'Rápido', preview: '⚡' },
  { valor: 'Flag', label: 'Bandeira', preview: '🚩' },
  { valor: 'Book', label: 'Livro', preview: '📖' },
  { valor: 'Briefcase', label: 'Trabalho', preview: '💼' },
  { valor: 'Building', label: 'Prédio', preview: '🏢' },
  { valor: 'Car', label: 'Carro', preview: '🚗' },
  { valor: 'Truck', label: 'Caminhão', preview: '🚚' },
  { valor: 'Wrench', label: 'Ferramenta', preview: '🔧' },
  { valor: 'Sparkles', label: 'Especial', preview: '✨' },
  { valor: 'UserX', label: 'Inativo', preview: '👤' },
  { valor: 'UserMinus', label: 'Removido', preview: '➖' },
  { valor: 'Ban', label: 'Proibido', preview: '🚫' },
  { valor: 'Lock', label: 'Bloqueado', preview: '🔒' },
  { valor: 'Unlock', label: 'Desbloqueado', preview: '🔓' },
  { valor: 'Eye', label: 'Visível', preview: '👁️' },
  { valor: 'EyeOff', label: 'Oculto', preview: '🙈' },
]

// Cores disponíveis para etiquetas
export const CORES_ETIQUETA = [
  { valor: '#EF4444', label: 'Vermelho', classe: 'bg-red-500' },
  { valor: '#F97316', label: 'Laranja', classe: 'bg-orange-500' },
  { valor: '#F59E0B', label: 'Âmbar', classe: 'bg-amber-500' },
  { valor: '#EAB308', label: 'Amarelo', classe: 'bg-yellow-500' },
  { valor: '#84CC16', label: 'Lima', classe: 'bg-lime-500' },
  { valor: '#22C55E', label: 'Verde', classe: 'bg-green-500' },
  { valor: '#10B981', label: 'Esmeralda', classe: 'bg-emerald-500' },
  { valor: '#14B8A6', label: 'Turquesa', classe: 'bg-teal-500' },
  { valor: '#06B6D4', label: 'Ciano', classe: 'bg-cyan-500' },
  { valor: '#0EA5E9', label: 'Sky', classe: 'bg-sky-500' },
  { valor: '#3B82F6', label: 'Azul', classe: 'bg-blue-500' },
  { valor: '#6366F1', label: 'Índigo', classe: 'bg-indigo-500' },
  { valor: '#8B5CF6', label: 'Violeta', classe: 'bg-violet-500' },
  { valor: '#A855F7', label: 'Púrpura', classe: 'bg-purple-500' },
  { valor: '#D946EF', label: 'Fúcsia', classe: 'bg-fuchsia-500' },
  { valor: '#EC4899', label: 'Rosa', classe: 'bg-pink-500' },
  { valor: '#F43F5E', label: 'Rosa Vermelho', classe: 'bg-rose-500' },
  { valor: '#6B7280', label: 'Cinza', classe: 'bg-gray-500' },
  { valor: '#78716C', label: 'Pedra', classe: 'bg-stone-500' },
  { valor: '#71717A', label: 'Zinco', classe: 'bg-zinc-500' },
]

function formatEtiqueta(e: any): EtiquetaResponse {
  return {
    id: e._id.toString(),
    nome: e.nome,
    icone: e.icone || 'Tag',
    cor: e.cor || '#6B7280',
    descricao: e.descricao,
    ordem: e.ordem || 0,
    ativo: e.ativo !== false
  }
}

// GET - Buscar todas as etiquetas
export async function getEtiquetas(): Promise<{ success: boolean; data?: EtiquetaResponse[]; error?: string }> {
  try {
    await connectDB()
    
    const etiquetas = await Etiqueta.find({ ativo: { $ne: false } })
      .sort({ ordem: 1, nome: 1 })
      .lean()
    
    return { 
      success: true, 
      data: etiquetas.map(formatEtiqueta) 
    }
  } catch (error: any) {
    console.error('Erro ao buscar etiquetas:', error)
    return { 
      success: false, 
      data: [], 
      error: error.message || 'Erro ao buscar etiquetas' 
    }
  }
}

// GET - Buscar etiqueta por ID
export async function getEtiquetaById(id: string): Promise<{ success: boolean; data?: EtiquetaResponse; error?: string }> {
  try {
    await connectDB()
    
    const etiqueta = await Etiqueta.findById(id).lean()
    
    if (!etiqueta) {
      return { success: false, error: 'Etiqueta não encontrada' }
    }
    
    return { success: true, data: formatEtiqueta(etiqueta) }
  } catch (error: any) {
    console.error('Erro ao buscar etiqueta:', error)
    return { success: false, error: error.message || 'Erro ao buscar etiqueta' }
  }
}

// POST - Criar nova etiqueta
export async function createEtiqueta(data: EtiquetaFormData): Promise<{ success: boolean; data?: EtiquetaResponse; error?: string }> {
  try {
    await connectDB()
    
    // Verificar se já existe
    const existing = await Etiqueta.findOne({ nome: { $regex: new RegExp(`^${data.nome}$`, 'i') } })
    if (existing) {
      return { success: false, error: 'Já existe uma etiqueta com este nome' }
    }
    
    const etiqueta = await Etiqueta.create({
      nome: data.nome,
      icone: data.icone || 'Tag',
      cor: data.cor || '#6B7280',
      descricao: data.descricao,
      ordem: data.ordem || 0
    })
    
    revalidatePath('/utilizadores')
    revalidatePath('/configuracoes')
    
    return { success: true, data: formatEtiqueta(etiqueta) }
  } catch (error: any) {
    console.error('Erro ao criar etiqueta:', error)
    return { success: false, error: error.message || 'Erro ao criar etiqueta' }
  }
}

// PUT - Atualizar etiqueta
export async function updateEtiqueta(id: string, data: Partial<EtiquetaFormData>): Promise<{ success: boolean; data?: EtiquetaResponse; error?: string }> {
  try {
    await connectDB()
    
    const updateData: any = { updatedAt: new Date() }
    
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.icone !== undefined) updateData.icone = data.icone
    if (data.cor !== undefined) updateData.cor = data.cor
    if (data.descricao !== undefined) updateData.descricao = data.descricao
    if (data.ordem !== undefined) updateData.ordem = data.ordem
    
    const etiqueta = await Etiqueta.findByIdAndUpdate(id, updateData, { new: true }).lean()
    
    if (!etiqueta) {
      return { success: false, error: 'Etiqueta não encontrada' }
    }
    
    revalidatePath('/utilizadores')
    revalidatePath('/configuracoes')
    
    return { success: true, data: formatEtiqueta(etiqueta) }
  } catch (error: any) {
    console.error('Erro ao atualizar etiqueta:', error)
    return { success: false, error: error.message || 'Erro ao atualizar etiqueta' }
  }
}

// DELETE - Remover etiqueta (soft delete)
export async function deleteEtiqueta(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()
    
    await Etiqueta.findByIdAndUpdate(id, { ativo: false, updatedAt: new Date() })
    
    revalidatePath('/utilizadores')
    revalidatePath('/configuracoes')
    
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao excluir etiqueta:', error)
    return { success: false, error: error.message || 'Erro ao excluir etiqueta' }
  }
}

// DELETE - Remover etiqueta permanentemente
export async function deleteEtiquetaPermanente(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()
    
    await Etiqueta.findByIdAndDelete(id)
    
    revalidatePath('/utilizadores')
    revalidatePath('/configuracoes')
    
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao excluir etiqueta:', error)
    return { success: false, error: error.message || 'Erro ao excluir etiqueta' }
  }
}

// GET - Etiquetas padrão para seed
export async function criarEtiquetasPadrao(): Promise<{ success: boolean; data?: EtiquetaResponse[]; error?: string }> {
  try {
    await connectDB()
    
    const etiquetasPadrao = [
      { nome: 'Chave do Salão', icone: 'Key', cor: '#F59E0B', ordem: 1 },
      { nome: 'Inativo', icone: 'UserX', cor: '#EF4444', ordem: 2 },
      { nome: 'Removido', icone: 'UserMinus', cor: '#DC2626', ordem: 3 },
      { nome: 'Irregular', icone: 'AlertCircle', cor: '#F97316', ordem: 4 },
      { nome: 'Novo', icone: 'Sparkles', cor: '#8B5CF6', ordem: 5 },
      { nome: 'Requer Atenção', icone: 'AlertCircle', cor: '#EC4899', ordem: 6 },
    ]
    
    const criadas: any[] = []
    
    for (const et of etiquetasPadrao) {
      const existing = await Etiqueta.findOne({ nome: et.nome })
      if (!existing) {
        const nova = await Etiqueta.create(et)
        criadas.push(formatEtiqueta(nova))
      }
    }
    
    return { success: true, data: criadas }
  } catch (error: any) {
    console.error('Erro ao criar etiquetas padrão:', error)
    return { success: false, data: [], error: error.message || 'Erro ao criar etiquetas padrão' }
  }
}
