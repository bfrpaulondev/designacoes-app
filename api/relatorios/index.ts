import type { VercelRequest, VercelResponse } from '@vercel/node'

// Dados de exemplo para demonstração
const relatoriosData = [
  {
    id: '1',
    publicadorId: '1',
    publicadorNome: 'João Silva',
    mes: '2025-01',
    horas: 70,
    revisitas: 8,
    estudos: 4,
    videos: 12,
    publicacoes: 35,
    observacoes: 'Pioneiro regular',
    criadoEm: '2025-02-01T10:00:00.000Z',
    atualizadoEm: '2025-02-01T10:00:00.000Z',
  },
  {
    id: '2',
    publicadorId: '7',
    publicadorNome: 'Maria Sousa',
    mes: '2025-01',
    horas: 65,
    revisitas: 6,
    estudos: 3,
    videos: 10,
    publicacoes: 28,
    observacoes: 'Pioneiro regular',
    criadoEm: '2025-02-01T10:05:00.000Z',
    atualizadoEm: '2025-02-01T10:05:00.000Z',
  },
  {
    id: '3',
    publicadorId: '9',
    publicadorNome: 'Carlos Pereira',
    mes: '2025-01',
    horas: 10,
    revisitas: 2,
    estudos: 1,
    videos: 3,
    publicacoes: 8,
    observacoes: '',
    criadoEm: '2025-02-01T10:10:00.000Z',
    atualizadoEm: '2025-02-01T10:10:00.000Z',
  },
  {
    id: '4',
    publicadorId: '10',
    publicadorNome: 'Sofia Lima',
    mes: '2025-01',
    horas: 8,
    revisitas: 1,
    estudos: 1,
    videos: 2,
    publicacoes: 5,
    observacoes: '',
    criadoEm: '2025-02-01T10:15:00.000Z',
    atualizadoEm: '2025-02-01T10:15:00.000Z',
  },
  {
    id: '5',
    publicadorId: '5',
    publicadorNome: 'Ricardo Fernandes',
    mes: '2025-01',
    horas: 70,
    revisitas: 7,
    estudos: 5,
    videos: 15,
    publicacoes: 40,
    observacoes: 'Pioneiro regular',
    criadoEm: '2025-02-01T10:20:00.000Z',
    atualizadoEm: '2025-02-01T10:20:00.000Z',
  },
]

// Armazenamento em memória (simulando banco de dados)
let relatorios = [...relatoriosData]

function corsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query
  const body = req.body || {}

  // GET /api/relatorios - Listar todos
  if (req.method === 'GET' && !id) {
    return res.status(200).json({ relatorios })
  }

  // GET /api/relatorios/:id - Buscar por ID
  if (req.method === 'GET' && id) {
    const relatorio = relatorios.find(r => r.id === id)
    if (relatorio) {
      return res.status(200).json(relatorio)
    }
    return res.status(404).json({ error: 'Relatório não encontrado' })
  }

  // POST /api/relatorios - Criar novo
  if (req.method === 'POST') {
    if (!body.publicadorId || !body.mes) {
      return res.status(400).json({ error: 'publicadorId e mes são obrigatórios' })
    }
    const agora = new Date().toISOString()
    const novo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      publicadorId: body.publicadorId,
      publicadorNome: body.publicadorNome || '',
      mes: body.mes,
      horas: body.horas || 0,
      revisitas: body.revisitas || 0,
      estudos: body.estudos || 0,
      videos: body.videos || 0,
      publicacoes: body.publicacoes || 0,
      observacoes: body.observacoes || '',
      criadoEm: agora,
      atualizadoEm: agora,
    }
    relatorios.push(novo)
    return res.status(201).json(novo)
  }

  // PUT /api/relatorios/:id - Atualizar
  if (req.method === 'PUT' && id) {
    const idx = relatorios.findIndex(r => r.id === id)
    if (idx >= 0) {
      relatorios[idx] = {
        ...relatorios[idx],
        ...body,
        atualizadoEm: new Date().toISOString(),
      }
      return res.status(200).json(relatorios[idx])
    }
    return res.status(404).json({ error: 'Relatório não encontrado' })
  }

  // DELETE /api/relatorios/:id - Remover
  if (req.method === 'DELETE' && id) {
    relatorios = relatorios.filter(r => r.id !== id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
