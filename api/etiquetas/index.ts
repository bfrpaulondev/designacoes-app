import type { VercelRequest, VercelResponse } from '@vercel/node'

// Dados de exemplo para demonstração
const etiquetasData = [
  { id: '1', nome: 'Presidente', cor: '#3B82F6', descricao: 'Pode presidir reuniões', ordem: 1 },
  { id: '2', nome: 'AV', cor: '#10B981', descricao: 'Responsável pelo áudio e vídeo', ordem: 2 },
  { id: '3', nome: 'Som', cor: '#F59E0B', descricao: 'Operador de som', ordem: 3 },
  { id: '4', nome: 'Indicador', cor: '#8B5CF6', descricao: 'Indicador de tempo', ordem: 4 },
  { id: '5', nome: 'Microfone', cor: '#EF4444', descricao: 'Portador de microfone', ordem: 5 },
  { id: '6', nome: 'Palco', cor: '#EC4899', descricao: 'Designações de palco', ordem: 6 },
  { id: '7', nome: 'Leitor', cor: '#6366F1', descricao: 'Leitor da Sentinela', ordem: 7 },
  { id: '8', nome: 'Limpeza', cor: '#14B8A6', descricao: 'Grupo de limpeza', ordem: 8 },
]

// Armazenamento em memória (simulando banco de dados)
let etiquetas = [...etiquetasData]

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

  // GET /api/etiquetas - Listar todas
  if (req.method === 'GET' && !id) {
    return res.status(200).json({ etiquetas })
  }

  // GET /api/etiquetas/:id - Buscar por ID
  if (req.method === 'GET' && id) {
    const etiqueta = etiquetas.find(e => e.id === id)
    if (etiqueta) {
      return res.status(200).json(etiqueta)
    }
    return res.status(404).json({ error: 'Etiqueta não encontrada' })
  }

  // POST /api/etiquetas - Criar nova
  if (req.method === 'POST') {
    if (!body.nome) {
      return res.status(400).json({ error: 'nome é obrigatório' })
    }
    const nova = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nome: body.nome,
      cor: body.cor || '#6B7280',
      descricao: body.descricao || '',
      ordem: body.ordem || etiquetas.length + 1,
    }
    etiquetas.push(nova)
    return res.status(201).json(nova)
  }

  // PUT /api/etiquetas/:id - Atualizar
  if (req.method === 'PUT' && id) {
    const idx = etiquetas.findIndex(e => e.id === id)
    if (idx >= 0) {
      etiquetas[idx] = {
        ...etiquetas[idx],
        ...body,
      }
      return res.status(200).json(etiquetas[idx])
    }
    return res.status(404).json({ error: 'Etiqueta não encontrada' })
  }

  // DELETE /api/etiquetas/:id - Remover
  if (req.method === 'DELETE' && id) {
    etiquetas = etiquetas.filter(e => e.id !== id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
