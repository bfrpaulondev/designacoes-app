import type { VercelRequest, VercelResponse } from '@vercel/node'

// Dados de exemplo - Roles
const rolesData = [
  {
    id: '1',
    name: 'super_admin',
    label: 'Super Administrador',
    description: 'Acesso total ao sistema',
    permissions: [
      'designacoes.gerenciar', 'publicadores.gerenciar', 'relatorios.gerenciar',
      'configuracoes.gerenciar', 'privilegios.gerenciar', 'ausencias.gerenciar',
      'familias.gerenciar', 'etiquetas.gerenciar', 'qualificacoes.gerenciar',
      'semanas.gerenciar', 'exportar.dados', 'importar.dados', 'audit.ver',
    ],
    level: 100,
  },
  {
    id: '2',
    name: 'admin',
    label: 'Administrador',
    description: 'Gerencia designações e publicadores',
    permissions: [
      'designacoes.gerenciar', 'publicadores.gerenciar', 'relatorios.gerenciar',
      'configuracoes.visualizar', 'ausencias.gerenciar',
      'familias.gerenciar', 'etiquetas.gerenciar', 'qualificacoes.gerenciar',
      'semanas.gerenciar', 'exportar.dados',
    ],
    level: 80,
  },
  {
    id: '3',
    name: 'anciao',
    label: 'Ancião',
    description: 'Ancião da congregação com privilégios ampliados',
    permissions: [
      'designacoes.gerenciar', 'publicadores.visualizar', 'relatorios.gerenciar',
      'ausencias.gerenciar', 'familias.visualizar', 'semanas.gerenciar', 'exportar.dados',
    ],
    level: 60,
  },
  {
    id: '4',
    name: 'servo_ministerial',
    label: 'Servo Ministerial',
    description: 'Servo ministerial da congregação',
    permissions: [
      'designacoes.gerenciar', 'publicadores.visualizar', 'relatorios.visualizar',
      'ausencias.visualizar', 'semanas.visualizar',
    ],
    level: 40,
  },
  {
    id: '5',
    name: 'publicador',
    label: 'Publicador Batizado',
    description: 'Publicador batizado da congregação',
    permissions: [
      'designacoes.visualizar_proprias', 'ausencias.gerenciar_proprias',
      'relatorios.gerenciar_proprios', 'publicadores.visualizar',
    ],
    level: 20,
  },
  {
    id: '6',
    name: 'publicador_nao_batizado',
    label: 'Publicador Não Batizado',
    description: 'Publicador não batizado',
    permissions: [
      'designacoes.visualizar_proprias', 'ausencias.gerenciar_proprias',
      'relatorios.gerenciar_proprios',
    ],
    level: 10,
  },
  {
    id: '7',
    name: 'convidado',
    label: 'Convidado',
    description: 'Acesso somente leitura',
    permissions: [
      'designacoes.visualizar_proprias',
    ],
    level: 0,
  },
]

// Dados de exemplo - Usuários com privilégios
const usuariosData = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@email.com',
    roleId: '2',
    roleName: 'admin',
    permissions: [
      'designacoes.gerenciar', 'publicadores.gerenciar', 'relatorios.gerenciar',
      'configuracoes.visualizar', 'ausencias.gerenciar',
      'familias.gerenciar', 'etiquetas.gerenciar', 'qualificacoes.gerenciar',
      'semanas.gerenciar', 'exportar.dados',
    ],
    ativo: true,
    criadoEm: '2024-01-15T10:00:00.000Z',
    atualizadoEm: '2025-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    nome: 'Pedro Santos',
    email: 'pedro@email.com',
    roleId: '3',
    roleName: 'anciao',
    permissions: [
      'designacoes.gerenciar', 'publicadores.visualizar', 'relatorios.gerenciar',
      'ausencias.gerenciar', 'familias.visualizar', 'semanas.gerenciar', 'exportar.dados',
    ],
    ativo: true,
    criadoEm: '2024-01-15T10:00:00.000Z',
    atualizadoEm: '2025-01-15T10:00:00.000Z',
  },
  {
    id: '4',
    nome: 'André Oliveira',
    email: 'andre@email.com',
    roleId: '4',
    roleName: 'servo_ministerial',
    permissions: [
      'designacoes.gerenciar', 'publicadores.visualizar', 'relatorios.visualizar',
      'ausencias.visualizar', 'semanas.visualizar',
    ],
    ativo: true,
    criadoEm: '2024-03-01T10:00:00.000Z',
    atualizadoEm: '2025-01-15T10:00:00.000Z',
  },
  {
    id: '7',
    nome: 'Maria Sousa',
    email: 'maria@email.com',
    roleId: '5',
    roleName: 'publicador',
    permissions: [
      'designacoes.visualizar_proprias', 'ausencias.gerenciar_proprias',
      'relatorios.gerenciar_proprios', 'publicadores.visualizar',
    ],
    ativo: true,
    criadoEm: '2024-06-01T10:00:00.000Z',
    atualizadoEm: '2025-01-15T10:00:00.000Z',
  },
]

// Dados de exemplo - Audit log
const auditData = [
  {
    id: '1',
    usuarioId: '1',
    usuarioNome: 'João Silva',
    acao: 'role.alterado',
    detalhes: 'Alterou o role do usuário André Oliveira para servo_ministerial',
    criadoEm: '2025-01-10T14:30:00.000Z',
  },
  {
    id: '2',
    usuarioId: '1',
    usuarioNome: 'João Silva',
    acao: 'permissao.alterada',
    detalhes: 'Adicionou permissão semanas.gerenciar ao usuário Pedro Santos',
    criadoEm: '2025-01-08T09:15:00.000Z',
  },
  {
    id: '3',
    usuarioId: '2',
    usuarioNome: 'Pedro Santos',
    acao: 'designacao.criada',
    detalhes: 'Criou designação para a semana de 13/01/2025',
    criadoEm: '2025-01-05T11:00:00.000Z',
  },
]

// Dados de exemplo - Solicitações de privilégios
const solicitacoesData = [
  {
    id: '1',
    usuarioId: '9',
    usuarioNome: 'Carlos Pereira',
    tipoSolicitacao: 'permissao',
    detalhes: 'Solicita permissão para gerenciar designações de AV',
    status: 'pendente',
    criadoEm: '2025-01-12T10:00:00.000Z',
    atualizadoEm: '2025-01-12T10:00:00.000Z',
  },
  {
    id: '2',
    usuarioId: '6',
    usuarioNome: 'Bruno Almeida',
    tipoSolicitacao: 'role',
    detalhes: 'Solicita elevação para anciao',
    status: 'pendente',
    criadoEm: '2025-01-10T08:30:00.000Z',
    atualizadoEm: '2025-01-10T08:30:00.000Z',
  },
  {
    id: '3',
    usuarioId: '10',
    usuarioNome: 'Sofia Lima',
    tipoSolicitacao: 'permissao',
    detalhes: 'Solicita acesso para visualizar relatórios da congregação',
    status: 'aprovada',
    criadoEm: '2025-01-05T14:00:00.000Z',
    atualizadoEm: '2025-01-06T09:00:00.000Z',
  },
]

// Armazenamento em memória
let roles = [...rolesData]
let usuarios = [...usuariosData]
let audit = [...auditData]
let solicitacoes = [...solicitacoesData]

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

  // Determinar sub-rota via URL parsing
  const url = new URL(req.url || '', 'http://localhost')
  const pathname = url.pathname
  const pathParts = pathname.replace('/api/privilegios', '').split('/').filter(Boolean)

  const subRoute = pathParts[0] || ''
  const resourceId = pathParts[1] || ''
  const action = pathParts[2] || ''

  // GET /api/privilegios/roles - Listar roles
  if (req.method === 'GET' && subRoute === 'roles') {
    return res.status(200).json({ roles })
  }

  // GET /api/privilegios/usuarios - Listar usuários
  if (req.method === 'GET' && subRoute === 'usuarios') {
    return res.status(200).json({ usuarios })
  }

  // PATCH /api/privilegios/usuarios/:id/role - Atualizar role do usuário
  if (req.method === 'PATCH' && subRoute === 'usuarios' && resourceId && action === 'role') {
    const idx = usuarios.findIndex(u => u.id === resourceId)
    if (idx >= 0) {
      const body = req.body || {}
      const newRole = roles.find(r => r.id === body.roleId || r.name === body.role)
      if (newRole) {
        usuarios[idx] = {
          ...usuarios[idx],
          roleId: newRole.id,
          roleName: newRole.name,
          permissions: [...newRole.permissions],
          atualizadoEm: new Date().toISOString(),
        }
        // Adicionar ao audit log
        audit.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          usuarioId: '1',
          usuarioNome: 'Sistema',
          acao: 'role.alterado',
          detalhes: `Alterou o role do usuário ${usuarios[idx].nome} para ${newRole.label}`,
          criadoEm: new Date().toISOString(),
        })
        return res.status(200).json(usuarios[idx])
      }
      return res.status(400).json({ error: 'Role inválido' })
    }
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }

  // POST /api/privilegios/usuarios/:id/permissions - Atualizar permissões do usuário
  if (req.method === 'POST' && subRoute === 'usuarios' && resourceId && action === 'permissions') {
    const idx = usuarios.findIndex(u => u.id === resourceId)
    if (idx >= 0) {
      const body = req.body || {}
      const newPermissions = body.permissions || []
      usuarios[idx] = {
        ...usuarios[idx],
        permissions: newPermissions,
        atualizadoEm: new Date().toISOString(),
      }
      // Adicionar ao audit log
      audit.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        usuarioId: '1',
        usuarioNome: 'Sistema',
        acao: 'permissao.alterada',
        detalhes: `Alterou as permissões do usuário ${usuarios[idx].nome}`,
        criadoEm: new Date().toISOString(),
      })
      return res.status(200).json(usuarios[idx])
    }
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }

  // GET /api/privilegios/audit - Listar audit log
  if (req.method === 'GET' && subRoute === 'audit') {
    return res.status(200).json({ audit })
  }

  // GET /api/privilegios/solicitacoes - Listar solicitações
  if (req.method === 'GET' && subRoute === 'solicitacoes') {
    return res.status(200).json({ solicitacoes })
  }

  // PATCH /api/privilegios/solicitacoes/:id - Atualizar solicitação
  if (req.method === 'PATCH' && subRoute === 'solicitacoes' && resourceId) {
    const idx = solicitacoes.findIndex(s => s.id === resourceId)
    if (idx >= 0) {
      const body = req.body || {}
      solicitacoes[idx] = {
        ...solicitacoes[idx],
        status: body.status || solicitacoes[idx].status,
        atualizadoEm: new Date().toISOString(),
      }
      return res.status(200).json(solicitacoes[idx])
    }
    return res.status(404).json({ error: 'Solicitação não encontrada' })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
