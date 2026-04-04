import type { VercelRequest, VercelResponse } from '@vercel/node'

// Tipos de designação disponíveis
const tiposDesignacao = [
  'presidente',
  'orador',
  'leitor_sentinela',
  'av',
  'som',
  'microfone',
  'indicador',
  'palco',
  'video',
  'interprete',
  'discurso_servico',
  'auxiliar_teo',
  'estudo_biblico',
  'nosso_ministerio',
  'nossa_vida_crista',
  'testemunho_publico',
]

// Matriz de qualificações - qual publicador pode fazer qual tipo de designação
const matrizData = [
  // João Silva - Ancião, pioneiro
  { publicadorId: '1', publicadorNome: 'João Silva', tipoDesignacao: 'presidente', qualificado: true },
  { publicadorId: '1', publicadorNome: 'João Silva', tipoDesignacao: 'orador', qualificado: true },
  { publicadorId: '1', publicadorNome: 'João Silva', tipoDesignacao: 'leitor_sentinela', qualificado: true },
  { publicadorId: '1', publicadorNome: 'João Silva', tipoDesignacao: 'av', qualificado: true },
  { publicadorId: '1', publicadorNome: 'João Silva', tipoDesignacao: 'discurso_servico', qualificado: true },
  { publicadorId: '1', publicadorNome: 'João Silva', tipoDesignacao: 'estudo_biblico', qualificado: true },

  // Pedro Santos - Ancião
  { publicadorId: '2', publicadorNome: 'Pedro Santos', tipoDesignacao: 'presidente', qualificado: true },
  { publicadorId: '2', publicadorNome: 'Pedro Santos', tipoDesignacao: 'orador', qualificado: true },
  { publicadorId: '2', publicadorNome: 'Pedro Santos', tipoDesignacao: 'leitor_sentinela', qualificado: true },
  { publicadorId: '2', publicadorNome: 'Pedro Santos', tipoDesignacao: 'discurso_servico', qualificado: true },
  { publicadorId: '2', publicadorNome: 'Pedro Santos', tipoDesignacao: 'estudo_biblico', qualificado: true },

  // Manuel Costa - Ancião, pioneiro auxiliar
  { publicadorId: '3', publicadorNome: 'Manuel Costa', tipoDesignacao: 'presidente', qualificado: true },
  { publicadorId: '3', publicadorNome: 'Manuel Costa', tipoDesignacao: 'orador', qualificado: true },
  { publicadorId: '3', publicadorNome: 'Manuel Costa', tipoDesignacao: 'discurso_servico', qualificado: true },

  // André Oliveira - Servo ministerial
  { publicadorId: '4', publicadorNome: 'André Oliveira', tipoDesignacao: 'presidente', qualificado: true },
  { publicadorId: '4', publicadorNome: 'André Oliveira', tipoDesignacao: 'av', qualificado: true },
  { publicadorId: '4', publicadorNome: 'André Oliveira', tipoDesignacao: 'som', qualificado: true },
  { publicadorId: '4', publicadorNome: 'André Oliveira', tipoDesignacao: 'microfone', qualificado: true },
  { publicadorId: '4', publicadorNome: 'André Oliveira', tipoDesignacao: 'leitor_sentinela', qualificado: true },

  // Ricardo Fernandes - Servo ministerial, pioneiro
  { publicadorId: '5', publicadorNome: 'Ricardo Fernandes', tipoDesignacao: 'indicador', qualificado: true },
  { publicadorId: '5', publicadorNome: 'Ricardo Fernandes', tipoDesignacao: 'microfone', qualificado: true },
  { publicadorId: '5', publicadorNome: 'Ricardo Fernandes', tipoDesignacao: 'video', qualificado: true },
  { publicadorId: '5', publicadorNome: 'Ricardo Fernandes', tipoDesignacao: 'leitor_sentinela', qualificado: true },

  // Bruno Almeida - Servo ministerial
  { publicadorId: '6', publicadorNome: 'Bruno Almeida', tipoDesignacao: 'microfone', qualificado: true },
  { publicadorId: '6', publicadorNome: 'Bruno Almeida', tipoDesignacao: 'som', qualificado: true },
  { publicadorId: '6', publicadorNome: 'Bruno Almeida', tipoDesignacao: 'leitor_sentinela', qualificado: true },

  // Maria Sousa - Pioneira regular
  { publicadorId: '7', publicadorNome: 'Maria Sousa', tipoDesignacao: 'av', qualificado: true },
  { publicadorId: '7', publicadorNome: 'Maria Sousa', tipoDesignacao: 'video', qualificado: true },
  { publicadorId: '7', publicadorNome: 'Maria Sousa', tipoDesignacao: 'nosso_ministerio', qualificado: true },
  { publicadorId: '7', publicadorNome: 'Maria Sousa', tipoDesignacao: 'nossa_vida_crista', qualificado: true },
  { publicadorId: '7', publicadorNome: 'Maria Sousa', tipoDesignacao: 'estudo_biblico', qualificado: true },

  // Ana Rodrigues - Pioneira auxiliar
  { publicadorId: '8', publicadorNome: 'Ana Rodrigues', tipoDesignacao: 'av', qualificado: true },
  { publicadorId: '8', publicadorNome: 'Ana Rodrigues', tipoDesignacao: 'indicador', qualificado: true },
  { publicadorId: '8', publicadorNome: 'Ana Rodrigues', tipoDesignacao: 'nosso_ministerio', qualificado: true },
  { publicadorId: '8', publicadorNome: 'Ana Rodrigues', tipoDesignacao: 'nossa_vida_crista', qualificado: true },

  // Carlos Pereira - Publicador
  { publicadorId: '9', publicadorNome: 'Carlos Pereira', tipoDesignacao: 'av', qualificado: true },
  { publicadorId: '9', publicadorNome: 'Carlos Pereira', tipoDesignacao: 'microfone', qualificado: true },
  { publicadorId: '9', publicadorNome: 'Carlos Pereira', tipoDesignacao: 'testemunho_publico', qualificado: true },

  // Sofia Lima - Publicadora
  { publicadorId: '10', publicadorNome: 'Sofia Lima', tipoDesignacao: 'av', qualificado: true },
  { publicadorId: '10', publicadorNome: 'Sofia Lima', tipoDesignacao: 'video', qualificado: true },
  { publicadorId: '10', publicadorNome: 'Sofia Lima', tipoDesignacao: 'testemunho_publico', qualificado: true },
]

// Armazenamento em memória
let matriz = [...matrizData]

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
  const pathParts = pathname.replace('/api/qualificacoes', '').split('/').filter(Boolean)

  const subRoute = pathParts[0] || ''
  const resourceId = pathParts[1] || ''
  const action = pathParts[2] || ''

  // GET /api/qualificacoes/matriz - Listar matriz de qualificações
  if (req.method === 'GET' && subRoute === 'matriz') {
    return res.status(200).json({ matriz })
  }

  // POST /api/qualificacoes/publicador/:id/toggle - Toggle qualificação de um publicador
  if (req.method === 'POST' && subRoute === 'publicador' && resourceId && action === 'toggle') {
    const body = req.body || {}
    const { tipoDesignacao } = body

    if (!tipoDesignacao) {
      return res.status(400).json({ error: 'tipoDesignacao é obrigatório' })
    }

    const idx = matriz.findIndex(
      m => m.publicadorId === resourceId && m.tipoDesignacao === tipoDesignacao
    )

    if (idx >= 0) {
      // Toggle existente
      matriz[idx] = {
        ...matriz[idx],
        qualificado: !matriz[idx].qualificado,
      }
      return res.status(200).json(matriz[idx])
    } else {
      // Criar nova entrada (ativar)
      const publicador = matriz.find(m => m.publicadorId === resourceId)
      const nova = {
        publicadorId: resourceId,
        publicadorNome: publicador?.publicadorNome || '',
        tipoDesignacao,
        qualificado: true,
      }
      matriz.push(nova)
      return res.status(201).json(nova)
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
