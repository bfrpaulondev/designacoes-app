export interface User {
  _id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'designador'
  createdAt: Date
  updatedAt: Date
}

export interface Publicador {
  _id?: string
  nomePrimeiro: string
  nomeMeio?: string
  nomeUltimo: string
  nomeCompleto: string
  genero: 'masculino' | 'feminino'
  email?: string
  telemovel?: string
  telefoneCasa?: string
  morada?: string
  cidade?: string
  codigoPostal?: string
  latitude?: number
  longitude?: number
  dataNascimento?: Date
  dataBatismo?: Date
  tipoPublicador: 'estudante' | 'publicador_nao_batizado' | 'publicador_batizado' | 'pioneiro_auxiliar' | 'pioneiro_regular'
  privilegioServico: 'nenhum' | 'ungido' | 'anciao' | 'servo_ministerial' | 'superintendente_viajante'
  grupoCampo?: string
  grupoLimpeza?: string
  etiquetas: string[]
  restricoes: Restricao[]
  status: 'ativo' | 'inativo' | 'mudou' | 'faleceu' | 'restrito'
  observacoes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Restricao {
  tipo: string
  descricao?: string
  ativo: boolean
}

export interface Etiqueta {
  _id?: string
  nome: string
  icone: string
  cor: string
  descricao?: string
  ordem: number
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Parte {
  _id?: string
  nome: string
  descricao?: string
  duracaoMinutos: number
  numParticipantes: number
  tipo: string
  sala: 'A' | 'B' | 'ambas'
  privilegiosMinimos?: string[]
  ordem: number
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SemanaDesignacao {
  _id?: string
  dataInicio: Date
  dataFim: Date
  observacoes?: string
  status: 'rascunho' | 'publicado'
  createdAt: Date
  updatedAt: Date
}

export interface Designacao {
  _id?: string
  semanaId: string
  parteId: string
  sala: 'A' | 'B'
  publicadorId: string
  observacoes?: string
  ordem: number
  createdAt: Date
  updatedAt: Date
}
