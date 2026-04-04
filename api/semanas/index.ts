import type { VercelRequest, VercelResponse } from '@vercel/node'

// Dados de exemplo para demonstração
const semanasData = [
  {
    id: '1',
    dataInicio: '2025-01-06',
    dataFim: '2025-01-12',
    observacoes: 'Semana de reunião de circuito',
    status: 'publicado',
  },
  {
    id: '2',
    dataInicio: '2025-01-13',
    dataFim: '2025-01-19',
    observacoes: '',
    status: 'publicado',
  },
  {
    id: '3',
    dataInicio: '2025-01-20',
    dataFim: '2025-01-26',
    observacoes: 'Visita do superintendente de circuito',
    status: 'rascunho',
  },
  {
    id: '4',
    dataInicio: '2025-01-27',
    dataFim: '2025-02-02',
    observacoes: '',
    status: 'rascunho',
  },
  {
    id: '5',
    dataInicio: '2025-02-03',
    dataFim: '2025-02-09',
    observacoes: 'Assembleia de circuito',
    status: 'rascunho',
  },
]

// Armazenamento em memória (simulando banco de dados)
let semanas = [...semanasData]

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

  // GET /api/semanas - Listar todas
  if (req.method === 'GET' && !id) {
    return res.status(200).json({ semanas })
  }

  // GET /api/semanas/:id - Buscar por ID
  if (req.method === 'GET' && id) {
    const semana = semanas.find(s => s.id === id)
    if (semana) {
      return res.status(200).json(semana)
    }
    return res.status(404).json({ error: 'Semana não encontrada' })
  }

  // POST /api/semanas - Criar nova
  if (req.method === 'POST') {
    const dataInicio = body.dataInicio
    if (!dataInicio) {
      return res.status(400).json({ error: 'dataInicio é obrigatório' })
    }

    // Calcular dataFim (startDate + 6 dias)
    const inicio = new Date(dataInicio)
    const fim = new Date(dataInicio)
    fim.setDate(fim.getDate() + 6)

    const nova = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dataInicio,
      dataFim: fim.toISOString().split('T')[0],
      observacoes: body.observacoes || '',
      status: body.status || 'rascunho',
    }
    semanas.push(nova)
    return res.status(201).json(nova)
  }

  // PUT /api/semanas/:id - Atualizar
  if (req.method === 'PUT' && id) {
    const idx = semanas.findIndex(s => s.id === id)
    if (idx >= 0) {
      // Recalcular dataFim se dataInicio for atualizada
      let dataFim = semanas[idx].dataFim
      if (body.dataInicio) {
        const fim = new Date(body.dataInicio)
        fim.setDate(fim.getDate() + 6)
        dataFim = fim.toISOString().split('T')[0]
      }

      semanas[idx] = {
        ...semanas[idx],
        ...body,
        dataFim,
      }
      return res.status(200).json(semanas[idx])
    }
    return res.status(404).json({ error: 'Semana não encontrada' })
  }

  // DELETE /api/semanas/:id - Remover
  if (req.method === 'DELETE' && id) {
    semanas = semanas.filter(s => s.id !== id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
