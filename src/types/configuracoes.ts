// Tipos para Configurações do Sistema

// ============================================
// CONFIGURAÇÕES DE REUNIÃO DE FIM DE SEMANA
// ============================================
export interface ConfigFimSemana {
  // Hospitalidade
  ativarHospitalidade: boolean
  organizarHospitalidadePorGrupo: boolean
  
  // Sentinela
  mostrarLeitorSentinela: boolean
  mostrarInterprete: boolean
  dirigenteSentinela: string // ID do publicador
  
  // Congregação
  nomeCongregacao: string
  contatoCoordenadorDiscursos: string
  
  // Oradores
  outroOradorNome: string
  outroOradorCongregacao: string
  outroOradorTituloDiscurso: string
  esconderOradoresFora: boolean
  designarOradorOrcadorFinal: boolean
  
  // Superintendente de Circuito
  nomeSuperintendenteCircuito: string
  tituloDiscursoPublicoSC: string
  tituloDiscursoServicoSC: string
  canticoFinalVisitaSC: number
  
  // Impressão
  formatoDataImpressao: 'weekof' | 'dayof'
  
  // Notificações
  modeloEmailLembrete: string
}

// ============================================
// CONFIGURAÇÕES DE REUNIÃO DE MEIO DE SEMANA
// ============================================
export interface ConfigMeioSemana {
  // Discurso de Serviço
  temaDiscursoServico: string
  
  // Superintendente de Circuito
  canticoFinalVisitaSCMeio: number
  
  // Classes
  numeroClassesAuxiliares: number
  
  // Impressão
  formatoDataImpressao: 'weekof' | 'dayof'
  gerarFormularioS89: boolean
}

// ============================================
// CONFIGURAÇÕES DE A/V E INDICADORES
// ============================================
export interface EtiquetaConfig {
  id: string
  label: string
  ativo: boolean
}

export interface ConfigAVIndicadores {
  // Quantidades
  numeroMicrofones: number
  numeroIndicadores: number
  numeroAssistentesZoom: number
  numeroDesignacoesPalco: number
  numeroDesignacoesSom: number
  numeroDesignacoesVideo: number
  
  // Etiquetas
  etiquetasVideo: EtiquetaConfig[]
  etiquetasAudio: EtiquetaConfig[]
  etiquetasMicrofone: EtiquetaConfig[]
  etiquetasPalco: EtiquetaConfig[]
  etiquetasIndicador: EtiquetaConfig[]
  etiquetasZoom: EtiquetaConfig[]
  lapelasIndicador: EtiquetaConfig[]
  
  // Geral
  programacaoAVSemanal: boolean
}

// ============================================
// CONFIGURAÇÕES DE LIMPEZA
// ============================================
export interface ConfigLimpeza {
  numeroGruposLimpeza: number
  etiquetasLimpeza: EtiquetaConfig[]
  avisarTodosMembrosGrupo: boolean
}

// ============================================
// CONFIGURAÇÕES DE TESTEMUNHO PÚBLICO
// ============================================
export interface ConfigTestemunhoPublico {
  ativarAgendamentoLivre: boolean
  permitirProgramarOutros: boolean
  comportamentoAutoPreenchimento: 'genero_familia' | 'todos'
  permitirDefinirDisponibilidade: boolean
}

// ============================================
// CONFIGURAÇÕES DE AUSÊNCIAS (NOVO!)
// ============================================
export interface ConfigAusencias {
  // Notificações
  notificarCoordenador: boolean
  notificarPublicador: boolean
  diasAntecedenciaNotificacao: number
  
  // Comportamento
  permitirAusenciaRecorrente: boolean
  maxDiasAusenciaContinua: number
  requerAprovacao: boolean
  
  // Integração
  bloquearDesignacoesAutomaticas: boolean
  mostrarAusentesNaEscala: boolean
  
  // Padrões
  tiposAusenciaPermitidos: ('periodo' | 'dias_especificos' | 'recorrente')[]
  motivosPreDefinidos: string[]
}

// ============================================
// CONFIGURAÇÕES DE DESIGNAÇÕES (NOVO!)
// ============================================
export interface ConfigDesignacoes {
  // Regras de rotação
  periodoMinimoEntreDesignacoes: number // dias
  maxDesignacoesConsecutivas: number
  evitarMesmaPessoaSemanaSeguinte: boolean
  
  // Prioridades
  priorizarPioneiros: boolean
  priorizarSemDesignacao: boolean
  diasUrgencia: number // dias sem designar para considerar urgente
  
  // Balanceamento
  balancearPorGenero: boolean
  balancearPorGrupo: boolean
  
  // Confirmação
  requerConfirmacao: boolean
  diasLimiteConfirmacao: number
  enviarLembreteAutomatico: boolean
}

// ============================================
// CONFIGURAÇÕES DE NOTIFICAÇÕES (NOVO!)
// ============================================
export interface ConfigNotificacoes {
  // Canais
  emailAtivo: boolean
  smsAtivo: boolean
  whatsappAtivo: boolean
  
  // Momentos
  notificarNovaDesignacao: boolean
  notificarAlteracaoDesignacao: boolean
  notificarLembrete: boolean
  notificarAusenciaAprovada: boolean
  
  // Templates
  templateNovaDesignacao: string
  templateLembreteDesignacao: string
  templateAusencia: string
  
  // Configurações de e-mail
  emailRemetente: string
  nomeRemetente: string
  
  // Horários
  horaEnvioLembretes: string // HH:mm
  diasAntecedenciaLembrete: number
}

// ============================================
// CONFIGURAÇÕES DE HORÁRIOS (NOVO!)
// ============================================
export interface ConfigHorarios {
  // Reunião de Meio Semana
  diaMeioSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta'
  horaInicioMeioSemana: string
  horaFimMeioSemana: string
  
  // Reunião de Fim de Semana
  diaFimSemana: 'sabado' | 'domingo'
  horaInicioFimSemana: string
  horaFimFimSemana: string
  
  // Testemunho Público
  horariosTestemunhoPublico: {
    dia: 'sabado' | 'domingo'
    horaInicio: string
    horaFim: string
  }[]
}

// ============================================
// CONFIGURAÇÕES DE PERMISSÕES (NOVO!)
// ============================================
export interface ConfigPermissoes {
  // Por função
  anciãos: {
    editarDesignacoes: boolean
    editarAusencias: boolean
    verRelatorios: boolean
    exportarDados: boolean
  }
  servosMinisteriais: {
    editarDesignacoes: boolean
    editarAusencias: boolean
    verRelatorios: boolean
    exportarDados: boolean
  }
  publicadores: {
    verPropriaEscala: boolean
    editarPropriaDisponibilidade: boolean
    verOutrasEscalas: boolean
  }
}

// ============================================
// CONFIGURAÇÕES GERAIS
// ============================================
export interface ConfiguracoesSistema {
  id: string
  nome: string
  versao: string
  
  fimSemana: ConfigFimSemana
  meioSemana: ConfigMeioSemana
  avIndicadores: ConfigAVIndicadores
  limpeza: ConfigLimpeza
  testemunhoPublico: ConfigTestemunhoPublico
  
  // Novos módulos
  ausencias: ConfigAusencias
  designacoes: ConfigDesignacoes
  notificacoes: ConfigNotificacoes
  horarios: ConfigHorarios
  permissoes: ConfigPermissoes
  
  // Metadados
  atualizadoEm: string
  atualizadoPor: string
}

// ============================================
// VALORES PADRÃO
// ============================================
export const CONFIGURACOES_PADRAO: ConfiguracoesSistema = {
  id: 'default',
  nome: 'Configurações Padrão',
  versao: '2.0.0',
  
  fimSemana: {
    ativarHospitalidade: false,
    organizarHospitalidadePorGrupo: false,
    mostrarLeitorSentinela: true,
    mostrarInterprete: false,
    dirigenteSentinela: '',
    nomeCongregacao: 'Minha Congregação',
    contatoCoordenadorDiscursos: '',
    outroOradorNome: '',
    outroOradorCongregacao: '',
    outroOradorTituloDiscurso: '',
    esconderOradoresFora: true,
    designarOradorOrcadorFinal: true,
    nomeSuperintendenteCircuito: '',
    tituloDiscursoPublicoSC: '',
    tituloDiscursoServicoSC: '',
    canticoFinalVisitaSC: 0,
    formatoDataImpressao: 'weekof',
    modeloEmailLembrete: `Querido irmão {{orador}},

Queremos lembrá-lo que está marcado para fazer o seguinte discurso:

Tema: {{discurso}} ({{numeroDiscurso}})
Data: {{data}}
Hora: {{hora}} (hora local)
Congregação: {{congregacao}}

Muito obrigado pela atenção e até breve.

Os melhores cumprimentos,
{{remetente}}`,
  },
  
  meioSemana: {
    temaDiscursoServico: '',
    canticoFinalVisitaSCMeio: 0,
    numeroClassesAuxiliares: 1,
    formatoDataImpressao: 'weekof',
    gerarFormularioS89: true,
  },
  
  avIndicadores: {
    numeroMicrofones: 2,
    numeroIndicadores: 2,
    numeroAssistentesZoom: 0,
    numeroDesignacoesPalco: 0,
    numeroDesignacoesSom: 1,
    numeroDesignacoesVideo: 1,
    etiquetasVideo: [{ id: 'v1', label: 'Vídeo', ativo: true }],
    etiquetasAudio: [{ id: 'a1', label: 'Áudio', ativo: true }],
    etiquetasMicrofone: [
      { id: 'm1', label: 'Microfone Esquerdo', ativo: true },
      { id: 'm2', label: 'Microfone Direito', ativo: true },
    ],
    etiquetasPalco: [],
    etiquetasIndicador: [
      { id: 'i1', label: 'Indicador Entrada', ativo: true },
      { id: 'i2', label: 'Indicador Auditório', ativo: true },
    ],
    etiquetasZoom: [],
    lapelasIndicador: [],
    programacaoAVSemanal: true,
  },
  
  limpeza: {
    numeroGruposLimpeza: 1,
    etiquetasLimpeza: [{ id: 'l1', label: 'Grupo de Limpeza', ativo: true }],
    avisarTodosMembrosGrupo: false,
  },
  
  testemunhoPublico: {
    ativarAgendamentoLivre: false,
    permitirProgramarOutros: false,
    comportamentoAutoPreenchimento: 'genero_familia',
    permitirDefinirDisponibilidade: true,
  },
  
  // Novos módulos
  ausencias: {
    notificarCoordenador: true,
    notificarPublicador: true,
    diasAntecedenciaNotificacao: 3,
    permitirAusenciaRecorrente: true,
    maxDiasAusenciaContinua: 90,
    requerAprovacao: false,
    bloquearDesignacoesAutomaticas: true,
    mostrarAusentesNaEscala: true,
    tiposAusenciaPermitidos: ['periodo', 'dias_especificos', 'recorrente'],
    motivosPreDefinidos: [
      'Viagem',
      'Doença',
      'Trabalho',
      'Consulta médica',
      'Estudos',
      'Compromisso familiar',
      'Outro',
    ],
  },
  
  designacoes: {
    periodoMinimoEntreDesignacoes: 14,
    maxDesignacoesConsecutivas: 2,
    evitarMesmaPessoaSemanaSeguinte: true,
    priorizarPioneiros: true,
    priorizarSemDesignacao: true,
    diasUrgencia: 30,
    balancearPorGenero: false,
    balancearPorGrupo: true,
    requerConfirmacao: true,
    diasLimiteConfirmacao: 3,
    enviarLembreteAutomatico: true,
  },
  
  notificacoes: {
    emailAtivo: true,
    smsAtivo: false,
    whatsappAtivo: false,
    notificarNovaDesignacao: true,
    notificarAlteracaoDesignacao: true,
    notificarLembrete: true,
    notificarAusenciaAprovada: true,
    templateNovaDesignacao: '',
    templateLembreteDesignacao: '',
    templateAusencia: '',
    emailRemetente: '',
    nomeRemetente: '',
    horaEnvioLembretes: '09:00',
    diasAntecedenciaLembrete: 2,
  },
  
  horarios: {
    diaMeioSemana: 'terca',
    horaInicioMeioSemana: '19:00',
    horaFimMeioSemana: '20:45',
    diaFimSemana: 'domingo',
    horaInicioFimSemana: '10:00',
    horaFimFimSemana: '12:00',
    horariosTestemunhoPublico: [
      { dia: 'sabado', horaInicio: '15:00', horaFim: '17:00' },
    ],
  },
  
  permissoes: {
    anciãos: {
      editarDesignacoes: true,
      editarAusencias: true,
      verRelatorios: true,
      exportarDados: true,
    },
    servosMinisteriais: {
      editarDesignacoes: true,
      editarAusencias: false,
      verRelatorios: true,
      exportarDados: false,
    },
    publicadores: {
      verPropriaEscala: true,
      editarPropriaDisponibilidade: true,
      verOutrasEscalas: false,
    },
  },
  
  atualizadoEm: new Date().toISOString(),
  atualizadoPor: 'sistema',
}
