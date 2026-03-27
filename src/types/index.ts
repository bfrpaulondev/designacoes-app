// Tipos principais do sistema

export interface Publicador {
  id: string
  nome: string
  nomeCompleto: string
  nomePrimeiro: string
  nomeUltimo: string
  nomeMeio?: string
  sufixo?: string
  email?: string
  telemovel?: string
  telefoneCasa?: string
  telefoneOutro?: string
  genero: 'masculino' | 'feminino'
  dataNascimento?: string
  dataBatismo?: string
  tipoPublicador: string
  privilegioServico: string
  ungido?: boolean
  grupoCampo?: string
  grupoLimpeza?: string
  morada?: string
  morada2?: string
  codigoPostal?: string
  cidade?: string
  latitude?: number
  longitude?: number
  status: string
  etiquetas?: string[]
  familiaId?: string
  familiaNome?: string
  contatoFamilia?: boolean
  observacoes?: string
  primeiroMes?: string
  lingua?: string
  relataFilial?: boolean
  consentimentoDados?: string
}

export interface Familia {
  id: string
  nome: string
  membros: string[]
}

export interface RelatorioCampo {
  id: string
  publicadorId: string
  publicadorNome: string
  mes: string // formato: YYYY-MM
  horas: number
  revisitas: number
  estudos: number
  videos: number
  publicacoes: number
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Designacao {
  id: string
  publicadorId: string
  publicadorNome: string
  tipo: 'leitor' | 'oracao' | 'presidente' | 'indicador' | 'microfone' | 'som' | 'plataforma' | 'limpeza'
  data: string
  reuniao: 'meio_semana' | 'fim_semana'
  status: 'agendado' | 'realizado' | 'cancelado' | 'substituido'
  observacoes?: string
  substitutoId?: string
  substitutoNome?: string
  criadoEm: string
}

export interface EstatisticasAtividade {
  publicadorId: string
  publicadorNome: string
  totalHoras: number
  totalRevisitas: number
  totalEstudos: number
  totalVideos: number
  totalPublicacoes: number
  mediaHoras: number
  mesesAtivos: number
}

export interface EstatisticasGrupo {
  grupoCampo: string
  totalPublicadores: number
  totalHoras: number
  mediaHoras: number
  pioneiros: number
  ancioas: number
  servosMinisteriais: number
}

export interface EstatisticasFamilia {
  familiaId: string
  familiaNome: string
  totalMembros: number
  totalHoras: number
  publicadores: {
    id: string
    nome: string
    horas: number
  }[]
}

// Ausências - Sistema melhorado com dias específicos
export type TipoAusencia = 'periodo' | 'dias_especificos' | 'recorrente'

export type DiaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo'

export type TipoDesignacaoAusencia = 
  | 'todas' 
  | 'reuniao_meio_semana' 
  | 'reuniao_fim_semana' 
  | 'testemunho_publico'
  | 'leitor'
  | 'oracao'
  | 'presidente'
  | 'indicador'
  | 'microfone'
  | 'som'
  | 'plataforma'
  | 'limpeza'

export interface Ausencia {
  id: string
  publicadorId: string
  publicadorNome: string
  
  // Tipo de ausência
  tipo: TipoAusencia
  
  // Para período contínuo
  dataInicio?: string // formato: YYYY-MM-DD
  dataFim?: string // formato: YYYY-MM-DD
  
  // Para dias específicos (array de datas)
  diasEspecificos?: string[] // array de datas YYYY-MM-DD
  
  // Para recorrente
  diasSemana?: DiaSemana[] // dias da semana que repete
  recorrenciaInicio?: string
  recorrenciaFim?: string
  
  // Tipos de designação afetados
  tiposDesignacao: TipoDesignacaoAusencia[]
  
  // Notas
  notas?: string
  
  // Metadata
  criadoEm: string
  atualizadoEm: string
}

// Constantes para ausências
export const DIAS_SEMANA: { value: DiaSemana; label: string; abrev: string }[] = [
  { value: 'segunda', label: 'Segunda-feira', abrev: 'Seg' },
  { value: 'terca', label: 'Terça-feira', abrev: 'Ter' },
  { value: 'quarta', label: 'Quarta-feira', abrev: 'Qua' },
  { value: 'quinta', label: 'Quinta-feira', abrev: 'Qui' },
  { value: 'sexta', label: 'Sexta-feira', abrev: 'Sex' },
  { value: 'sabado', label: 'Sábado', abrev: 'Sáb' },
  { value: 'domingo', label: 'Domingo', abrev: 'Dom' },
]

export const TIPOS_DESIGNACAO_AUSENCIA: { value: TipoDesignacaoAusencia; label: string }[] = [
  { value: 'todas', label: 'Todas as designações' },
  { value: 'reuniao_meio_semana', label: 'Reunião de Meio de Semana' },
  { value: 'reuniao_fim_semana', label: 'Reunião de Fim de Semana' },
  { value: 'testemunho_publico', label: 'Testemunho Público' },
  { value: 'leitor', label: 'Leitor' },
  { value: 'oracao', label: 'Oração' },
  { value: 'presidente', label: 'Presidente' },
  { value: 'indicador', label: 'Indicador' },
  { value: 'microfone', label: 'Microfone' },
  { value: 'som', label: 'Som' },
  { value: 'plataforma', label: 'Plataforma' },
  { value: 'limpeza', label: 'Limpeza' },
]

// Constantes
export const TIPOS_PUBLICADOR = [
  { value: 'estudante', label: 'Estudante da Bíblia' },
  { value: 'publicador_nao_batizado', label: 'Publicador Não Batizado' },
  { value: 'publicador_batizado', label: 'Publicador Batizado' },
  { value: 'pioneiro_auxiliar', label: 'Pioneiro Auxiliar' },
  { value: 'pioneiro_auxiliar_continuo', label: 'Pioneiro Auxiliar Contínuo' },
  { value: 'pioneiro_regular', label: 'Pioneiro Regular' },
  { value: 'pioneiro_especial', label: 'Pioneiro Especial' },
  { value: 'missionario', label: 'Missionário de Campo' },
  { value: 'visitante', label: 'Visitante' },
]

export const PRIVILEGIOS = [
  { value: 'nenhum', label: 'Nenhum' },
  { value: 'ungido', label: 'Ungido' },
  { value: 'anciao', label: 'Ancião' },
  { value: 'servo_ministerial', label: 'Servo Ministerial' },
]

export const TIPOS_DESIGNACAO = [
  { value: 'leitor', label: 'Leitor', icon: '📖' },
  { value: 'oracao', label: 'Oração', icon: '🙏' },
  { value: 'presidente', label: 'Presidente', icon: '🎤' },
  { value: 'indicador', label: 'Indicador', icon: '👆' },
  { value: 'microfone', label: 'Microfone', icon: '🎙️' },
  { value: 'som', label: 'Som', icon: '🔊' },
  { value: 'plataforma', label: 'Plataforma', icon: '🏛️' },
  { value: 'limpeza', label: 'Limpeza', icon: '🧹' },
]

export const GRUPOS_CAMPO = [
  'G-1 - Jorge Sanches',
  'G-2 - João Pedro',
  'G-3 - Filipe Paulino',
  'G-4 - David Resende',
  'G-5 - Miguel Cascalheira',
  'G-6 - Edson Nascimento',
  'G-7 - António Fernandes',
  'G-8 - Miguel Calisto',
  'G-9 - Florivaldo Gomes',
]

export const GRUPOS_LIMPEZA = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export const MESES = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]
