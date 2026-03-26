import { create } from "zustand"

// Types
export interface Privilegio {
  id: string
  nome: string
  ordem: number
}

export interface Restricao {
  id: string
  tipo: string
  descricao: string | null
  ativo: boolean
}

export interface PublicadorPrivilegio {
  id: string
  privilegio: Privilegio
}

export interface Publicador {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  dataNascimento: string | null
  dataBatismo: string | null
  foto: string | null
  status: string
  observacoes: string | null
  createdAt: string
  updatedAt: string
  privilegios: PublicadorPrivilegio[]
  restricoes: Restricao[]
  designacoes?: Designacao[]
}

export interface Parte {
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

export interface SemanaDesignacao {
  id: string
  dataInicio: string
  dataFim: string
  observacoes: string | null
  designacoes: Designacao[]
}

export interface Designacao {
  id: string
  semanaId: string
  parteId: string
  sala: string
  publicadorId: string
  observacoes: string | null
  createdAt: string
  parte: Parte
  publicador: Publicador
}

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface Configuracoes {
  nome_congregacao?: string
  horario_reuniao?: string
  logo?: string
  [key: string]: string | undefined
}

// Store State
interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void

  // Navigation
  currentPage: string
  setCurrentPage: (page: string) => void

  // Publicadores
  publicadores: Publicador[]
  setPublicadores: (publicadores: Publicador[]) => void
  addPublicador: (publicador: Publicador) => void
  updatePublicador: (id: string, publicador: Publicador) => void
  removePublicador: (id: string) => void

  // Partes
  partes: Parte[]
  setPartes: (partes: Parte[]) => void
  addParte: (parte: Parte) => void
  updateParte: (id: string, parte: Parte) => void
  removeParte: (id: string) => void

  // Designações
  semanas: SemanaDesignacao[]
  setSemanas: (semanas: SemanaDesignacao[]) => void
  addSemana: (semana: SemanaDesignacao) => void
  currentSemana: SemanaDesignacao | null
  setCurrentSemana: (semana: SemanaDesignacao | null) => void

  // Privilegios
  privilegios: Privilegio[]
  setPrivilegios: (privilegios: Privilegio[]) => void

  // Configurações
  configuracoes: Configuracoes
  setConfiguracoes: (configuracoes: Configuracoes) => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),

  // Navigation
  currentPage: "dashboard",
  setCurrentPage: (page) => set({ currentPage: page }),

  // Publicadores
  publicadores: [],
  setPublicadores: (publicadores) => set({ publicadores }),
  addPublicador: (publicador) =>
    set((state) => ({
      publicadores: [...state.publicadores, publicador].sort((a, b) =>
        a.nome.localeCompare(b.nome)
      ),
    })),
  updatePublicador: (id, publicador) =>
    set((state) => ({
      publicadores: state.publicadores
        .map((p) => (p.id === id ? publicador : p))
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    })),
  removePublicador: (id) =>
    set((state) => ({
      publicadores: state.publicadores.filter((p) => p.id !== id),
    })),

  // Partes
  partes: [],
  setPartes: (partes) => set({ partes }),
  addParte: (parte) =>
    set((state) => ({
      partes: [...state.partes, parte].sort((a, b) => a.ordem - b.ordem),
    })),
  updateParte: (id, parte) =>
    set((state) => ({
      partes: state.partes
        .map((p) => (p.id === id ? parte : p))
        .sort((a, b) => a.ordem - b.ordem),
    })),
  removeParte: (id) =>
    set((state) => ({
      partes: state.partes.filter((p) => p.id !== id),
    })),

  // Designações
  semanas: [],
  setSemanas: (semanas) => set({ semanas }),
  addSemana: (semana) =>
    set((state) => ({
      semanas: [semana, ...state.semanas],
    })),
  currentSemana: null,
  setCurrentSemana: (semana) => set({ currentSemana: semana }),

  // Privilegios
  privilegios: [],
  setPrivilegios: (privilegios) => set({ privilegios }),

  // Configurações
  configuracoes: {},
  setConfiguracoes: (configuracoes) => set({ configuracoes }),

  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  loading: false,
  setLoading: (loading) => set({ loading }),
}))

// Helper function to check if publicador has restriction
export const hasRestriction = (
  publicador: Publicador,
  tipo: string
): boolean => {
  return publicador.restricoes.some(
    (r) => r.tipo === tipo && r.ativo
  )
}

// Helper function to check if publicador meets privilege requirements
export const meetsPrivilegeRequirements = (
  publicador: Publicador,
  privilegiosMinimos: string | null
): boolean => {
  if (!privilegiosMinimos) return true

  try {
    const required = JSON.parse(privilegiosMinimos) as string[]
    const publicadorPrivilegios = publicador.privilegios.map(
      (p) => p.privilegio.nome
    )
    return required.some((priv) => publicadorPrivilegios.includes(priv))
  } catch {
    return true
  }
}

// Helper function to get last designation date
export const getLastDesignationDate = (
  publicador: Publicador
): Date | null => {
  if (!publicador.designacoes || publicador.designacoes.length === 0) {
    return null
  }
  const dates = publicador.designacoes.map((d) => new Date(d.createdAt))
  return new Date(Math.max(...dates.getTime()))
}

// Helper function to get days since last designation
export const getDaysSinceLastDesignation = (
  publicador: Publicador
): number | null => {
  const lastDate = getLastDesignationDate(publicador)
  if (!lastDate) return null
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - lastDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
