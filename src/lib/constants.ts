// Constantes do sistema

// Status de Publicador
export const STATUS_PUBLICADOR = [
  { valor: 'ativo', label: 'Ativo', cor: '#22C55E' },
  { valor: 'inativo', label: 'Inativo', cor: '#6B7280' },
  { valor: 'mudou', label: 'Mudou', cor: '#F59E0B' },
  { valor: 'faleceu', label: 'Faleceu', cor: '#EF4444' },
  { valor: 'restrito', label: 'Restricto', cor: '#DC2626' },
]

// Tipos de Publicador
export const TIPOS_PUBLICADOR = [
  { valor: 'estudante', label: 'Estudante' },
  { valor: 'publicador_nao_batizado', label: 'Publicador Não Batizado' },
  { valor: 'publicador_batizado', label: 'Publicador Batizado' },
  { valor: 'pioneiro_auxiliar', label: 'Pioneiro Auxiliar' },
  { valor: 'pioneiro_regular', label: 'Pioneiro Regular' },
]

// Privilégios de Serviço
export const PRIVILEGIOS_SERVICO = [
  { valor: 'nenhum', label: 'Nenhum' },
  { valor: 'ungido', label: 'Ungido' },
  { valor: 'anciao', label: 'Ancião' },
  { valor: 'servo_ministerial', label: 'Servo Ministerial' },
  { valor: 'superintendente_viajante', label: 'Superintendente Viajante' },
]

// Tipos de Restrição
export const TIPOS_RESTRICAO = [
  { valor: 'nao_pode_ler', label: 'Não pode ler' },
  { valor: 'nao_pode_demonstrar', label: 'Não pode demonstrar' },
  { valor: 'restricao_menores', label: 'Restrição de menores' },
  { valor: 'outros', label: 'Outros' },
]
