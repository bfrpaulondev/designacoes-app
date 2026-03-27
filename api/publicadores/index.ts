import type { VercelRequest, VercelResponse } from '@vercel/node'

// Dados de exemplo para demonstração
const publicadoresData = [
  // Anciãos
  { id: '1', nome: 'João Silva', nomeCompleto: 'João Pedro Silva', nomePrimeiro: 'João', nomeUltimo: 'Silva', email: 'joao@email.com', telemovel: '912345678', genero: 'masculino', tipoPublicador: 'pioneiro_regular', privilegioServico: 'anciao', grupoCampo: 'G-1 - Jorge Sanches', status: 'ativo', etiquetas: ['AV', 'Presidente'] },
  { id: '2', nome: 'Pedro Santos', nomeCompleto: 'Pedro Manuel Santos', nomePrimeiro: 'Pedro', nomeUltimo: 'Santos', email: 'pedro@email.com', telemovel: '912345679', genero: 'masculino', tipoPublicador: 'publicador_batizado', privilegioServico: 'anciao', grupoCampo: 'G-2 - João Pedro', status: 'ativo', etiquetas: [] },
  { id: '3', nome: 'Manuel Costa', nomeCompleto: 'Manuel José Costa', nomePrimeiro: 'Manuel', nomeUltimo: 'Costa', email: 'manuel@email.com', telemovel: '912345680', genero: 'masculino', tipoPublicador: 'pioneiro_auxiliar', privilegioServico: 'anciao', grupoCampo: 'G-3 - Filipe Paulino', status: 'ativo', etiquetas: ['Presidente'] },

  // Servos Ministeriais
  { id: '4', nome: 'André Oliveira', nomeCompleto: 'André Luís Oliveira', nomePrimeiro: 'André', nomeUltimo: 'Oliveira', email: 'andre@email.com', telemovel: '912345681', genero: 'masculino', tipoPublicador: 'publicador_batizado', privilegioServico: 'servo_ministerial', grupoCampo: 'G-1 - Jorge Sanches', status: 'ativo', etiquetas: ['AV', 'Som'] },
  { id: '5', nome: 'Ricardo Fernandes', nomeCompleto: 'Ricardo João Fernandes', nomePrimeiro: 'Ricardo', nomeUltimo: 'Fernandes', email: 'ricardo@email.com', telemovel: '912345682', genero: 'masculino', tipoPublicador: 'pioneiro_regular', privilegioServico: 'servo_ministerial', grupoCampo: 'G-2 - João Pedro', status: 'ativo', etiquetas: ['Indicador'] },
  { id: '6', nome: 'Bruno Almeida', nomeCompleto: 'Bruno Miguel Almeida', nomePrimeiro: 'Bruno', nomeUltimo: 'Almeida', email: 'bruno@email.com', telemovel: '912345683', genero: 'masculino', tipoPublicador: 'publicador_batizado', privilegioServico: 'servo_ministerial', grupoCampo: 'G-3 - Filipe Paulino', status: 'ativo', etiquetas: [] },

  // Publicadores (sem privilégio especial)
  { id: '7', nome: 'Maria Sousa', nomeCompleto: 'Maria Ana Sousa', nomePrimeiro: 'Maria', nomeUltimo: 'Sousa', email: 'maria@email.com', telemovel: '912345684', genero: 'feminino', tipoPublicador: 'pioneiro_regular', privilegioServico: 'nenhum', grupoCampo: 'G-1 - Jorge Sanches', status: 'ativo', etiquetas: [] },
  { id: '8', nome: 'Ana Rodrigues', nomeCompleto: 'Ana Paula Rodrigues', nomePrimeiro: 'Ana', nomeUltimo: 'Rodrigues', email: 'ana@email.com', telemovel: '912345685', genero: 'feminino', tipoPublicador: 'pioneiro_auxiliar', privilegioServico: 'nenhum', grupoCampo: 'G-2 - João Pedro', status: 'ativo', etiquetas: [] },
  { id: '9', nome: 'Carlos Pereira', nomeCompleto: 'Carlos Eduardo Pereira', nomePrimeiro: 'Carlos', nomeUltimo: 'Pereira', email: 'carlos@email.com', telemovel: '912345686', genero: 'masculino', tipoPublicador: 'publicador_batizado', privilegioServico: 'nenhum', grupoCampo: 'G-3 - Filipe Paulino', status: 'ativo', etiquetas: ['AV'] },
  { id: '10', nome: 'Sofia Lima', nomeCompleto: 'Sofia Cristina Lima', nomePrimeiro: 'Sofia', nomeUltimo: 'Lima', email: 'sofia@email.com', telemovel: '912345687', genero: 'feminino', tipoPublicador: 'publicador_batizado', privilegioServico: 'nenhum', grupoCampo: 'G-1 - Jorge Sanches', status: 'ativo', etiquetas: [] },
]

// Armazenamento em memória (simulando banco de dados)
let publicadores = [...publicadoresData]

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

  // GET /api/publicadores - Listar todos
  if (req.method === 'GET' && !id) {
    return res.status(200).json({ publicadores })
  }

  // GET /api/publicadores/:id - Buscar por ID
  if (req.method === 'GET' && id) {
    const publicador = publicadores.find(p => p.id === id)
    if (publicador) {
      return res.status(200).json(publicador)
    }
    return res.status(404).json({ error: 'Publicador não encontrado' })
  }

  // POST /api/publicadores - Criar novo
  if (req.method === 'POST') {
    const novo = {
      id: Date.now().toString(),
      ...req.body,
      status: req.body.status || 'ativo'
    }
    publicadores.push(novo)
    return res.status(201).json(novo)
  }

  // PUT /api/publicadores/:id - Atualizar
  if (req.method === 'PUT' && id) {
    const idx = publicadores.findIndex(p => p.id === id)
    if (idx >= 0) {
      publicadores[idx] = { ...publicadores[idx], ...req.body }
      return res.status(200).json(publicadores[idx])
    }
    return res.status(404).json({ error: 'Publicador não encontrado' })
  }

  // DELETE /api/publicadores/:id - Remover
  if (req.method === 'DELETE' && id) {
    publicadores = publicadores.filter(p => p.id !== id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
