import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(cors())
app.use(express.json())

// Dados em memória
let publicadores = [
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

let ausencias: any[] = []
let designacoes: any[] = []
let configuracoes: any = {
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

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  // Login simples para teste
  if (email && password) {
    const user = { id: '1', email, name: 'Admin', role: 'admin' }
    res.json({ token: 'test-token', user })
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' })
  }
})

// Publicadores
app.get('/api/publicadores', (req, res) => {
  res.json({ publicadores })
})

app.post('/api/publicadores', (req, res) => {
  const novo = { id: uuidv4(), ...req.body, status: 'ativo' }
  publicadores.push(novo)
  res.json(novo)
})

app.put('/api/publicadores/:id', (req, res) => {
  const idx = publicadores.findIndex(p => p.id === req.params.id)
  if (idx >= 0) {
    publicadores[idx] = { ...publicadores[idx], ...req.body }
    res.json(publicadores[idx])
  } else {
    res.status(404).json({ error: 'Não encontrado' })
  }
})

app.delete('/api/publicadores/:id', (req, res) => {
  publicadores = publicadores.filter(p => p.id !== req.params.id)
  res.json({ success: true })
})

// Ausências
app.get('/api/ausencias', (req, res) => {
  res.json({ ausencias })
})

app.post('/api/ausencias', (req, res) => {
  const novo = { 
    id: uuidv4(), 
    ...req.body, 
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  }
  ausencias.push(novo)
  res.json(novo)
})

app.put('/api/ausencias/:id', (req, res) => {
  const idx = ausencias.findIndex(a => a.id === req.params.id)
  if (idx >= 0) {
    ausencias[idx] = { ...ausencias[idx], ...req.body, atualizadoEm: new Date().toISOString() }
    res.json(ausencias[idx])
  } else {
    res.status(404).json({ error: 'Não encontrado' })
  }
})

app.delete('/api/ausencias/:id', (req, res) => {
  ausencias = ausencias.filter(a => a.id !== req.params.id)
  res.json({ success: true })
})

// Designações
app.get('/api/designacoes', (req, res) => {
  res.json({ designacoes })
})

app.post('/api/designacoes', (req, res) => {
  const novo = { 
    id: uuidv4(), 
    ...req.body, 
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  }
  designacoes.push(novo)
  res.json(novo)
})

app.post('/api/designacoes/batch', (req, res) => {
  const novas = req.body.designacoes.map((d: any) => ({
    id: uuidv4(),
    ...d,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  }))
  
  // Remove designações antigas da mesma semana
  const semanaInicio = novas[0]?.data?.split('T')[0] || novas[0]?.data
  if (semanaInicio) {
    const dataBase = new Date(semanaInicio)
    const dataFim = new Date(semanaInicio)
    dataFim.setDate(dataFim.getDate() + 6)
    
    designacoes = designacoes.filter(d => {
      const dataDesignacao = new Date(d.data)
      return dataDesignacao < dataBase || dataDesignacao > dataFim
    })
  }
  
  designacoes.push(...novas)
  res.json({ success: true, count: novas.length })
})

app.patch('/api/designacoes/:id', (req, res) => {
  const idx = designacoes.findIndex(d => d.id === req.params.id)
  if (idx >= 0) {
    designacoes[idx] = { ...designacoes[idx], ...req.body, atualizadoEm: new Date().toISOString() }
    res.json(designacoes[idx])
  } else {
    res.status(404).json({ error: 'Não encontrado' })
  }
})

app.delete('/api/designacoes/:id', (req, res) => {
  designacoes = designacoes.filter(d => d.id !== req.params.id)
  res.json({ success: true })
})

// Configurações
app.get('/api/config-programacao', (req, res) => {
  res.json({ config: configuracoes })
})

app.post('/api/config-programacao', (req, res) => {
  configuracoes = { ...configuracoes, ...req.body, atualizadoEm: new Date().toISOString() }
  res.json(configuracoes)
})

// Configurações gerais
app.get('/api/config', (req, res) => {
  res.json({ config: { nomeCongregacao: configuracoes.fimSemana.nomeCongregacao } })
})

app.post('/api/config', (req, res) => {
  if (req.body.nomeCongregacao) {
    configuracoes.fimSemana.nomeCongregacao = req.body.nomeCongregacao
  }
  res.json({ success: true })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Backend de teste rodando em http://localhost:${PORT}`)
  console.log('\nPublicadores de teste:')
  console.log('- Anciãos: João Silva, Pedro Santos, Manuel Costa')
  console.log('- Servos Ministeriais: André Oliveira, Ricardo Fernandes, Bruno Almeida')
  console.log('- Publicadores: Maria Sousa, Ana Rodrigues, Carlos Pereira, Sofia Lima')
})
