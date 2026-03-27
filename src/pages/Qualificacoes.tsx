import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Avatar,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
} from '@mui/material'
import {

  Search as SearchIcon,

} from '@mui/icons-material'
import api from '../api'

// Tipos
interface Designacao {
  id: string
  nome: string
  categoria: string
}

interface PublicadorMatriz {
  id: string
  nome: string
  genero: string
  privilegioServico: string
  designacoes: string[]
}

interface DesignacoesPorCategoria {
  meio_semana: Designacao[]
  fim_semana: Designacao[]
  outros: Designacao[]
}

const CATEGORIAS = [
  { id: 'meio_semana', nome: 'Reunião Meio de Semana', color: '#4CAF50' },
  { id: 'fim_semana', nome: 'Reunião Fim de Semana', color: '#2196F3' },
  { id: 'outros', nome: 'Outros', color: '#FF9800' },
]

export default function Qualificacoes() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // ID do publicador sendo salvo
  const [error, setError] = useState('')
  
  const [designacoes, setDesignacoes] = useState<DesignacoesPorCategoria>({ meio_semana: [], fim_semana: [], outros: [] })
  const [publicadores, setPublicadores] = useState<PublicadorMatriz[]>([])
  const [contagem, setContagem] = useState<Record<string, number>>({})
  
  const [tabValue, setTabValue] = useState(0)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.get('/qualificacoes/matriz')
      setDesignacoes(response.data.designacoes || {})
      setPublicadores(response.data.publicadores || [])
      setContagem(response.data.contagem || {})
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      setError(err.response?.data?.error || 'Erro ao carregar qualificações')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (publicador: PublicadorMatriz, designacaoId: string) => {
    try {
      setSaving(publicador.id)
      setError('')
      
      // Otimistic update
      const novoPublicadores = publicadores.map(p => {
        if (p.id === publicador.id) {
          const designacoes = [...p.designacoes]
          const index = designacoes.indexOf(designacaoId)
          if (index >= 0) {
            designacoes.splice(index, 1)
          } else {
            designacoes.push(designacaoId)
          }
          return { ...p, designacoes }
        }
        return p
      })
      setPublicadores(novoPublicadores)
      
      // Atualizar contagem
      const estavaQualificado = publicador.designacoes.includes(designacaoId)
      setContagem(prev => ({
        ...prev,
        [designacaoId]: (prev[designacaoId] || 0) + (estavaQualificado ? -1 : 1)
      }))
      
      // Salvar no backend
      await api.post(`/qualificacoes/publicador/${publicador.id}/toggle`, {
        designacao: designacaoId
      })
      
    } catch (err: any) {
      console.error('Erro ao atualizar:', err)
      setError(err.response?.data?.error || 'Erro ao atualizar')
      // Reverter em caso de erro
      loadData()
    } finally {
      setSaving(null)
    }
  }

  const categoriaAtual = CATEGORIAS[tabValue].id as keyof DesignacoesPorCategoria
  const designacoesAtuais = designacoes[categoriaAtual] || []

  // Filtrar publicadores por busca
  const publicadoresFiltrados = publicadores.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Qualificações para Designações
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Marque as designações que cada publicador pode receber.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
        <TextField
          size="small"
          placeholder="Buscar publicador..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <Chip 
          label={`${publicadoresFiltrados.length} publicadores`}
          variant="outlined"
        />
      </Box>

      {/* Tabs por categoria */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          {CATEGORIAS.map((cat) => (
            <Tab 
              key={cat.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {cat.nome}
                  <Chip 
                    size="small" 
                    label={`${designacoes[cat.id as keyof DesignacoesPorCategoria]?.length || 0} designações`}
                    sx={{ bgcolor: cat.color, color: 'white' }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tabela */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 'calc(100vh - 340px)',
          '& .MuiTableCell-head': {
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 'bold',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200, left: 0, position: 'sticky', zIndex: 2, bgcolor: 'primary.main' }}>
                Publicador
              </TableCell>
              <TableCell sx={{ minWidth: 100 }}>
                Privilégio
              </TableCell>
              {designacoesAtuais.map((d) => (
                <TableCell 
                  key={d.id} 
                  align="center"
                  sx={{ minWidth: 80 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ lineHeight: 1.2, textAlign: 'center' }}>
                      {d.nome}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={contagem[d.id] || 0}
                      color={(contagem[d.id] || 0) > 0 ? 'success' : 'default'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {publicadoresFiltrados.map((pub) => (
              <TableRow 
                key={pub.id} 
                hover
                sx={{ 
                  '&:hover': { bgcolor: 'action.hover' },
                  opacity: saving && saving !== pub.id ? 0.5 : 1
                }}
              >
                <TableCell 
                  sx={{ 
                    left: 0, 
                    position: 'sticky', 
                    bgcolor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        bgcolor: pub.genero === 'masculino' ? 'primary.light' : 'secondary.light',
                        fontSize: '0.8rem'
                      }}
                    >
                      {pub.nome.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" noWrap>
                      {pub.nome}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    label={pub.privilegioServico || 'Nenhum'}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </TableCell>
                {designacoesAtuais.map((d) => {
                  const qualificado = pub.designacoes.includes(d.id)
                  const isSaving = saving === pub.id
                  
                  return (
                    <TableCell key={d.id} align="center">
                      <Checkbox
                        checked={qualificado}
                        onChange={() => handleToggle(pub, d.id)}
                        disabled={isSaving}
                        size="small"
                        sx={{
                          color: qualificado ? 'success.main' : 'action.disabled',
                          '&.Mui-checked': {
                            color: 'success.main',
                          },
                        }}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
            
            {publicadoresFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={2 + designacoesAtuais.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {busca ? 'Nenhum publicador encontrado' : 'Nenhum publicador cadastrado'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legenda */}
      <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox checked size="small" sx={{ color: 'success.main' }} />
          <Typography variant="caption">Qualificado para esta designação</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox checked={false} size="small" />
          <Typography variant="caption">Não qualificado</Typography>
        </Box>
      </Box>
    </Box>
  )
}
