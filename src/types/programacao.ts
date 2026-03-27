// Tipos para Programação de Reuniões

export interface ParteReuniao {
  id: string
  tipo: TipoParte
  titulo: string
  descricao?: string
  duracao: number // em minutos
  sala: 'principal' | 'auxiliar'
  publicadorId?: string
  publicadorNome?: string
  ajudanteId?: string
  ajudanteNome?: string
  status: StatusDesignacao
  data: string
  reuniao: 'meio_semana' | 'fim_semana'
  ordem: number
}

export type TipoParte = 
  | 'presidente'
  | 'presidente_auxiliar'
  | 'oracao_inicial'
  | 'oracao_final'
  | 'discurso'
  | 'perolas_espirituais'
  | 'leitura_biblia'
  | 'ministerio_iniciar'
  | 'ministerio_cultivar'
  | 'ministerio_discipulos'
  | 'estudo_biblico'
  | 'necessidades_locais'
  | 'realizacoes'
  | 'leitor'
  | 'indicador'
  | 'microfone'
  | 'som'
  | 'plataforma'
  | 'limpeza'

export type StatusDesignacao = 
  | 'pendente'
  | 'enviado'
  | 'aceite'
  | 'rejeitado'
  | 'conflito'
  | 'substituido'

export interface SemanaProgramacao {
  id: string
  dataInicio: string // segunda-feira da semana
  dataFim: string // domingo da semana
  mes: string
  ano: number
  tipo: 'normal' | 'memorial' | 'assembleia' | 'especial'
  partes: ParteReuniao[]
  observacoes?: string
}

export interface HistoricoDesignacao {
  publicadorId: string
  publicadorNome: string
  ultimaDesignacao: string
  diasSemDesignar: number
  totalDesignacoes: number
  tiposDesignados: TipoParte[]
}

export interface SugestaoDesignacao {
  publicadorId: string
  publicadorNome: string
  diasSemDesignar: number
  ultimaDesignacao: string
  score: number // quanto maior, mais prioritário
  motivo: string
  conflitos: string[] // datas com conflito
  estaAusente?: boolean // se está ausente nesta data/tipo
  motivoAusencia?: string // motivo da ausência
}

// Constantes para tipos de parte
export const TIPOS_PARTE_LABELS: Record<TipoParte, { label: string; icon: string; cor: string }> = {
  presidente: { label: 'Presidente', icon: '👤', cor: '#1976d2' },
  presidente_auxiliar: { label: 'Conselheiro Auxiliar', icon: '👥', cor: '#1976d2' },
  oracao_inicial: { label: 'Oração Inicial', icon: '🙏', cor: '#9c27b0' },
  oracao_final: { label: 'Oração Final', icon: '🙏', cor: '#9c27b0' },
  discurso: { label: 'Discurso', icon: '🎤', cor: '#ff9800' },
  perolas_espirituais: { label: 'Pérolas Espirituais', icon: '💎', cor: '#00bcd4' },
  leitura_biblia: { label: 'Leitura da Bíblia', icon: '📖', cor: '#4caf50' },
  ministerio_iniciar: { label: 'Iniciar Conversas', icon: '💬', cor: '#2196f3' },
  ministerio_cultivar: { label: 'Cultivar Interesse', icon: '🌱', cor: '#8bc34a' },
  ministerio_discipulos: { label: 'Fazer Discípulos', icon: '👨‍🏫', cor: '#ff5722' },
  estudo_biblico: { label: 'Estudo Bíblico', icon: '📚', cor: '#795548' },
  necessidades_locais: { label: 'Necessidades Locais', icon: '📋', cor: '#607d8b' },
  realizacoes: { label: 'Realizações', icon: '🏆', cor: '#ffc107' },
  leitor: { label: 'Leitor (EBC)', icon: '📖', cor: '#3f51b5' },
  indicador: { label: 'Indicador', icon: '👆', cor: '#e91e63' },
  microfone: { label: 'Microfone', icon: '🎙️', cor: '#673ab7' },
  som: { label: 'Som', icon: '🔊', cor: '#009688' },
  plataforma: { label: 'Plataforma', icon: '🏛️', cor: '#795548' },
  limpeza: { label: 'Limpeza', icon: '🧹', cor: '#9e9e9e' },
}

export const STATUS_LABELS: Record<StatusDesignacao, { label: string; cor: string; icon: string }> = {
  pendente: { label: 'Pendente', cor: '#757575', icon: '⏳' },
  enviado: { label: 'Enviado', cor: '#2196f3', icon: '📤' },
  aceite: { label: 'Aceite', cor: '#4caf50', icon: '✅' },
  rejeitado: { label: 'Rejeitado', cor: '#f44336', icon: '❌' },
  conflito: { label: 'Conflito', cor: '#ff9800', icon: '⚠️' },
  substituido: { label: 'Substituído', cor: '#9c27b0', icon: '🔄' },
}

// Template padrão para reunião de meio de semana
export const TEMPLATE_MEIO_SEMANA: Omit<ParteReuniao, 'id' | 'data'>[] = [
  { tipo: 'presidente', titulo: 'Presidente', duracao: 0, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 1 },
  { tipo: 'presidente_auxiliar', titulo: 'Conselheiro Auxiliar (2ª Sala)', duracao: 0, sala: 'auxiliar', status: 'pendente', reuniao: 'meio_semana', ordem: 2 },
  { tipo: 'oracao_inicial', titulo: 'Oração Inicial', duracao: 5, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 3 },
  { tipo: 'discurso', titulo: '1. Tesouros da Palavra de Deus', duracao: 10, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 4 },
  { tipo: 'perolas_espirituais', titulo: '2. Pérolas Espirituais', duracao: 8, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 5 },
  { tipo: 'leitura_biblia', titulo: '3. Leitura da Bíblia', duracao: 4, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 6 },
  { tipo: 'ministerio_iniciar', titulo: '4. Iniciar Conversas', duracao: 6, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 7 },
  { tipo: 'ministerio_cultivar', titulo: '5. Cultivar Interesse', duracao: 6, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 8 },
  { tipo: 'ministerio_discipulos', titulo: '6. Fazer Discípulos', duracao: 6, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 9 },
  { tipo: 'estudo_biblico', titulo: '7. Estudo Bíblico de Congregação', duracao: 30, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 10 },
  { tipo: 'leitor', titulo: 'Leitor (EBC)', duracao: 0, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 11 },
  { tipo: 'oracao_final', titulo: 'Oração Final', duracao: 3, sala: 'principal', status: 'pendente', reuniao: 'meio_semana', ordem: 12 },
]
