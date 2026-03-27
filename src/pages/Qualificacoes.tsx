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
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Add as AddIcon,


  Check as CheckIcon,

  Person as PersonIcon,
  School as SchoolIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import api from '../api'

// Tipos
interface QualificacaoPublicador {
  tipo: string
  nivel: 'aprendiz' | 'qualificado' | 'experiente' | 'especialista'
  status: 'ativo' | 'inativo' | 'em_treinamento' | 'restrito'
  dataInicio?: string
  observacoes?: string
  ultimaDesignacao?: string
  totalDesignacoes?: number
}

interface TipoQualificacaoInfo {
  tipo: string
  nome: string
  descricao: string
  requisitos: string[]
}

interface CategoriaQualificacao {
  id: string
  nome: string
  descricao: string
  icone?: string
  tipos: TipoQualificacaoInfo[]
  ordem: number
}

interface PublicadorResumo {
  id: string
  nome: string
  genero: string
  privilegioServico: string
  qualificacoes: Record<string, QualificacaoPublicador | null>
}

interface ContagemQualificacao {
  total: number
  ativos: number
  aprendizes: number
}

const NIVEL_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  aprendiz: 'warning',
  qualificado: 'success',
  experiente: 'primary',
  especialista: 'secondary',
}

const NIVEL_LABELS: Record<string, string> = {
  aprendiz: 'Aprendiz',
  qualificado: 'Qualificado',
  experiente: 'Experiente',
  especialista: 'Especialista',
}

const STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  em_treinamento: 'Em Treinamento',
  restrito: 'Restrito',
}

export default function Qualificacoes() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categorias, setCategorias] = useState<CategoriaQualificacao[]>([])
  const [publicadores, setPublicadores] = useState<PublicadorResumo[]>([])
  const [contagem, setContagem] = useState<Record<string, ContagemQualificacao>>({})
  const [tabValue, setTabValue] = useState(0)
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPublicador, setSelectedPublicador] = useState<PublicadorResumo | null>(null)
  const [selectedTipo, setSelectedTipo] = useState<string>('')
  const [nivel, setNivel] = useState<string>('qualificado')
  const [status, setStatus] = useState<string>('ativo')
  const [observacoes, setObservacoes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Carregar matriz de qualificações
      const response = await api.get('/qualificacoes/matriz')
      setCategorias(response.data.categorias || [])
      setPublicadores(response.data.publicadores || [])
      setContagem(response.data.contagem || {})
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      setError(err.response?.data?.error || 'Erro ao carregar qualificações')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (publicador: PublicadorResumo, tipo: string) => {
    const qualificacaoAtual = publicador.qualificacoes[tipo]
    setSelectedPublicador(publicador)
    setSelectedTipo(tipo)
    setNivel(qualificacaoAtual?.nivel || 'qualificado')
    setStatus(qualificacaoAtual?.status || 'ativo')
    setObservacoes(qualificacaoAtual?.observacoes || '')
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedPublicador(null)
    setSelectedTipo('')
    setObservacoes('')
  }

  const handleSave = async () => {
    if (!selectedPublicador || !selectedTipo) return
    
    try {
      setSaving(true)
      
      await api.post(`/qualificacoes/publicador/${selectedPublicador.id}`, {
        tipo: selectedTipo,
        nivel,
        status,
        observacoes,
      })
      
      // Recarregar dados
      await loadData()
      handleCloseDialog()
    } catch (err: any) {
      console.error('Erro ao salvar:', err)
      setError(err.response?.data?.error || 'Erro ao salvar qualificação')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (publicadorId: string, tipo: string) => {
    if (!confirm('Remover esta qualificação?')) return
    
    try {
      await api.delete(`/qualificacoes/publicador/${publicadorId}/${tipo}`)
      await loadData()
    } catch (err: any) {
      console.error('Erro ao remover:', err)
      setError(err.response?.data?.error || 'Erro ao remover qualificação')
    }
  }

  const getTipoNome = (tipo: string): string => {
    for (const cat of categorias) {
      const found = cat.tipos.find(t => t.tipo === tipo)
      if (found) return found.nome
    }
    return tipo
  }

  const categoriaAtual = categorias[tabValue]
  const tiposAtuais = categoriaAtual?.tipos || []

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
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie as qualificações de cada publicador para saber quem pode ser designado para cada função.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Resumo por categoria */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {categorias.map((cat) => {
          const totalQualificados = cat.tipos.reduce((sum, t) => sum + (contagem[t.tipo]?.ativos || 0), 0)
          const totalAprendizes = cat.tipos.reduce((sum, t) => sum + (contagem[t.tipo]?.aprendizes || 0), 0)
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={cat.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: tabValue === categorias.indexOf(cat) ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => setTabValue(categorias.indexOf(cat))}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {cat.nome}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                    <Chip 
                      size="small" 
                      label={`${totalQualificados} qual.`}
                      color="success"
                      variant="outlined"
                    />
                    {totalAprendizes > 0 && (
                      <Chip 
                        size="small" 
                        label={`${totalAprendizes} aprend.`}
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Tabs por categoria */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          {categorias.map((cat) => (
            <Tab key={cat.id} label={cat.nome} />
          ))}
        </Tabs>
      </Paper>

      {/* Tabela de qualificações */}
      {categoriaAtual && (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 380px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200, fontWeight: 'bold', bgcolor: 'background.paper' }}>
                  Publicador
                </TableCell>
                <TableCell sx={{ minWidth: 100, fontWeight: 'bold', bgcolor: 'background.paper' }}>
                  Privilégio
                </TableCell>
                {tiposAtuais.map((tipo) => (
                  <TableCell 
                    key={tipo.tipo} 
                    align="center"
                    sx={{ 
                      minWidth: 120, 
                      fontWeight: 'bold',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Tooltip title={tipo.descricao} arrow>
                      <Box>
                        <Typography variant="caption" display="block">
                          {tipo.nome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({contagem[tipo.tipo]?.ativos || 0} qual.)
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {publicadores.map((pub) => (
                <TableRow key={pub.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: pub.genero === 'masculino' ? 'primary.light' : 'secondary.light' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">{pub.nome}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={pub.privilegioServico || 'Nenhum'}
                      variant="outlined"
                    />
                  </TableCell>
                  {tiposAtuais.map((tipo) => {
                    const qual = pub.qualificacoes[tipo.tipo]
                    return (
                      <TableCell key={tipo.tipo} align="center">
                        {qual ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip 
                              title={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    Nível: {NIVEL_LABELS[qual.nivel]}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Status: {STATUS_LABELS[qual.status]}
                                  </Typography>
                                  {qual.totalDesignacoes && (
                                    <Typography variant="caption" display="block">
                                      Designações: {qual.totalDesignacoes}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            >
                              <Chip
                                size="small"
                                label={NIVEL_LABELS[qual.nivel]}
                                color={NIVEL_COLORS[qual.nivel]}
                                variant={qual.status === 'ativo' ? 'filled' : 'outlined'}
                                onClick={() => handleOpenDialog(pub, tipo.tipo)}
                              />
                            </Tooltip>
                            {qual.status !== 'ativo' && (
                              <Typography variant="caption" color="text.secondary">
                                {STATUS_LABELS[qual.status]}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(pub, tipo.tipo)}
                            sx={{ opacity: 0.3, '&:hover': { opacity: 1 } }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para adicionar/editar qualificação */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPublicador?.qualificacoes[selectedTipo] ? 'Editar' : 'Adicionar'} Qualificação
        </DialogTitle>
        <DialogContent>
          {selectedPublicador && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedPublicador.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {getTipoNome(selectedTipo)}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Nível</InputLabel>
                    <Select
                      value={nivel}
                      label="Nível"
                      onChange={(e) => setNivel(e.target.value)}
                    >
                      <MenuItem value="aprendiz">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SchoolIcon fontSize="small" color="warning" />
                          Aprendiz
                        </Box>
                      </MenuItem>
                      <MenuItem value="qualificado">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon fontSize="small" color="success" />
                          Qualificado
                        </Box>
                      </MenuItem>
                      <MenuItem value="experiente">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUpIcon fontSize="small" color="primary" />
                          Experiente
                        </Box>
                      </MenuItem>
                      <MenuItem value="especialista">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarIcon fontSize="small" color="secondary" />
                          Especialista
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={status}
                      label="Status"
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <MenuItem value="ativo">Ativo</MenuItem>
                      <MenuItem value="em_treinamento">Em Treinamento</MenuItem>
                      <MenuItem value="inativo">Inativo</MenuItem>
                      <MenuItem value="restrito">Restrito</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    multiline
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Notas sobre a qualificação..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedPublicador?.qualificacoes[selectedTipo] && (
            <Button 
              color="error" 
              onClick={() => {
                handleRemove(selectedPublicador.id, selectedTipo)
                handleCloseDialog()
              }}
            >
              Remover
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
