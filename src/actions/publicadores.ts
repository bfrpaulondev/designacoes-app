'use server'

import { revalidatePath } from 'next/cache'
import { Publicador, Etiqueta, Privilegio, connectDB } from '@/lib/db'

// Helper para garantir que temos dados válidos
function safeArray<T>(data: T[] | undefined | null): T[] {
  if (!data) return []
  if (!Array.isArray(data)) return []
  return data
}

// ============================================
// PUBLICADORES - SERVER ACTIONS
// ============================================

export interface PublicadorFormData {
  nomePrimeiro: string
  nomeMeio?: string
  nomeUltimo: string
  sufixo?: string
  etiqueta?: string
  contactoFamilia?: string
  genero: 'masculino' | 'feminino'
  dataNascimento?: string
  telemovel?: string
  telefoneCasa?: string
  outroTelefone?: string
  email?: string
  morada?: string
  morada2?: string
  codigoPostal?: string
  cidade?: string
  latitude?: number
  longitude?: number
  dataBatismo?: string
  tipoPublicador?: string
  privilegioServico?: string
  privilegios?: string[]
  etiquetas?: string[]
  grupoCampo?: string
  grupoLimpeza?: string
  status?: string
  restricoes?: { tipo: string; descricao: string; ativo: boolean }[]
  observacoes?: string
}

export interface PublicadorResponse {
  id: string
  nomeCompleto: string
  nomePrimeiro: string
  nomeMeio?: string
  nomeUltimo: string
  sufixo?: string
  etiqueta?: string
  contactoFamilia?: string
  genero: string
  dataNascimento?: string
  telemovel?: string
  telefoneCasa?: string
  outroTelefone?: string
  email?: string
  morada?: string
  morada2?: string
  codigoPostal?: string
  cidade?: string
  latitude?: number
  longitude?: number
  dataBatismo?: string
  tipoPublicador: string
  privilegioServico: string
  privilegios: { id: string; nome: string }[]
  etiquetas: { id: string; nome: string; icone: string; cor: string }[]
  grupoCampo?: string
  grupoLimpeza?: string
  status: string
  restricoes: { tipo: string; descricao: string; ativo: boolean }[]
  observacoes?: string
  foto?: string
}

function formatPublicador(p: any): PublicadorResponse {
  return {
    id: p._id.toString(),
    nomeCompleto: p.nomeCompleto || `${p.nomePrimeiro} ${p.nomeUltimo}`,
    nomePrimeiro: p.nomePrimeiro,
    nomeMeio: p.nomeMeio,
    nomeUltimo: p.nomeUltimo,
    sufixo: p.sufixo,
    etiqueta: p.etiqueta,
    contactoFamilia: p.contactoFamilia,
    genero: p.genero,
    dataNascimento: p.dataNascimento?.toISOString(),
    telemovel: p.telemovel,
    telefoneCasa: p.telefoneCasa,
    outroTelefone: p.outroTelefone,
    email: p.email,
    morada: p.morada,
    morada2: p.morada2,
    codigoPostal: p.codigoPostal,
    cidade: p.cidade,
    latitude: p.latitude,
    longitude: p.longitude,
    dataBatismo: p.dataBatismo?.toISOString(),
    tipoPublicador: p.tipoPublicador || 'publicador_batizado',
    privilegioServico: p.privilegioServico || 'nenhum',
    privilegios: (p.privilegios || []).map((priv: any) => ({
      id: priv._id?.toString() || priv.toString(),
      nome: priv.nome || ''
    })),
    etiquetas: (p.etiquetas || []).map((et: any) => ({
      id: et._id?.toString() || et.toString(),
      nome: et.nome || '',
      icone: et.icone || 'Tag',
      cor: et.cor || '#6B7280'
    })),
    grupoCampo: p.grupoCampo,
    grupoLimpeza: p.grupoLimpeza,
    status: p.status || 'ativo',
    restricoes: p.restricoes?.filter((r: any) => r.ativo) || [],
    observacoes: p.observacoes,
    foto: p.foto
  }
}

// GET - Buscar todos os publicadores
export async function getPublicadores(filters?: {
  status?: string
  genero?: string
  etiqueta?: string
  grupoCampo?: string
  grupoLimpeza?: string
  tipoPublicador?: string
  privilegioServico?: string
  search?: string
}): Promise<{ success: boolean; data?: PublicadorResponse[]; error?: string }> {
  try {
    console.log('[getPublicadores] Starting...')
    await connectDB()
    console.log('[getPublicadores] Connected to DB')
    
    const query: any = { status: { $ne: 'deletado' } }
    
    if (filters?.status && filters.status !== 'todos') {
      query.status = filters.status
    }
    if (filters?.genero && filters.genero !== 'todos') {
      query.genero = filters.genero
    }
    if (filters?.etiqueta && filters.etiqueta !== 'todos') {
      query.etiquetas = filters.etiqueta
    }
    if (filters?.grupoCampo && filters.grupoCampo !== 'todos') {
      query.grupoCampo = filters.grupoCampo
    }
    if (filters?.grupoLimpeza && filters.grupoLimpeza !== 'todos') {
      query.grupoLimpeza = filters.grupoLimpeza
    }
    if (filters?.tipoPublicador && filters.tipoPublicador !== 'todos') {
      query.tipoPublicador = filters.tipoPublicador
    }
    if (filters?.privilegioServico && filters.privilegioServico !== 'todos') {
      query.privilegioServico = filters.privilegioServico
    }
    if (filters?.search) {
      query.$or = [
        { nomeCompleto: { $regex: filters.search, $options: 'i' } },
        { nomePrimeiro: { $regex: filters.search, $options: 'i' } },
        { nomeUltimo: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { telemovel: { $regex: filters.search, $options: 'i' } },
        { cidade: { $regex: filters.search, $options: 'i' } }
      ]
    }
    
    const publicadores = await Publicador.find(query)
      .populate('privilegios')
      .populate('etiquetas')
      .sort({ nomeCompleto: 1 })
      .lean()
    
    console.log('[getPublicadores] Found', publicadores.length, 'publicadores')
    
    return { 
      success: true, 
      data: publicadores.map(formatPublicador) 
    }
  } catch (error: any) {
    console.error('[getPublicadores] Error:', error.message)
    console.error('[getPublicadores] Error stack:', error.stack)
    // Retornar array vazio em caso de erro para evitar crash no frontend
    return { 
      success: false, 
      data: [],
      error: error.message || 'Erro ao buscar publicadores' 
    }
  }
}

// GET - Buscar publicador por ID
export async function getPublicadorById(id: string): Promise<{ success: boolean; data?: PublicadorResponse; error?: string }> {
  try {
    await connectDB()
    
    const publicador = await Publicador.findById(id)
      .populate('privilegios')
      .populate('etiquetas')
      .lean()
    
    if (!publicador) {
      return { success: false, error: 'Publicador não encontrado' }
    }
    
    return { success: true, data: formatPublicador(publicador) }
  } catch (error: any) {
    console.error('Erro ao buscar publicador:', error)
    return { success: false, error: error.message || 'Erro ao buscar publicador' }
  }
}

// POST - Criar novo publicador
export async function createPublicador(data: PublicadorFormData): Promise<{ success: boolean; data?: PublicadorResponse; error?: string }> {
  try {
    await connectDB()
    
    const publicadorData: any = {
      nomePrimeiro: data.nomePrimeiro,
      nomeUltimo: data.nomeUltimo,
      genero: data.genero,
      status: data.status || 'ativo'
    }
    
    // Campos opcionais
    if (data.nomeMeio) publicadorData.nomeMeio = data.nomeMeio
    if (data.sufixo) publicadorData.sufixo = data.sufixo
    if (data.etiqueta) publicadorData.etiqueta = data.etiqueta
    if (data.contactoFamilia) publicadorData.contactoFamilia = data.contactoFamilia
    if (data.dataNascimento) publicadorData.dataNascimento = new Date(data.dataNascimento)
    if (data.telemovel) publicadorData.telemovel = data.telemovel
    if (data.telefoneCasa) publicadorData.telefoneCasa = data.telefoneCasa
    if (data.outroTelefone) publicadorData.outroTelefone = data.outroTelefone
    if (data.email) publicadorData.email = data.email
    if (data.morada) publicadorData.morada = data.morada
    if (data.morada2) publicadorData.morada2 = data.morada2
    if (data.codigoPostal) publicadorData.codigoPostal = data.codigoPostal
    if (data.cidade) publicadorData.cidade = data.cidade
    if (data.latitude !== undefined) publicadorData.latitude = data.latitude
    if (data.longitude !== undefined) publicadorData.longitude = data.longitude
    if (data.dataBatismo) publicadorData.dataBatismo = new Date(data.dataBatismo)
    if (data.tipoPublicador) publicadorData.tipoPublicador = data.tipoPublicador
    if (data.privilegioServico) publicadorData.privilegioServico = data.privilegioServico
    if (data.privilegios?.length) publicadorData.privilegios = data.privilegios
    if (data.etiquetas?.length) publicadorData.etiquetas = data.etiquetas
    if (data.grupoCampo) publicadorData.grupoCampo = data.grupoCampo
    if (data.grupoLimpeza) publicadorData.grupoLimpeza = data.grupoLimpeza
    if (data.restricoes?.length) publicadorData.restricoes = data.restricoes
    if (data.observacoes) publicadorData.observacoes = data.observacoes
    
    const publicador = await Publicador.create(publicadorData)
    
    const populated = await Publicador.findById(publicador._id)
      .populate('privilegios')
      .populate('etiquetas')
      .lean()
    
    revalidatePath('/utilizadores')
    
    return { success: true, data: formatPublicador(populated) }
  } catch (error: any) {
    console.error('Erro ao criar publicador:', error)
    return { success: false, error: error.message || 'Erro ao criar publicador' }
  }
}

// PUT - Atualizar publicador
export async function updatePublicador(id: string, data: Partial<PublicadorFormData>): Promise<{ success: boolean; data?: PublicadorResponse; error?: string }> {
  try {
    await connectDB()
    
    const updateData: any = { updatedAt: new Date() }
    
    // Copiar apenas campos fornecidos
    if (data.nomePrimeiro !== undefined) updateData.nomePrimeiro = data.nomePrimeiro
    if (data.nomeMeio !== undefined) updateData.nomeMeio = data.nomeMeio
    if (data.nomeUltimo !== undefined) updateData.nomeUltimo = data.nomeUltimo
    if (data.sufixo !== undefined) updateData.sufixo = data.sufixo
    if (data.etiqueta !== undefined) updateData.etiqueta = data.etiqueta
    if (data.contactoFamilia !== undefined) updateData.contactoFamilia = data.contactoFamilia
    if (data.genero !== undefined) updateData.genero = data.genero
    if (data.dataNascimento !== undefined) updateData.dataNascimento = data.dataNascimento ? new Date(data.dataNascimento) : null
    if (data.telemovel !== undefined) updateData.telemovel = data.telemovel
    if (data.telefoneCasa !== undefined) updateData.telefoneCasa = data.telefoneCasa
    if (data.outroTelefone !== undefined) updateData.outroTelefone = data.outroTelefone
    if (data.email !== undefined) updateData.email = data.email
    if (data.morada !== undefined) updateData.morada = data.morada
    if (data.morada2 !== undefined) updateData.morada2 = data.morada2
    if (data.codigoPostal !== undefined) updateData.codigoPostal = data.codigoPostal
    if (data.cidade !== undefined) updateData.cidade = data.cidade
    if (data.latitude !== undefined) updateData.latitude = data.latitude
    if (data.longitude !== undefined) updateData.longitude = data.longitude
    if (data.dataBatismo !== undefined) updateData.dataBatismo = data.dataBatismo ? new Date(data.dataBatismo) : null
    if (data.tipoPublicador !== undefined) updateData.tipoPublicador = data.tipoPublicador
    if (data.privilegioServico !== undefined) updateData.privilegioServico = data.privilegioServico
    if (data.privilegios !== undefined) updateData.privilegios = data.privilegios
    if (data.etiquetas !== undefined) updateData.etiquetas = data.etiquetas
    if (data.grupoCampo !== undefined) updateData.grupoCampo = data.grupoCampo
    if (data.grupoLimpeza !== undefined) updateData.grupoLimpeza = data.grupoLimpeza
    if (data.status !== undefined) updateData.status = data.status
    if (data.restricoes !== undefined) updateData.restricoes = data.restricoes
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes
    
    const publicador = await Publicador.findByIdAndUpdate(id, updateData, { new: true })
      .populate('privilegios')
      .populate('etiquetas')
      .lean()
    
    if (!publicador) {
      return { success: false, error: 'Publicador não encontrado' }
    }
    
    revalidatePath('/utilizadores')
    
    return { success: true, data: formatPublicador(publicador) }
  } catch (error: any) {
    console.error('Erro ao atualizar publicador:', error)
    return { success: false, error: error.message || 'Erro ao atualizar publicador' }
  }
}

// DELETE - Remover publicador (soft delete)
export async function deletePublicador(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()
    
    await Publicador.findByIdAndUpdate(id, { status: 'deletado', updatedAt: new Date() })
    
    revalidatePath('/utilizadores')
    
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao excluir publicador:', error)
    return { success: false, error: error.message || 'Erro ao excluir publicador' }
  }
}

// GET - Buscar publicadores para o mapa
export async function getPublicadoresMapa(filters?: {
  grupoCampo?: string
  grupoLimpeza?: string
  etiqueta?: string
}): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB()
    
    const query: any = { 
      status: 'ativo',
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }
    
    if (filters?.grupoCampo && filters.grupoCampo !== 'todos') {
      query.grupoCampo = filters.grupoCampo
    }
    if (filters?.grupoLimpeza && filters.grupoLimpeza !== 'todos') {
      query.grupoLimpeza = filters.grupoLimpeza
    }
    if (filters?.etiqueta && filters.etiqueta !== 'todos') {
      query.etiquetas = filters.etiqueta
    }
    
    const publicadores = await Publicador.find(query)
      .populate('etiquetas')
      .select('nomeCompleto morada cidade latitude longitude grupoCampo grupoLimpeza etiquetas')
      .lean()
    
    const data = publicadores.map(p => ({
      id: p._id.toString(),
      nome: p.nomeCompleto,
      morada: p.morada,
      cidade: p.cidade,
      latitude: p.latitude,
      longitude: p.longitude,
      grupoCampo: p.grupoCampo,
      grupoLimpeza: p.grupoLimpeza,
      etiquetas: (p.etiquetas || []).map((e: any) => ({
        nome: e.nome,
        cor: e.cor,
        icone: e.icone
      }))
    }))
    
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao buscar publicadores para mapa:', error)
    return { success: false, data: [], error: error.message || 'Erro ao buscar dados do mapa' }
  }
}

// GET - Listas para filtros
export async function getGruposCampo(): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    await connectDB()
    
    const grupos = await Publicador.distinct('grupoCampo', { status: 'ativo', grupoCampo: { $ne: null } })
    return { success: true, data: grupos.sort() }
  } catch (error: any) {
    return { success: false, data: [], error: error.message || 'Erro ao buscar grupos' }
  }
}

export async function getGruposLimpeza(): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    await connectDB()
    
    const grupos = await Publicador.distinct('grupoLimpeza', { status: 'ativo', grupoLimpeza: { $ne: null } })
    return { success: true, data: grupos.sort() }
  } catch (error: any) {
    return { success: false, data: [], error: error.message || 'Erro ao buscar grupos' }
  }
}
