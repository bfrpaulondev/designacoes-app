import type { VercelRequest, VercelResponse } from '@vercel/node'

// Dados de exemplo para demonstração
const familiasData = [
  {
    id: '1',
    nome: 'Família Silva',
    membros: ['1'],
    observacoes: 'João é ancião',
  },
  {
    id: '2',
    nome: 'Família Santos',
    membros: ['2'],
    observacoes: '',
  },
  {
    id: '3',
    nome: 'Família Costa',
    membros: ['3'],
    observacoes: 'Manuel é pioneiro auxiliar',
  },
  {
    id: '4',
    nome: 'Família Oliveira',
    membros: ['4'],
    observacoes: '',
  },
  {
    id: '5',
    nome: 'Família Rodrigues',
    membros: ['8'],
    observacoes: 'Ana é pioneira auxiliar',
  },
]

// Armazenamento em memória (simulando banco de dados)
let familias = [...familiasData]

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

  // GET /api/familias - Listar todas
  if (req.method === 'GET' && !id) {
    return res.status(200).json({ familias })
  }

  // GET /api/familias/:id - Buscar por ID
  if (req.method === 'GET' && id) {
    const familia = familias.find(f => f.id === id)
    if (familia) {
      return res.status(200).json(familia)
    }
    return res.status(404).json({ error: 'Família não encontrada' })
  }

  // POST /api/familias - Criar nova
  if (req.method === 'POST') {
    if (!body.nome) {
      return res.status(400).json({ error: 'nome é obrigatório' })
    }
    const nova = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nome: body.nome,
      membros: body.membros || [],
      observacoes: body.observacoes || '',
    }
    familias.push(nova)
    return res.status(201).json(nova)
  }

  // PUT /api/familias/:id - Atualizar
  if (req.method === 'PUT' && id) {
    const idx = familias.findIndex(f => f.id === id)
    if (idx >= 0) {
      familias[idx] = {
        ...familias[idx],
        ...body,
      }
      return res.status(200).json(familias[idx])
    }
    return res.status(404).json({ error: 'Família não encontrada' })
  }

  // DELETE /api/familias/:id - Remover
  if (req.method === 'DELETE' && id) {
    familias = familias.filter(f => f.id !== id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
