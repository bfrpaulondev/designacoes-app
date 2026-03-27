import type { VercelRequest, VercelResponse } from '@vercel/node'

// Armazenamento em memória (simulando banco de dados)
let designacoes: any[] = []

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

  const { id } = req.query
  const body = req.body || {}

  // GET /api/designacoes - Listar todas
  if (req.method === 'GET' && !id) {
    return res.status(200).json({ designacoes })
  }

  // GET /api/designacoes/:id - Buscar por ID
  if (req.method === 'GET' && id) {
    const designacao = designacoes.find(d => d.id === id)
    if (designacao) {
      return res.status(200).json(designacao)
    }
    return res.status(404).json({ error: 'Designação não encontrada' })
  }

  // POST /api/designacoes - Criar nova
  if (req.method === 'POST') {
    // Verificar se é batch
    if (body.designacoes && Array.isArray(body.designacoes)) {
      const novas = body.designacoes.map((d: any) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...d,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      }))

      // Remover designações antigas da mesma semana
      const semanaInicio = novas[0]?.data
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
      return res.status(201).json({ success: true, count: novas.length })
    }

    // Designação única
    const nova = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...body,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }
    designacoes.push(nova)
    return res.status(201).json(nova)
  }

  // PUT /api/designacoes/:id - Atualizar
  if (req.method === 'PUT' && id) {
    const idx = designacoes.findIndex(d => d.id === id)
    if (idx >= 0) {
      designacoes[idx] = {
        ...designacoes[idx],
        ...body,
        atualizadoEm: new Date().toISOString()
      }
      return res.status(200).json(designacoes[idx])
    }
    return res.status(404).json({ error: 'Designação não encontrada' })
  }

  // PATCH /api/designacoes/:id - Atualizar parcialmente
  if (req.method === 'PATCH' && id) {
    const idx = designacoes.findIndex(d => d.id === id)
    if (idx >= 0) {
      designacoes[idx] = {
        ...designacoes[idx],
        ...body,
        atualizadoEm: new Date().toISOString()
      }
      return res.status(200).json(designacoes[idx])
    }
    return res.status(404).json({ error: 'Designação não encontrada' })
  }

  // DELETE /api/designacoes/:id - Remover
  if (req.method === 'DELETE' && id) {
    designacoes = designacoes.filter(d => d.id !== id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
