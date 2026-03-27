import type { VercelRequest, VercelResponse } from '@vercel/node'

// Configurações gerais
let configGeral: any = {
  nomeCongregacao: 'Congregação Teste'
}

function corsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET /api/config - Obter configurações gerais
  if (req.method === 'GET') {
    return res.status(200).json({ config: configGeral })
  }

  // POST /api/config - Atualizar configurações gerais
  if (req.method === 'POST') {
    const body = req.body || {}
    configGeral = {
      ...configGeral,
      ...body
    }
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
