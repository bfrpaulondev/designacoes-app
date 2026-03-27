// Utilitários para verificação de ausências e disponibilidade
import type { Ausencia, DiaSemana, TipoDesignacaoAusencia } from '../types'
import { DIAS_SEMANA } from '../types'

/**
 * Converte uma data para o dia da semana
 */
const getDiaSemanaFromDate = (dateStr: string): DiaSemana => {
  const dias: DiaSemana[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  const date = new Date(dateStr + 'T12:00:00')
  return dias[date.getDay()]
}

/**
 * Verifica se uma data está dentro de um período
 */
const isDateInRange = (dateStr: string, startStr: string, endStr: string): boolean => {
  const date = new Date(dateStr + 'T12:00:00').getTime()
  const start = new Date(startStr + 'T12:00:00').getTime()
  const end = new Date(endStr + 'T12:00:00').getTime()
  return date >= start && date <= end
}

/**
 * Mapeia tipos de designação específicos para categorias gerais
 */
const mapTipoDesignacaoToCategoria = (tipo: string): TipoDesignacaoAusencia[] => {
  const categorias: TipoDesignacaoAusencia[] = []
  
  // Tipos de reunião
  if (['presidente', 'presidente_auxiliar', 'oracao_inicial', 'oracao_final', 'discurso', 
       'perolas_espirituais', 'leitura_biblia', 'ministerio_iniciar', 'ministerio_cultivar',
       'ministerio_discipulos', 'estudo_biblico', 'necessidades_locais', 'realizacoes', 'leitor'].includes(tipo)) {
    categorias.push('reuniao_meio_semana')
  }
  
  // Tipos específicos
  if (tipo === 'leitor' || tipo === 'leitura_biblia') categorias.push('leitor')
  if (tipo === 'oracao_inicial' || tipo === 'oracao_final') categorias.push('oracao')
  if (tipo === 'presidente' || tipo === 'presidente_auxiliar') categorias.push('presidente')
  if (tipo === 'indicador') categorias.push('indicador')
  if (tipo === 'microfone') categorias.push('microfone')
  if (tipo === 'som') categorias.push('som')
  if (tipo === 'plataforma') categorias.push('plataforma')
  if (tipo === 'limpeza') categorias.push('limpeza')
  
  return categorias
}

/**
 * Verifica se um tipo de designação está afetado por uma ausência
 */
const isTipoDesignacaoAfetado = (
  tiposAusencia: TipoDesignacaoAusencia[], 
  tipoDesignacao: string
): boolean => {
  // Se a ausência afeta "todas", retorna true
  if (tiposAusencia.includes('todas')) return true
  
  // Mapeia o tipo de designação para categorias
  const categorias = mapTipoDesignacaoToCategoria(tipoDesignacao)
  
  // Verifica se alguma categoria está na lista de tipos afetados
  return tiposAusencia.some(tipo => categorias.includes(tipo))
}

/**
 * Verifica se um publicador está ausente em uma determinada data e tipo de designação
 * 
 * @param ausencias - Lista de ausências
 * @param publicadorId - ID do publicador
 * @param data - Data a verificar (YYYY-MM-DD)
 * @param tipoDesignacao - Tipo de designação (ex: 'presidente', 'leitor', etc.)
 * @returns Objeto com resultado da verificação
 */
export const verificarAusencia = (
  ausencias: Ausencia[],
  publicadorId: string,
  data: string,
  tipoDesignacao: string
): { estaAusente: boolean; motivo?: string; ausencia?: Ausencia } => {
  // Filtra ausências do publicador
  const ausenciasDoPublicador = ausencias.filter(a => a.publicadorId === publicadorId)
  
  for (const ausencia of ausenciasDoPublicador) {
    let dataAfetada = false
    
    switch (ausencia.tipo) {
      case 'periodo':
        // Verifica se a data está dentro do período
        if (ausencia.dataInicio && ausencia.dataFim) {
          dataAfetada = isDateInRange(data, ausencia.dataInicio, ausencia.dataFim)
        }
        break
        
      case 'dias_especificos':
        // Verifica se a data está na lista de dias específicos
        if (ausencia.diasEspecificos) {
          dataAfetada = ausencia.diasEspecificos.includes(data)
        }
        break
        
      case 'recorrente':
        // Verifica se o dia da semana está na recorrência e dentro do período válido
        if (ausencia.diasSemana && ausencia.diasSemana.length > 0) {
          const diaSemana = getDiaSemanaFromDate(data)
          
          if (ausencia.diasSemana.includes(diaSemana)) {
            // Verifica se está dentro do período de recorrência
            const dentroDoPeriodo = 
              (!ausencia.recorrenciaInicio || isDateInRange(data, ausencia.recorrenciaInicio, data)) &&
              (!ausencia.recorrenciaFim || isDateInRange(data, data, ausencia.recorrenciaFim))
            
            dataAfetada = dentroDoPeriodo
          }
        }
        break
    }
    
    // Se a data está afetada, verifica se o tipo de designação também está
    if (dataAfetada && isTipoDesignacaoAfetado(ausencia.tiposDesignacao, tipoDesignacao)) {
      return {
        estaAusente: true,
        motivo: ausencia.notas || getMotivoAusencia(ausencia),
        ausencia
      }
    }
  }
  
  return { estaAusente: false }
}

/**
 * Gera uma descrição do motivo da ausência
 */
const getMotivoAusencia = (ausencia: Ausencia): string => {
  switch (ausencia.tipo) {
    case 'periodo':
      return `Ausente de ${formatarData(ausencia.dataInicio!)} a ${formatarData(ausencia.dataFim!)}`
    case 'dias_especificos':
      if (ausencia.diasEspecificos?.length === 1) {
        return `Ausente em ${formatarData(ausencia.diasEspecificos[0])}`
      }
      return `Ausente em ${ausencia.diasEspecificos?.length || 0} dias específicos`
    case 'recorrente':
      const dias = ausencia.diasSemana?.map(d => 
        DIAS_SEMANA.find(ds => ds.value === d)?.label
      ).join(', ')
      return `Ausente toda(o) ${dias}`
    default:
      return 'Ausente'
  }
}

/**
 * Formata data para exibição
 */
const formatarData = (dataStr: string): string => {
  const date = new Date(dataStr + 'T12:00:00')
  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
}

/**
 * Filtra publicadores disponíveis para uma data e tipo de designação
 * 
 * @param publicadores - Lista de publicadores
 * @param ausencias - Lista de ausências
 * @param data - Data a verificar
 * @param tipoDesignacao - Tipo de designação
 * @returns Lista de publicadores disponíveis
 */
export const filtrarPublicadoresDisponiveis = <T extends { id: string }>(
  publicadores: T[],
  ausencias: Ausencia[],
  data: string,
  tipoDesignacao: string
): T[] => {
  return publicadores.filter(pub => {
    const resultado = verificarAusencia(ausencias, pub.id, data, tipoDesignacao)
    return !resultado.estaAusente
  })
}

/**
 * Obtém todas as ausências ativas para uma data
 */
export const obterAusenciasAtivas = (
  ausencias: Ausencia[],
  data: string
): Ausencia[] => {
  return ausencias.filter(ausencia => {
    switch (ausencia.tipo) {
      case 'periodo':
        return ausencia.dataInicio && ausencia.dataFim && 
               isDateInRange(data, ausencia.dataInicio, ausencia.dataFim)
      case 'dias_especificos':
        return ausencia.diasEspecificos?.includes(data)
      case 'recorrente':
        if (!ausencia.diasSemana?.length) return false
        const diaSemana = getDiaSemanaFromDate(data)
        if (!ausencia.diasSemana.includes(diaSemana)) return false
        return (!ausencia.recorrenciaInicio || isDateInRange(data, ausencia.recorrenciaInicio, data)) &&
               (!ausencia.recorrenciaFim || isDateInRange(data, data, ausencia.recorrenciaFim))
      default:
        return false
    }
  })
}

/**
 * Obtém publicadores ausentes para uma data
 */
export const obterPublicadoresAusentes = (
  ausencias: Ausencia[],
  data: string,
  tipoDesignacao?: string
): { publicadorId: string; publicadorNome: string; motivo: string }[] => {
  const ausenciasAtivas = obterAusenciasAtivas(ausencias, data)
  const resultado: { publicadorId: string; publicadorNome: string; motivo: string }[] = []
  
  for (const ausencia of ausenciasAtivas) {
    // Se especificou tipo de designação, verifica se afeta
    if (tipoDesignacao && !isTipoDesignacaoAfetado(ausencia.tiposDesignacao, tipoDesignacao)) {
      continue
    }
    
    // Evita duplicados
    if (!resultado.find(r => r.publicadorId === ausencia.publicadorId)) {
      resultado.push({
        publicadorId: ausencia.publicadorId,
        publicadorNome: ausencia.publicadorNome,
        motivo: ausencia.notas || getMotivoAusencia(ausencia)
      })
    }
  }
  
  return resultado
}
