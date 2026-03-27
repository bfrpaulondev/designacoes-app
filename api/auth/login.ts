import type { VercelRequest, VercelResponse } from '@vercel/node'

// Dados em memória (simulando banco de dados)
export const publicadores = [
  // Anciãos
  { id: '1', nome: 'João Silva', nomeCompleto: 'João Pedro Silva', nomePrimeiro: 'João', nomeUltimo: 'Silva', email: 'joao@email.com', telemovel: '912345678', genero: 'masculino', tipoPublicador: 'pioneiro_regular', privilegioServico: 'anciao', grupoCampo: 'G-1 - Jorge Sanches', status: 'ativo', etiquetas: ['AV', 'Presidente'] },
  { id: '2', nome: 'Pedro Santos', nomeCompleto: 'Pedro Manuel Santos', nomePrimeiro: 'Pedro', nomeUltimo: 'Santos', email: 'pedro@email.com', telemovel: '912345679', genero: 'masculino', tipoPublicador: 'publicador_batizado', privilegioServico: 'anciao', grupoCampo: 'G-2 - João Pedro', status: 'ativo', etiquetas: [] },
  { id: '3', nome: 'Manuel Costa', nomeCompleto: 'Manuel José Costa', nomePrimeiro: 'Manuel', nomeUltimo: 'Costa', email: 'manuel@email.com', telemovel: '912345680', genero: 'masculino', tipoPublicador: 'pioneiro_auxiliar', privilegioServico: 'anciao', grupoCampo: 'G-3 - Filipe Paulino', status: 'ativo', etiquetas: ['Presidente'] },

  // Servos Ministeriais
  { id: '4', nome: 'André Oliveira', nomeCompleto: 'André Luís Oliveira', nomePrimeiro: 'André', nomeUltimo: 'Oliveira', email: 'andre@email.com', telemovel: '912345681', genero: 'masculino', tipoPublicador: 'publicador_batizado', privilegioServico: 'servo_ministerial', grupoCampo: 'G-1 - Jorge Sanches', status: 'ativo', etiquetas: ['AV', 'Som'] },
  { id: '5', nome: 'Ricardo Fernandes', nomeCompleto: 'Ricardo João Fernandes', nomePrimeiro: 'Ricardo', nomeUltimo: 'Fernandes', email: 'ricardo@email.com', telemovel: '912345682', genero: 'masculino', tipoPublicador: 'pioneiro_regular', privilegioServico: 'servo_ministerial', grupoCampo: 'G-2 - João Pedro', status: 'ativo', etiquetas: ['Indicador'] },
  { id: '6', nome: 'Bruno Almeida', nomeCompleto: 'Bruno Miguel Almeida', nomePrimeiro: 'Bruno', nomeUltimo: 'Almeida', email: 'bruno@email.com', telemovel: '912345683', genero: 'masculino', tipoPublicador: 'publicador_batizado', privilegioServico: 'servo_ministerial', grupoCampo: 'G-3 - Filipe Paulino', status: 'ativo', etiquetas: [] },

  // Publicadores (sem privilégio especial)
  { id: '7', nome: 'Maria Sousa', nomeCompleto: 'Maria Ana Sousa', nomePrimeiro: 'Maria', nomeUltimo: 'Sousa', email: 'maria@email.com', telemovel: '912345684', genero: 'feminino', tipoPublicador: 'pioneiro_regular', privilegioServico: 'nenhum', grupoCampo: 'G-1 - Jorge Sanches', status: 'ativo', etiquetas: [] },
  { id: '8', nome: 'Ana Rodrigues', nomeCompleto: 'Ana Paula Rodrigues', nomePrimeiro: 'Ana', nomeUltimo: 'Rodrigues', email: 'ana@email.com', telemovel: '912345685', genero: 'feminino', tipoPublicador: 'pioneiro_auxiliar', privilegioServico: 'nenhum', grupoCampo: 'G-2 - João Pedro', status: 'ativo', etiquetas: [] },
  { id: '9', nome: 'Carlos Pereira', nomeCompleto: 'Carlos Eduardo Pereira', nomePrimeiro: 'Carlos', nomeUltimo: 'Pereira', email: 'carlos@email.com', telemovel: '912345686', genero: 'masculino', tipoPublicador: 'publicador_batizado', privilegioServico: 'nenhum', grupoCampo: 'G-3 - Filipe Paulino', status: 'ativo', etiquetas: ['AV'] },
  { id: '10', nome: 'Sofia Lima', nomeCompleto: 'Sofia Cristina Lima', nomePrimeiro: 'Sofia', nomeUltimo: 'Lima', email: 'sofia@email.com', telemovel: '912345687', genero: 'feminino', tipoPublicador: 'publicador_batizado', privilegioServico: 'nenhum', grupoCampo: 'G-1 - Jorge Sanches', status: 'ativo', etiquetas: [] },
]

export const configuracoesDefault: any = {
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

function corsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { email, password } = req.body || {}

  // Login simples - aceita qualquer email/senha para demonstração
  if (email && password) {
    const name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
    const user = {
      id: '1',
      email,
      name,
      role: 'admin'
    }
    return res.status(200).json({ token: 'demo-token-' + Date.now(), user })
  }

  return res.status(401).json({ error: 'Credenciais inválidas' })
}
