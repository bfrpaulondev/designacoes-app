import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api'

// ============================================
// TIPOS
// ============================================

export interface TipoItem {
  id: string
  label: string
  icon?: string
  ordem?: number
  requerAnciao?: boolean
  requerServo?: boolean
  cor?: string
  ativo?: boolean
}

export interface Categoria {
  id: string
  label: string
  icon: string
  cor: string
}

export interface StatusDesignacao {
  id: string
  label: string
  cor: string
  icon: string
}

export interface TipoAusencia {
  id: string
  label: string
  icon: string
}

export interface TipoDesignacaoAusencia {
  id: string
  label: string
}

export interface DiaSemana {
  id: string
  label: string
  abrev: string
}

export interface TiposContextType {
  // Tipos de designação por categoria
  tiposDesignacao: {
    fimSemana: TipoItem[]
    meioSemana: TipoItem[]
    avIndicadores: TipoItem[]
    limpeza: TipoItem[]
    testemunhoPublico: TipoItem[]
  }
  
  // Outros tipos
  categorias: Categoria[]
  statusDesignacao: StatusDesignacao[]
  tiposAusencia: TipoAusencia[]
  tiposDesignacaoAusencia: TipoDesignacaoAusencia[]
  diasSemana: DiaSemana[]
  
  // Estado
  loading: boolean
  error: string | null
  
  // Funções utilitárias
  getTipoLabel: (tipoId: string, categoriaId: string) => string
  getCategoriaLabel: (categoriaId: string) => string
  getStatusLabel: (statusId: string) => string
  getStatusColor: (statusId: string) => string
  getTipoIcon: (tipoId: string, categoriaId: string) => string
}

const TiposContext = createContext<TiposContextType | undefined>(undefined)

// Valores padrão
const DEFAULT_VALUES: TiposContextType = {
  tiposDesignacao: {
    fimSemana: [],
    meioSemana: [],
    avIndicadores: [],
    limpeza: [],
    testemunhoPublico: [],
  },
  categorias: [],
  statusDesignacao: [],
  tiposAusencia: [],
  tiposDesignacaoAusencia: [],
  diasSemana: [],
  loading: true,
  error: null,
  getTipoLabel: (tipoId) => tipoId,
  getCategoriaLabel: (categoriaId) => categoriaId,
  getStatusLabel: (statusId) => statusId,
  getStatusColor: () => '#757575',
  getTipoIcon: () => '📝',
}

export function TiposProvider({ children }: { children: ReactNode }) {
  const [tiposDesignacao, setTiposDesignacao] = useState(DEFAULT_VALUES.tiposDesignacao)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [statusDesignacao, setStatusDesignacao] = useState<StatusDesignacao[]>([])
  const [tiposAusencia, setTiposAusencia] = useState<TipoAusencia[]>([])
  const [tiposDesignacaoAusencia, setTiposDesignacaoAusencia] = useState<TipoDesignacaoAusencia[]>([])
  const [diasSemana, setDiasSemana] = useState<DiaSemana[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTipos()
  }, [])

  const loadTipos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/config-programacao')
      const config = response.data.config
      
      if (config) {
        setTiposDesignacao(config.tiposDesignacao || DEFAULT_VALUES.tiposDesignacao)
        setCategorias(config.categorias || [])
        setStatusDesignacao(config.statusDesignacao || [])
        setTiposAusencia(config.tiposAusencia || [])
        setTiposDesignacaoAusencia(config.tiposDesignacaoAusencia || [])
        setDiasSemana(config.diasSemana || [])
      }
    } catch (err: any) {
      console.error('Erro ao carregar tipos:', err)
      setError(err.message || 'Erro ao carregar tipos')
    } finally {
      setLoading(false)
    }
  }

  const getTipoLabel = (tipoId: string, categoriaId: string): string => {
    const categoria = tiposDesignacao[categoriaId as keyof typeof tiposDesignacao]
    if (categoria) {
      const tipo = categoria.find(t => t.id === tipoId)
      if (tipo) return tipo.label
    }
    return tipoId
  }

  const getCategoriaLabel = (categoriaId: string): string => {
    const cat = categorias.find(c => c.id === categoriaId)
    return cat?.label || categoriaId
  }

  const getStatusLabel = (statusId: string): string => {
    const status = statusDesignacao.find(s => s.id === statusId)
    return status?.label || statusId
  }

  const getStatusColor = (statusId: string): string => {
    const status = statusDesignacao.find(s => s.id === statusId)
    return status?.cor || '#757575'
  }

  const getTipoIcon = (tipoId: string, categoriaId: string): string => {
    const categoria = tiposDesignacao[categoriaId as keyof typeof tiposDesignacao]
    if (categoria) {
      const tipo = categoria.find(t => t.id === tipoId)
      if (tipo?.icon) return tipo.icon
    }
    return '📝'
  }

  const value: TiposContextType = {
    tiposDesignacao,
    categorias,
    statusDesignacao,
    tiposAusencia,
    tiposDesignacaoAusencia,
    diasSemana,
    loading,
    error,
    getTipoLabel,
    getCategoriaLabel,
    getStatusLabel,
    getStatusColor,
    getTipoIcon,
  }

  return (
    <TiposContext.Provider value={value}>
      {children}
    </TiposContext.Provider>
  )
}

export function useTipos() {
  const context = useContext(TiposContext)
  if (context === undefined) {
    throw new Error('useTipos must be used within a TiposProvider')
  }
  return context
}

// Hook para obter tipos de uma categoria específica
export function useTiposCategoria(categoria: string) {
  const { tiposDesignacao, loading } = useTipos()
  return {
    tipos: tiposDesignacao[categoria as keyof typeof tiposDesignacao] || [],
    loading
  }
}

// Hook para obter lista de tipos para dropdown
export function useTiposOptions(categoria: string) {
  const { tiposDesignacao, loading } = useTipos()
  const tipos = tiposDesignacao[categoria as keyof typeof tiposDesignacao] || []
  
  return {
    options: tipos.map(t => ({ value: t.id, label: t.label })),
    loading
  }
}
