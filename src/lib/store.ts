import { create } from 'zustand'

export type User = {
  id: string
  email: string
  name: string
  role: string
}

export type Publicador = {
  id: string
  nome: string
  nomeCompleto?: string
  email: string | null
  telefone: string | null
  telemovel?: string | null
  dataNascimento: string | null
  dataBatismo: string | null
  foto: string | null
  status: string
  tipoPublicador?: string
  privilegioServico?: string
  observacoes: string | null
  privilegios: { id: string; nome: string }[]
  etiquetas?: { id: string; nome: string; icone?: string; cor?: string }[]
  restricoes: { id?: string; tipo: string; descricao: string | null; ativo: boolean }[]
  grupoCampo?: string | null
  grupoLimpeza?: string | null
  cidade?: string | null
  morada?: string | null
  genero?: string
}

export type Parte = {
  id: string
  nome: string
  descricao: string | null
  duracaoMinutos: number
  numParticipantes: number
  tipo: string
  sala: string
  privilegiosMinimos: string | null
  ordem: number
  ativo: boolean
}

export type Designacao = {
  id: string
  semanaId: string
  parteId: string
  sala: string
  publicadorId: string
  observacoes: string | null
  ordem: number
  publicador?: Publicador
  parte?: Parte
}

export type SemanaDesignacao = {
  id: string
  dataInicio: string
  dataFim: string
  observacoes: string | null
  status: string
  designacoes: Designacao[]
}

type AppState = {
  user: User | null
  setUser: (user: User | null) => void
  
  currentView: 'dashboard' | 'publicadores' | 'partes' | 'designacoes' | 'configuracoes' | 'login' | 'utilizadores'
  setCurrentView: (view: AppState['currentView']) => void
  
  publicadores: Publicador[]
  setPublicadores: (publicadores: Publicador[]) => void
  
  partes: Parte[]
  setPartes: (partes: Parte[]) => void
  
  semanas: SemanaDesignacao[]
  setSemanas: (semanas: SemanaDesignacao[]) => void
  
  selectedSemana: SemanaDesignacao | null
  setSelectedSemana: (semana: SemanaDesignacao | null) => void
  
  config: {
    nomeCongregacao: string
    logo: string | null
  }
  setConfig: (config: AppState['config']) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  currentView: 'login',
  setCurrentView: (currentView) => set({ currentView }),
  
  publicadores: [],
  setPublicadores: (publicadores) => set({ publicadores }),
  
  partes: [],
  setPartes: (partes) => set({ partes }),
  
  semanas: [],
  setSemanas: (semanas) => set({ semanas }),
  
  selectedSemana: null,
  setSelectedSemana: (selectedSemana) => set({ selectedSemana }),
  
  config: {
    nomeCongregacao: 'Nossa Congregação',
    logo: null
  },
  setConfig: (config) => set({ config })
}))
