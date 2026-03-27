// Utilitários para Sistema de Designações
// Integração com Ausências e Configurações

import {
  Ausencia,
  Publicador,
  DiaSemana,
  TipoDesignacaoAusencia,
} from '../types/index'
import {
  Designacao,
  DesignacaoFimSemana,
  DesignacaoMeioSemana,
  DesignacaoAV,
  DesignacaoLimpeza,
  SugestaoDesignacao,
  ResultadoVerificacao,
  TipoDesignacao,
  CategoriaDesignacao,
  TipoDesignacaoFimSemana,
  TipoDesignacaoMeioSemana,
  TipoDesignacaoAV,
  TipoDesignacaoLimpeza,
  tipoDesignacaoParaAusencia,
} from '../types/designacoes'
import {
  ConfiguracoesSistema,
  CONFIGURACOES_PADRAO,
} from '../types/configuracoes'

// ============================================
// VERIFICAÇÃO DE DISPONIBILIDADE
// ============================================

/**
 * Verifica se um publicador está disponível para uma designação específica
 * Considera ausências (período, dias específicos e recorrentes)
 */
export function verificarDisponibilidade(
  publicadorId: string,
  data: string,
  tipo: TipoDesignacao,
  categoria: CategoriaDesignacao,
  ausencias: Ausencia[]
): { disponivel: boolean; motivo?: string; ausenciaId?: string } {
  const tipoAusencia = tipoDesignacaoParaAusencia(tipo, categoria)
  const dataObj = new Date(data)
  const diaSemana = getDiaSemana(dataObj)

  for (const ausencia of ausencias) {
    if (ausencia.publicadorId !== publicadorId) continue

    // Verifica se o tipo de designação está afetado
    const tipoAfetado = ausencia.tiposDesignacao.includes('todas') ||
                        ausencia.tiposDesignacao.includes(tipoAusencia) ||
                        ausencia.tiposDesignacao.includes(categoria as TipoDesignacaoAusencia)

    if (!tipoAfetado) continue

    // Verifica por tipo de ausência
    switch (ausencia.tipo) {
      case 'periodo':
        if (ausencia.dataInicio && ausencia.dataFim) {
          if (data >= ausencia.dataInicio && data <= ausencia.dataFim) {
            return {
              disponivel: false,
              motivo: `Ausente de ${formatarData(ausencia.dataInicio)} até ${formatarData(ausencia.dataFim)}`,
              ausenciaId: ausencia.id,
            }
          }
        }
        break

      case 'dias_especificos':
        if (ausencia.diasEspecificos?.includes(data)) {
          return {
            disponivel: false,
            motivo: `Ausente neste dia específico`,
            ausenciaId: ausencia.id,
          }
        }
        break

      case 'recorrente':
        if (ausencia.diasSemana?.includes(diaSemana)) {
          // Verifica se está dentro do período de recorrência
          const dentroDoPeriodo = 
            (!ausencia.recorrenciaInicio || data >= ausencia.recorrenciaInicio) &&
            (!ausencia.recorrenciaFim || data <= ausencia.recorrenciaFim)
          
          if (dentroDoPeriodo) {
            return {
              disponivel: false,
              motivo: `Ausente recorrentemente às ${getDiaSemanaLabel(diaSemana)}`,
              ausenciaId: ausencia.id,
            }
          }
        }
        break
    }
  }

  return { disponivel: true }
}

// ============================================
// VERIFICAÇÃO DE REGRAS DE CONFIGURAÇÃO
// ============================================

/**
 * Verifica se uma designação respeita as regras de configuração
 */
export function verificarRegrasConfiguracao(
  publicador: Publicador,
  tipo: TipoDesignacao,
  categoria: CategoriaDesignacao,
  designacoesExistentes: Designacao[],
  config: ConfiguracoesSistema
): ResultadoVerificacao {
  const resultado: ResultadoVerificacao = {
    podeDesignar: true,
    avisos: [],
    erros: [],
    conflitos: [],
  }

  // Verifica se tem o privilégio necessário
  if (categoria === 'fim_semana') {
    const tipoFim = tipo as TipoDesignacaoFimSemana
    // Presidentes e orações precisam ser anciãos
    if (['presidente', 'oracao_inicial', 'oracao_final', 'dirigente_sentinela'].includes(tipoFim)) {
      if (publicador.privilegioServico !== 'anciao') {
        resultado.erros.push('Este tipo de designação requer ser ancião')
        resultado.podeDesignar = false
      }
    }
  }

  if (categoria === 'meio_semana') {
    const tipoMeio = tipo as TipoDesignacaoMeioSemana
    // Presidentes precisam ser anciãos ou servos ministeriais
    if (['presidente', 'presidente_auxiliar', 'estudo_biblico', 'orador_servico'].includes(tipoMeio)) {
      if (publicador.privilegioServico !== 'anciao' && publicador.privilegioServico !== 'servo_ministerial') {
        resultado.erros.push('Este tipo de designação requer ser ancião ou servo ministerial')
        resultado.podeDesignar = false
      }
    }
  }

  // Verifica período mínimo entre designações
  if (config.designacoes.periodoMinimoEntreDesignacoes > 0) {
    const ultimaDesignacao = designacoesExistentes
      .filter(d => d.publicadorId === publicador.id)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]

    if (ultimaDesignacao) {
      const diasDesdeUltima = Math.floor(
        (Date.now() - new Date(ultimaDesignacao.data).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diasDesdeUltima < config.designacoes.periodoMinimoEntreDesignacoes) {
        resultado.avisos.push(
          `Última designação há ${diasDesdeUltima} dias. Período mínimo: ${config.designacoes.periodoMinimoEntreDesignacoes} dias`
        )
      }
    }
  }

  return resultado
}

// ============================================
// GERAÇÃO DE SUGESTÕES
// ============================================

/**
 * Gera sugestões de publicadores para uma designação
 * Ordenado por score (maior = mais prioritário)
 */
export function gerarSugestoes(
  publicadores: Publicador[],
  data: string,
  tipo: TipoDesignacao,
  categoria: CategoriaDesignacao,
  ausencias: Ausencia[],
  designacoesExistentes: Designacao[],
  config: ConfiguracoesSistema = CONFIGURACOES_PADRAO
): SugestaoDesignacao[] {
  const sugestoes: SugestaoDesignacao[] = []

  for (const publicador of publicadores) {
    // Ignora publicadores inativos
    if (publicador.status !== 'ativo') continue

    // Verifica disponibilidade
    const { disponivel, motivo, ausenciaId } = verificarDisponibilidade(
      publicador.id,
      data,
      tipo,
      categoria,
      ausencias
    )

    // Verifica regras de configuração
    const verificacao = verificarRegrasConfiguracao(
      publicador,
      tipo,
      categoria,
      designacoesExistentes,
      config
    )

    // Calcula score
    const score = calcularScore(
      publicador,
      data,
      tipo,
      categoria,
      designacoesExistentes,
      config,
      disponivel
    )

    // Calcula dias sem designar
    const diasSemDesignar = calcularDiasSemDesignar(
      publicador.id,
      designacoesExistentes
    )

    // Última designação
    const ultimaDesignacao = designacoesExistentes
      .filter(d => d.publicadorId === publicador.id)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]

    // Determina prioridade
    let prioridade: 'alta' | 'media' | 'baixa' = 'media'
    let motivoPrioridade = ''

    if (!disponivel) {
      prioridade = 'baixa'
      motivoPrioridade = motivo || 'Indisponível'
    } else if (diasSemDesignar >= config.designacoes.diasUrgencia) {
      prioridade = 'alta'
      motivoPrioridade = `Sem designação há ${diasSemDesignar} dias`
    } else if (config.designacoes.priorizarPioneiros && 
               publicador.tipoPublicador.includes('pioneiro')) {
      prioridade = 'alta'
      motivoPrioridade = 'Pioneiro'
    } else if (config.designacoes.priorizarSemDesignacao && diasSemDesignar > 14) {
      prioridade = 'alta'
      motivoPrioridade = 'Prioridade por tempo sem designar'
    }

    sugestoes.push({
      publicadorId: publicador.id,
      publicadorNome: publicador.nome,
      privilegio: publicador.privilegioServico,
      tipoPublicador: publicador.tipoPublicador,
      grupoCampo: publicador.grupoCampo,
      score,
      diasSemDesignar,
      ultimaDesignacao: ultimaDesignacao?.data,
      totalDesignacoes: designacoesExistentes.filter(d => d.publicadorId === publicador.id).length,
      disponivel,
      motivoIndisponibilidade: motivo,
      ausenciaId,
      prioridade,
      motivoPrioridade,
      conflitos: verificacao.avisos,
      adequado: verificacao.podeDesignar,
      motivoInadequacao: verificacao.erros[0],
    })
  }

  // Ordena por score (maior primeiro)
  return sugestoes.sort((a, b) => b.score - a.score)
}

/**
 * Calcula o score de um publicador para uma designação
 * Quanto maior o score, mais adequado é o publicador
 */
function calcularScore(
  publicador: Publicador,
  _data: string,
  _tipo: TipoDesignacao,
  categoria: CategoriaDesignacao,
  designacoesExistentes: Designacao[],
  config: ConfiguracoesSistema,
  disponivel: boolean
): number {
  let score = 50 // Base

  // Penalização por indisponibilidade
  if (!disponivel) {
    return 0
  }

  // Bônus por privilégio
  if (publicador.privilegioServico === 'anciao') {
    score += 15
  } else if (publicador.privilegioServico === 'servo_ministerial') {
    score += 10
  }

  // Bônus por tipo de publicador
  if (publicador.tipoPublicador === 'pioneiro_regular') {
    score += 10
  } else if (publicador.tipoPublicador === 'pioneiro_auxiliar' || 
             publicador.tipoPublicador === 'pioneiro_auxiliar_continuo') {
    score += 5
  }

  // Bônus por tempo sem designar (mais tempo = maior score)
  const diasSemDesignar = calcularDiasSemDesignar(publicador.id, designacoesExistentes)
  score += Math.min(diasSemDesignar * 0.5, 20) // Máximo 20 pontos

  // Bônus por ter etiqueta relevante
  if (publicador.etiquetas) {
    if (categoria === 'av_indicadores' && publicador.etiquetas.includes('AV')) {
      score += 10
    }
    if (categoria === 'limpeza' && publicador.etiquetas.includes('Limpeza')) {
      score += 5
    }
  }

  // Aplica configurações
  if (config.designacoes.priorizarPioneiros && 
      publicador.tipoPublicador.includes('pioneiro')) {
    score += 10
  }

  if (config.designacoes.priorizarSemDesignacao && diasSemDesignar > 14) {
    score += 10
  }

  return Math.min(score, 100)
}

/**
 * Calcula dias desde a última designação
 */
function calcularDiasSemDesignar(
  publicadorId: string,
  designacoes: Designacao[]
): number {
  const designacoesPublicador = designacoes
    .filter(d => d.publicadorId === publicadorId)
    .map(d => d.data)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (designacoesPublicador.length === 0) {
    return 999 // Muito tempo sem designar
  }

  const ultimaDesignacao = new Date(designacoesPublicador[0])
  const hoje = new Date()
  const diffTime = hoje.getTime() - ultimaDesignacao.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getDiaSemana(data: Date): DiaSemana {
  const dias: DiaSemana[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  return dias[data.getDay()]
}

function getDiaSemanaLabel(dia: DiaSemana): string {
  const labels: Record<DiaSemana, string> = {
    segunda: 'Segundas-feiras',
    terca: 'Terças-feiras',
    quarta: 'Quartas-feiras',
    quinta: 'Quintas-feiras',
    sexta: 'Sextas-feiras',
    sabado: 'Sábados',
    domingo: 'Domingos',
  }
  return labels[dia]
}

function formatarData(data: string): string {
  if (!data) return ''
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// ============================================
// GERAÇÃO DE ESCALAS
// ============================================

/**
 * Gera designações automáticas para uma semana
 */
export function gerarEscalaSemanal(
  dataInicio: string, // Segunda-feira
  publicadores: Publicador[],
  ausencias: Ausencia[],
  config: ConfiguracoesSistema,
  designacoesExistentes: Designacao[]
): {
  fimSemana: DesignacaoFimSemana[]
  meioSemana: DesignacaoMeioSemana[]
  avIndicadores: DesignacaoAV[]
  limpeza: DesignacaoLimpeza[]
} {
  const dataFimSemana = new Date(dataInicio)
  dataFimSemana.setDate(dataFimSemana.getDate() + 6) // Domingo

  // Data da reunião de fim de semana
  const dataFimSemanaReuniao = new Date(dataInicio)
  if (config.horarios.diaFimSemana === 'sabado') {
    dataFimSemanaReuniao.setDate(dataFimSemanaReuniao.getDate() + 5)
  } else {
    dataFimSemanaReuniao.setDate(dataFimSemanaReuniao.getDate() + 6)
  }
  const dataFimSemanaStr = dataFimSemanaReuniao.toISOString().split('T')[0]

  // Data da reunião de meio de semana
  const dataMeioSemanaReuniao = new Date(dataInicio)
  const diaMeioMap: Record<string, number> = {
    segunda: 0, terca: 1, quarta: 2, quinta: 3, sexta: 4
  }
  dataMeioSemanaReuniao.setDate(
    dataMeioSemanaReuniao.getDate() + diaMeioMap[config.horarios.diaMeioSemana]
  )
  const dataMeioSemanaStr = dataMeioSemanaReuniao.toISOString().split('T')[0]

  // Gera designações de fim de semana
  const fimSemana: DesignacaoFimSemana[] = gerarDesignacoesFimSemana(
    dataFimSemanaStr,
    publicadores,
    ausencias,
    config,
    designacoesExistentes
  )

  // Gera designações de meio de semana
  const meioSemana: DesignacaoMeioSemana[] = gerarDesignacoesMeioSemana(
    dataMeioSemanaStr,
    publicadores,
    ausencias,
    config,
    designacoesExistentes
  )

  // Gera designações de A/V e indicadores
  const avIndicadores: DesignacaoAV[] = gerarDesignacoesAV(
    dataMeioSemanaStr,
    dataFimSemanaStr,
    publicadores,
    ausencias,
    config,
    designacoesExistentes
  )

  // Gera designações de limpeza
  const limpeza: DesignacaoLimpeza[] = gerarDesignacoesLimpeza(
    dataFimSemanaStr,
    publicadores,
    ausencias,
    config,
    designacoesExistentes
  )

  return { fimSemana, meioSemana, avIndicadores, limpeza }
}

function gerarDesignacoesFimSemana(
  data: string,
  publicadores: Publicador[],
  ausencias: Ausencia[],
  config: ConfiguracoesSistema,
  designacoesExistentes: Designacao[]
): DesignacaoFimSemana[] {
  const designacoes: DesignacaoFimSemana[] = []
  const tipos: TipoDesignacaoFimSemana[] = [
    'presidente',
    'oracao_inicial',
    'dirigente_sentinela',
    'leitor_sentinela',
    'oracao_final',
  ]

  const publicadoresUsados = new Set<string>()

  for (const tipo of tipos) {
    // Ignora leitor se configurado
    if (tipo === 'leitor_sentinela' && !config.fimSemana.mostrarLeitorSentinela) continue

    const sugestoes = gerarSugestoes(
      publicadores,
      data,
      tipo,
      'fim_semana',
      ausencias,
      designacoesExistentes,
      config
    )

    // Encontra primeiro disponível que não foi usado
    const sugestao = sugestoes.find(s => 
      s.disponivel && 
      s.adequado && 
      !publicadoresUsados.has(s.publicadorId)
    )

    if (sugestao) {
      publicadoresUsados.add(sugestao.publicadorId)
      designacoes.push({
        id: `${data}_${tipo}`,
        publicadorId: sugestao.publicadorId,
        publicadorNome: sugestao.publicadorNome,
        tipo,
        categoria: 'fim_semana',
        data,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      })
    }
  }

  return designacoes
}

function gerarDesignacoesMeioSemana(
  data: string,
  publicadores: Publicador[],
  ausencias: Ausencia[],
  config: ConfiguracoesSistema,
  designacoesExistentes: Designacao[]
): DesignacaoMeioSemana[] {
  const designacoes: DesignacaoMeioSemana[] = []
  const tipos: { tipo: TipoDesignacaoMeioSemana; sala: 'principal' | 'auxiliar_1' | 'auxiliar_2' }[] = [
    { tipo: 'presidente', sala: 'principal' },
    { tipo: 'oracao_inicial', sala: 'principal' },
    { tipo: 'tesouros', sala: 'principal' },
    { tipo: 'perolas_espirituais', sala: 'principal' },
    { tipo: 'leitura_biblia', sala: 'principal' },
    { tipo: 'ministerio_iniciar', sala: 'principal' },
    { tipo: 'ministerio_cultivar', sala: 'principal' },
    { tipo: 'ministerio_discipulos', sala: 'principal' },
    { tipo: 'estudo_biblico', sala: 'principal' },
    { tipo: 'leitor_ebc', sala: 'principal' },
    { tipo: 'oracao_final', sala: 'principal' },
  ]

  // Adiciona presidente auxiliar se houver classes auxiliares
  if (config.meioSemana.numeroClassesAuxiliares > 0) {
    tipos.push({ tipo: 'presidente_auxiliar', sala: 'auxiliar_1' })
  }

  const publicadoresUsados = new Set<string>()

  for (const { tipo, sala } of tipos) {
    const sugestoes = gerarSugestoes(
      publicadores,
      data,
      tipo,
      'meio_semana',
      ausencias,
      designacoesExistentes,
      config
    )

    const sugestao = sugestoes.find(s => 
      s.disponivel && 
      s.adequado && 
      !publicadoresUsados.has(s.publicadorId)
    )

    if (sugestao) {
      publicadoresUsados.add(sugestao.publicadorId)
      designacoes.push({
        id: `${data}_${tipo}`,
        publicadorId: sugestao.publicadorId,
        publicadorNome: sugestao.publicadorNome,
        tipo,
        categoria: 'meio_semana',
        data,
        sala,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      })
    }
  }

  return designacoes
}

function gerarDesignacoesAV(
  dataMeio: string,
  dataFim: string,
  publicadores: Publicador[],
  ausencias: Ausencia[],
  config: ConfiguracoesSistema,
  designacoesExistentes: Designacao[]
): DesignacaoAV[] {
  const designacoes: DesignacaoAV[] = []
  const avConfig = config.avIndicadores

  // Microfones
  for (let i = 0; i < avConfig.numeroMicrofones; i++) {
    const etiqueta = avConfig.etiquetasMicrofone[i]?.label || `Microfone ${i + 1}`
    const tipo: TipoDesignacaoAV = `microfone_${(i + 1) as 1 | 2 | 3}`

    // Meio de semana
    const sugestoesMeio = gerarSugestoes(
      publicadores.filter(p => p.etiquetas?.includes('AV')),
      dataMeio,
      tipo,
      'av_indicadores',
      ausencias,
      designacoesExistentes,
      config
    )

    const sugestaoMeio = sugestoesMeio.find(s => s.disponivel && s.adequado)
    if (sugestaoMeio) {
      designacoes.push({
        id: `${dataMeio}_${tipo}`,
        publicadorId: sugestaoMeio.publicadorId,
        publicadorNome: sugestaoMeio.publicadorNome,
        tipo,
        categoria: 'av_indicadores',
        data: dataMeio,
        etiqueta,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      })
    }

    // Fim de semana
    const sugestoesFim = gerarSugestoes(
      publicadores.filter(p => p.etiquetas?.includes('AV')),
      dataFim,
      tipo,
      'av_indicadores',
      ausencias,
      designacoesExistentes,
      config
    )

    const sugestaoFim = sugestoesFim.find(s => s.disponivel && s.adequado)
    if (sugestaoFim) {
      designacoes.push({
        id: `${dataFim}_${tipo}`,
        publicadorId: sugestaoFim.publicadorId,
        publicadorNome: sugestaoFim.publicadorNome,
        tipo,
        categoria: 'av_indicadores',
        data: dataFim,
        etiqueta,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      })
    }
  }

  // Indicadores
  for (let i = 0; i < avConfig.numeroIndicadores; i++) {
    const etiqueta = avConfig.etiquetasIndicador[i]?.label || `Indicador ${i + 1}`
    const tipo: TipoDesignacaoAV = `indicador_${(i + 1) as 1 | 2}`

    // Meio de semana
    const sugestoes = gerarSugestoes(
      publicadores,
      dataMeio,
      tipo,
      'av_indicadores',
      ausencias,
      designacoesExistentes,
      config
    )

    const sugestao = sugestoes.find(s => s.disponivel && s.adequado)
    if (sugestao) {
      designacoes.push({
        id: `${dataMeio}_${tipo}`,
        publicadorId: sugestao.publicadorId,
        publicadorNome: sugestao.publicadorNome,
        tipo,
        categoria: 'av_indicadores',
        data: dataMeio,
        etiqueta,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      })
    }
  }

  // Som
  if (avConfig.numeroDesignacoesSom > 0) {
    const sugestoesSom = gerarSugestoes(
      publicadores.filter(p => p.etiquetas?.includes('AV')),
      dataMeio,
      'som',
      'av_indicadores',
      ausencias,
      designacoesExistentes,
      config
    )

    const sugestaoSom = sugestoesSom.find(s => s.disponivel && s.adequado)
    if (sugestaoSom) {
      designacoes.push({
        id: `${dataMeio}_som`,
        publicadorId: sugestaoSom.publicadorId,
        publicadorNome: sugestaoSom.publicadorNome,
        tipo: 'som',
        categoria: 'av_indicadores',
        data: dataMeio,
        etiqueta: 'Som',
        status: 'pendente',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      })
    }
  }

  return designacoes
}

function gerarDesignacoesLimpeza(
  data: string,
  publicadores: Publicador[],
  ausencias: Ausencia[],
  config: ConfiguracoesSistema,
  designacoesExistentes: Designacao[]
): DesignacaoLimpeza[] {
  const designacoes: DesignacaoLimpeza[] = []
  const numGrupos = config.limpeza.numeroGruposLimpeza
  const gruposLabels = ['A', 'B', 'C', 'D', 'E']

  for (let i = 0; i < numGrupos; i++) {
    const grupo = gruposLabels[i]
    const tipo: TipoDesignacaoLimpeza = `grupo_limpeza_${grupo.toLowerCase()}` as TipoDesignacaoLimpeza

    // Encontra publicadores do grupo de limpeza
    const publicadoresGrupo = publicadores.filter(p => 
      p.grupoLimpeza === grupo || p.etiquetas?.includes(`Limpeza ${grupo}`)
    )

    if (publicadoresGrupo.length > 0) {
      const sugestoes = gerarSugestoes(
        publicadoresGrupo,
        data,
        tipo,
        'limpeza',
        ausencias,
        designacoesExistentes,
        config
      )

      const sugestao = sugestoes.find(s => s.disponivel)
      if (sugestao) {
        designacoes.push({
          id: `${data}_limpeza_${grupo}`,
          publicadorId: sugestao.publicadorId,
          publicadorNome: sugestao.publicadorNome,
          tipo,
          categoria: 'limpeza',
          data,
          grupoId: grupo,
          grupoNome: `Grupo ${grupo}`,
          status: 'pendente',
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        })
      }
    }
  }

  return designacoes
}


