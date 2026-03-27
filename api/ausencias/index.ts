import type { VercelRequest, VercelResponse } from '@vercel/node'

// Armazenamento em memória (simulando banco de dados)
let ausencias: any[] = []

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

  // GET /api/ausencias - Listar todas
  if (req.method === 'GET' && !id) {
    return res.status(200).json({ ausencias })
  }

  // GET /api/ausencias/:id - Buscar por ID
  if (req.method === 'GET' && id) {
    const ausencia = ausencias.find(a => a.id === id)
    if (ausencia) {
      return res.status(200).json(ausencia)
    }
    return res.status(404).json({ error: 'Ausência não encontrada' })
  }

  // POST /api/ausencias - Criar nova
  if (req.method === 'POST') {
    const nova = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...req.body,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }
    ausencias.push(nova)
    return res.status(201).json(nova)
  }

  // PUT /api/ausencias/:id - Atualizar
  if (req.method === 'PUT' && id) {
    const idx = ausencias.findIndex(a => a.id === id)
    if (idx >= 0) {
      ausencias[idx] = {
        ...ausencias[idx],
        ...req.body,
        atualizadoEm: new Date().toISOString()
      }
      return res.status(200).json(ausencias[idx])
    }
    return res.status(404).json({ error: 'Ausência não encontrada' })
  }

  // DELETE /api/ausencias/:id - Remover
  if (req.method === 'DELETE' && id) {
    ausencias = ausencias.filter(a => a.id !== id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
