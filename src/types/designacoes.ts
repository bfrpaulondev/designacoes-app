// Tipos para Sistema de Designações Completo

import { TipoDesignacaoAusencia } from './index'

// ============================================
// TIPOS DE DESIGNAÇÃO
// ============================================

export type CategoriaDesignacao = 
  | 'fim_semana'
  | 'meio_semana'
  | 'av_indicadores'
  | 'limpeza'
  | 'testemunho_publico'
  | 'hospitalidade'
  | 'oradores'

export type TipoDesignacaoFimSemana = 
  | 'presidente'
  | 'oracao_inicial'
  | 'oracao_final'
  | 'dirigente_sentinela'
  | 'leitor_sentinela'
  | 'interprete'
  | 'orador'
  | 'hospitalidade'

export type TipoDesignacaoMeioSemana = 
  | 'presidente'
  | 'presidente_auxiliar'
  | 'oracao_inicial'
  | 'oracao_final'
  | 'tesouros'
  | 'perolas_espirituais'
  | 'leitura_biblia'
  | 'ministerio_iniciar'
  | 'ministerio_cultivar'
  | 'ministerio_discipulos'
  | 'estudo_biblico'
  | 'leitor_ebc'
  | 'orador_servico'

export type TipoDesignacaoAV = 
  | 'som'
  | 'video'
  | 'microfone_1'
  | 'microfone_2'
  | 'microfone_3'
  | 'microfone_4'
  | 'microfone_5'
  | 'microfone_6'
  | 'microfone_7'
  | 'microfone_8'
  | 'microfone_9'
  | 'microfone_10'
  | 'indicador_1'
  | 'indicador_2'
  | 'indicador_3'
  | 'indicador_4'
  | 'indicador_5'
  | 'indicador_6'
  | 'indicador_7'
  | 'indicador_8'
  | 'indicador_9'
  | 'indicador_10'
  | 'plataforma'
  | 'zoom'

export type TipoDesignacaoLimpeza = 
  | 'grupo_limpeza_a'
  | 'grupo_limpeza_b'
  | 'grupo_limpeza_c'
  | 'grupo_limpeza_d'
  | 'grupo_limpeza_e'

export type TipoDesignacaoTestemunho = 
  | 'testemunho_sabado_manha'
  | 'testemunho_sabado_tarde'
  | 'testemunho_domingo_manha'
  | 'testemunho_domingo_tarde'

export type TipoDesignacao = 
  | TipoDesignacaoFimSemana 
  | TipoDesignacaoMeioSemana 
  | TipoDesignacaoAV 
  | TipoDesignacaoLimpeza 
  | TipoDesignacaoTestemunho
  | 'hospitalidade'
  | 'orador'

// ============================================
// INTERFACE DE DESIGNAÇÃO
// ============================================

export interface DesignacaoBase {
  id: string
  publicadorId: string
  publicadorNome: string
  tipo: TipoDesignacao
  categoria: CategoriaDesignacao
  data: string // YYYY-MM-DD
  semanaId?: string
  status: StatusDesignacao
  confirmadoEm?: string
  confirmadoPor?: string
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

export interface DesignacaoFimSemana extends DesignacaoBase {
  categoria: 'fim_semana'
  tipo: TipoDesignacaoFimSemana
  // Campos específicos
  discursoTema?: string
  discursoNumero?: string
  oradorCongregacao?: string
}

export interface DesignacaoMeioSemana extends DesignacaoBase {
  categoria: 'meio_semana'
  tipo: TipoDesignacaoMeioSemana
  // Campos específicos
  sala: 'principal' | 'auxiliar_1' | 'auxiliar_2'
  ajudanteId?: string
  ajudanteNome?: string
}

export interface DesignacaoAV extends DesignacaoBase {
  categoria: 'av_indicadores'
  tipo: TipoDesignacaoAV
  // Campos específicos
  etiqueta?: string // ex: "Microfone Esquerdo", "Indicador Entrada"
}

export interface DesignacaoLimpeza extends DesignacaoBase {
  categoria: 'limpeza'
  tipo: TipoDesignacaoLimpeza
  // Campos específicos
  grupoId: string
  grupoNome: string
}

export interface DesignacaoTestemunho extends DesignacaoBase {
  categoria: 'testemunho_publico'
  tipo: TipoDesignacaoTestemunho
  // Campos específicos
  horaInicio: string
  horaFim: string
  local?: string
  companheiroId?: string
  companheiroNome?: string
}

export type Designacao = 
  | DesignacaoFimSemana 
  | DesignacaoMeioSemana 
  | DesignacaoAV 
  | DesignacaoLimpeza 
  | DesignacaoTestemunho

export type StatusDesignacao = 
  | 'pendente'
  | 'agendado'
  | 'confirmado'
  | 'realizado'
  | 'cancelado'
  | 'substituido'
  | 'ausente'

// ============================================
// ESCALA SEMANAL
// ============================================

export interface EscalaSemanal {
  id: string
  dataInicio: string // segunda-feira
  dataFim: string // domingo
  ano: number
  mes: string
  semanaNumero: number
  
  // Designações por categoria
  fimSemana: DesignacaoFimSemana[]
  meioSemana: DesignacaoMeioSemana[]
  avIndicadores: DesignacaoAV[]
  limpeza: DesignacaoLimpeza[]
  testemunhoPublico: DesignacaoTestemunho[]
  
  // Metadados
  observacoes?: string
  status: 'rascunho' | 'completa' | 'publicada' | 'arquivada'
  criadoEm: string
  atualizadoEm: string
}

// ============================================
// SUGESTÃO DE DESIGNAÇÃO
// ============================================

export interface SugestaoDesignacao {
  publicadorId: string
  publicadorNome: string
  privilegio: string
  tipoPublicador: string
  grupoCampo?: string
  
  // Scores
  score: number // 0-100
  diasSemDesignar: number
  ultimaDesignacao?: string
  totalDesignacoes: number
  
  // Disponibilidade
  disponivel: boolean
  motivoIndisponibilidade?: string
  ausenciaId?: string
  
  // Prioridade
  prioridade: 'alta' | 'media' | 'baixa'
  motivoPrioridade: string
  
  // Conflitos
  conflitos: string[]
  
  // Adequação para o tipo
  adequado: boolean
  motivoInadequacao?: string
}

// ============================================
// FILTROS DE DESIGNAÇÃO
// ============================================

export interface FiltroDesignacao {
  categoria?: CategoriaDesignacao
  tipo?: TipoDesignacao
  publicadorId?: string
  dataInicio?: string
  dataFim?: string
  status?: StatusDesignacao
  grupoId?: string
}

// ============================================
// RESULTADO DE VERIFICAÇÃO
// ============================================

export interface ResultadoVerificacao {
  podeDesignar: boolean
  avisos: string[]
  erros: string[]
  conflitos: {
    tipo: 'ausencia' | 'designacao_existente' | 'regra_config'
    descricao: string
    data?: string
  }[]
}

// ============================================
// CONSTANTES
// ============================================

export const CATEGORIAS_LABELS: Record<CategoriaDesignacao, { label: string; icon: string; cor: string }> = {
  fim_semana: { label: 'Reunião de Fim de Semana', icon: '📅', cor: '#1976d2' },
  meio_semana: { label: 'Reunião de Meio de Semana', icon: '📆', cor: '#2196f3' },
  av_indicadores: { label: 'A/V e Indicadores', icon: '🎬', cor: '#9c27b0' },
  limpeza: { label: 'Limpeza', icon: '🧹', cor: '#795548' },
  testemunho_publico: { label: 'Testemunho Público', icon: '📢', cor: '#4caf50' },
  hospitalidade: { label: 'Hospitalidade', icon: '🏠', cor: '#ff9800' },
  oradores: { label: 'Oradores', icon: '🎤', cor: '#e91e63' },
}

export const TIPOS_FIM_SEMANA_LABELS: Record<TipoDesignacaoFimSemana, { label: string; icon: string; requerAnciao: boolean }> = {
  presidente: { label: 'Presidente', icon: '👤', requerAnciao: true },
  oracao_inicial: { label: 'Oração Inicial', icon: '🙏', requerAnciao: true },
  oracao_final: { label: 'Oração Final', icon: '🙏', requerAnciao: true },
  dirigente_sentinela: { label: 'Dirigente da Sentinela', icon: '📖', requerAnciao: true },
  leitor_sentinela: { label: 'Leitor da Sentinela', icon: '📚', requerAnciao: false },
  interprete: { label: 'Intérprete', icon: '🗣️', requerAnciao: false },
  orador: { label: 'Orador', icon: '🎤', requerAnciao: true },
  hospitalidade: { label: 'Hospitalidade', icon: '🏠', requerAnciao: false },
}

export const TIPOS_MEIO_SEMANA_LABELS: Record<TipoDesignacaoMeioSemana, { label: string; icon: string; requerAnciao: boolean; requerServo: boolean }> = {
  presidente: { label: 'Presidente', icon: '👤', requerAnciao: true, requerServo: false },
  presidente_auxiliar: { label: 'Conselheiro Auxiliar', icon: '👥', requerAnciao: true, requerServo: true },
  oracao_inicial: { label: 'Oração Inicial', icon: '🙏', requerAnciao: true, requerServo: false },
  oracao_final: { label: 'Oração Final', icon: '🙏', requerAnciao: true, requerServo: false },
  tesouros: { label: 'Tesouros da Palavra de Deus', icon: '💎', requerAnciao: true, requerServo: true },
  perolas_espirituais: { label: 'Pérolas Espirituais', icon: '✨', requerAnciao: true, requerServo: true },
  leitura_biblia: { label: 'Leitura da Bíblia', icon: '📖', requerAnciao: false, requerServo: false },
  ministerio_iniciar: { label: 'Iniciar Conversas', icon: '💬', requerAnciao: false, requerServo: false },
  ministerio_cultivar: { label: 'Cultivar Interesse', icon: '🌱', requerAnciao: false, requerServo: false },
  ministerio_discipulos: { label: 'Fazer Discípulos', icon: '👨‍🏫', requerAnciao: false, requerServo: false },
  estudo_biblico: { label: 'Estudo Bíblico de Congregação', icon: '📚', requerAnciao: true, requerServo: true },
  leitor_ebc: { label: 'Leitor (EBC)', icon: '📖', requerAnciao: false, requerServo: true },
  orador_servico: { label: 'Discurso de Serviço', icon: '🎤', requerAnciao: true, requerServo: true },
}

export const TIPOS_AV_LABELS: Record<TipoDesignacaoAV, { label: string; icon: string }> = {
  som: { label: 'Som', icon: '🔊' },
  video: { label: 'Vídeo', icon: '🎬' },
  microfone_1: { label: 'Microfone 1', icon: '🎙️' },
  microfone_2: { label: 'Microfone 2', icon: '🎙️' },
  microfone_3: { label: 'Microfone 3', icon: '🎙️' },
  microfone_4: { label: 'Microfone 4', icon: '🎙️' },
  microfone_5: { label: 'Microfone 5', icon: '🎙️' },
  microfone_6: { label: 'Microfone 6', icon: '🎙️' },
  microfone_7: { label: 'Microfone 7', icon: '🎙️' },
  microfone_8: { label: 'Microfone 8', icon: '🎙️' },
  microfone_9: { label: 'Microfone 9', icon: '🎙️' },
  microfone_10: { label: 'Microfone 10', icon: '🎙️' },
  indicador_1: { label: 'Indicador 1', icon: '👆' },
  indicador_2: { label: 'Indicador 2', icon: '👆' },
  indicador_3: { label: 'Indicador 3', icon: '👆' },
  indicador_4: { label: 'Indicador 4', icon: '👆' },
  indicador_5: { label: 'Indicador 5', icon: '👆' },
  indicador_6: { label: 'Indicador 6', icon: '👆' },
  indicador_7: { label: 'Indicador 7', icon: '👆' },
  indicador_8: { label: 'Indicador 8', icon: '👆' },
  indicador_9: { label: 'Indicador 9', icon: '👆' },
  indicador_10: { label: 'Indicador 10', icon: '👆' },
  plataforma: { label: 'Plataforma', icon: '🏛️' },
  zoom: { label: 'Assistente Zoom', icon: '💻' },
}

export const TIPOS_LIMPEZA_LABELS: Record<TipoDesignacaoLimpeza, { label: string; icon: string }> = {
  grupo_limpeza_a: { label: 'Grupo A', icon: '🧹' },
  grupo_limpeza_b: { label: 'Grupo B', icon: '🧹' },
  grupo_limpeza_c: { label: 'Grupo C', icon: '🧹' },
  grupo_limpeza_d: { label: 'Grupo D', icon: '🧹' },
  grupo_limpeza_e: { label: 'Grupo E', icon: '🧹' },
}

export const STATUS_DESIGNACAO_LABELS: Record<StatusDesignacao, { label: string; cor: string; icon: string }> = {
  pendente: { label: 'Pendente', cor: '#757575', icon: '⏳' },
  agendado: { label: 'Agendado', cor: '#2196f3', icon: '📅' },
  confirmado: { label: 'Confirmado', cor: '#4caf50', icon: '✅' },
  realizado: { label: 'Realizado', cor: '#00bcd4', icon: '✓' },
  cancelado: { label: 'Cancelado', cor: '#f44336', icon: '❌' },
  substituido: { label: 'Substituído', cor: '#9c27b0', icon: '🔄' },
  ausente: { label: 'Ausente', cor: '#ff9800', icon: '🚫' },
}

// Mapeamento entre TipoDesignacao e TipoDesignacaoAusencia
export function tipoDesignacaoParaAusencia(tipo: TipoDesignacao, categoria: CategoriaDesignacao): TipoDesignacaoAusencia {
  // Primeiro verifica categoria
  if (categoria === 'meio_semana') return 'reuniao_meio_semana'
  if (categoria === 'fim_semana') return 'reuniao_fim_semana'
  if (categoria === 'testemunho_publico') return 'testemunho_publico'
  
  // Depois verifica tipo específico
  switch (tipo) {
    case 'presidente':
    case 'presidente_auxiliar':
      return 'presidente'
    case 'oracao_inicial':
    case 'oracao_final':
      return 'oracao'
    case 'leitor_sentinela':
    case 'leitor_ebc':
      return 'leitor'
    case 'microfone_1':
    case 'microfone_2':
    case 'microfone_3':
    case 'microfone_4':
    case 'microfone_5':
    case 'microfone_6':
    case 'microfone_7':
    case 'microfone_8':
    case 'microfone_9':
    case 'microfone_10':
      return 'microfone'
    case 'indicador_1':
    case 'indicador_2':
    case 'indicador_3':
    case 'indicador_4':
    case 'indicador_5':
    case 'indicador_6':
    case 'indicador_7':
    case 'indicador_8':
    case 'indicador_9':
    case 'indicador_10':
      return 'indicador'
    case 'som':
    case 'video':
      return 'som'
    case 'plataforma':
      return 'plataforma'
    case 'grupo_limpeza_a':
    case 'grupo_limpeza_b':
    case 'grupo_limpeza_c':
    case 'grupo_limpeza_d':
    case 'grupo_limpeza_e':
      return 'limpeza'
    default:
      return 'todas'
  }
}
