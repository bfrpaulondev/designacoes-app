import type { VercelRequest, VercelResponse } from '@vercel/node'

// Configurações padrão
const configDefault: any = {
  id: 'default',
  nome: 'Configurações Padrão',
  versao: '2.0.0',
  fimSemana: {
    ativarHospitalidade: false,
    organizarHospitalidadePorGrupo: false,
    mostrarLeitorSentinela: true,
    mostrarInterprete: false,
    dirigenteSentinela: '',
    nomeCongregacao: 'Congregação Teste',
    contatoCoordenadorDiscursos: 'coordenador@email.com',
    esconderOradoresFora: true,
    designarOradorOrcadorFinal: true,
    formatoDataImpressao: 'weekof',
    modeloEmailLembrete: '',
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
    numeroGruposLimpeza: 2,
    etiquetasLimpeza: [
      { id: 'l1', label: 'Grupo A', ativo: true },
      { id: 'l2', label: 'Grupo B', ativo: true },
    ],
    avisarTodosMembrosGrupo: false,
  },
  testemunhoPublico: {
    ativarAgendamentoLivre: false,
    permitirProgramarOutros: false,
    comportamentoAutoPreenchimento: 'genero_familia',
    permitirDefinirDisponibilidade: true,
  },
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
    motivosPreDefinidos: ['Viagem', 'Doença', 'Trabalho', 'Consulta médica', 'Estudos', 'Compromisso familiar', 'Outro'],
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

// Armazenamento em memória
let config = { ...configDefault }

function corsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET /api/config-programacao - Obter configurações
  if (req.method === 'GET') {
    return res.status(200).json({ config })
  }

  // POST /api/config-programacao - Atualizar configurações
  if (req.method === 'POST') {
    const body = req.body || {}
    config = {
      ...config,
      ...body,
      atualizadoEm: new Date().toISOString()
    }
    return res.status(200).json(config)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
