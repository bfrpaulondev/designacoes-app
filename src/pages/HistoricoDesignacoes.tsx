import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Fab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Event as EventIcon,
} from '@mui/icons-material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab'
import api from '../api'
import type { Publicador, Designacao } from '../types'

const TIPOS_DESIGNACAO_LOCAL = [
  { value: 'leitor', label: 'Leitor', icon: '📖', color: 'primary' },
  { value: 'oracao', label: 'Oração', icon: '🙏', color: 'secondary' },
  { value: 'presidente', label: 'Presidente', icon: '🎤', color: 'success' },
  { value: 'indicador', label: 'Indicador', icon: '👆', color: 'warning' },
  { value: 'microfone', label: 'Microfone', icon: '🎙️', color: 'info' },
  { value: 'som', label: 'Som', icon: '🔊', color: 'error' },
  { value: 'plataforma', label: 'Plataforma', icon: '🏛️', color: 'primary' },
  { value: 'limpeza', label: 'Limpeza', icon: '🧹', color: 'default' },
]

const STATUS_COLORS: Record<string, 'success' | 'error' | 'warning' | 'default' | 'info'> = {
  'agendado': 'info',
  'realizado': 'success',
  'cancelado': 'error',
  'substituido': 'warning',
}

export default function HistoricoDesignacoes() {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  
  const [designacoes, setDesignacoes] = useState<Designacao[]>([])
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDataInicio, setFilterDataInicio] = useState('')
  const [filterDataFim, setFilterDataFim] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDesignacao, setEditingDesignacao] = useState<Designacao | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    publicadorId: '',
    tipo: 'leitor',
    data: '',
    reuniao: 'meio_semana',
    status: 'agendado',
    observacoes: '',
    substitutoId: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [desRes, pubRes] = await Promise.all([
        api.get('/designacoes').catch(() => ({ data: { designacoes: [] } })),
        api.get('/publicadores'),
      ])
      setDesignacoes(desRes.data.designacoes || [])
      setPublicadores(pubRes.data.publicadores || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const filteredDesignacoes = designacoes.filter(d => {
    const matchSearch = d.publicadorNome.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !filterTipo || d.tipo === filterTipo
    const matchStatus = !filterStatus || d.status === filterStatus
    const matchDataInicio = !filterDataInicio || d.data >= filterDataInicio
    const matchDataFim = !filterDataFim || d.data <= filterDataFim
    return matchSearch && matchTipo && matchStatus && matchDataInicio && matchDataFim
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const handleOpenDialog = (designacao?: Designacao) => {
    if (designacao) {
      setEditingDesignacao(designacao)
      setFormData({
        publicadorId: designacao.publicadorId,
        tipo: designacao.tipo,
        data: designacao.data,
        reuniao: designacao.reuniao,
        status: designacao.status,
        observacoes: designacao.observacoes || '',
        substitutoId: designacao.substitutoId || '',
      })
    } else {
      setEditingDesignacao(null)
      setFormData({
        publicadorId: '',
        tipo: 'leitor',
        data: new Date().toISOString().split('T')[0],
        reuniao: 'meio_semana',
        status: 'agendado',
        observacoes: '',
        substitutoId: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingDesignacao(null)
  }

  const handleSave = async () => {
    if (!formData.publicadorId || !formData.data) {
      setError('Publicador e data são obrigatórios')
      return
    }

    try {
      setSaving(true)
      const pub = publicadores.find(p => p.id === formData.publicadorId)
      const subst = formData.substitutoId ? publicadores.find(p => p.id === formData.substitutoId) : null
      
      const data = {
        ...formData,
        publicadorNome: pub?.nomeCompleto || pub?.nome,
        substitutoNome: subst?.nomeCompleto || subst?.nome,
      }

      if (editingDesignacao) {
        await api.put(`/designacoes/${editingDesignacao.id}`, data)
      } else {
        await api.post('/designacoes', data)
      }

      loadData()
      handleCloseDialog()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta designação?')) return
    
    try {
      await api.delete(`/designacoes/${id}`)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-PT', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getTipoInfo = (tipo: string) => {
    return TIPOS_DESIGNACAO_LOCAL.find(t => t.value === tipo) || TIPOS_DESIGNACAO_LOCAL[0]
  }

  // Agrupar designações por data para a timeline
  const designacoesPorData = filteredDesignacoes.reduce((acc, d) => {
    if (!acc[d.data]) acc[d.data] = []
    acc[d.data].push(d)
    return acc
  }, {} as Record<string, Designacao[]>)

  // Estatísticas
  const stats = {
    total: designacoes.length,
    agendados: designacoes.filter(d => d.status === 'agendado').length,
    realizados: designacoes.filter(d => d.status === 'realizado').length,
    cancelados: designacoes.filter(d => d.status === 'cancelado').length,
    substituidos: designacoes.filter(d => d.status === 'substituido').length,
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="primary">{stats.total}</Typography>
              <Typography variant="body2">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">{stats.agendados}</Typography>
              <Typography variant="body2">Agendados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">{stats.realizados}</Typography>
              <Typography variant="body2">Realizados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.substituidos}</Typography>
              <Typography variant="body2">Substituídos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">{stats.cancelados}</Typography>
              <Typography variant="body2">Cancelados</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                select
                label="Tipo"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {TIPOS_DESIGNACAO_LOCAL.map(t => (
                  <MenuItem key={t.value} value={t.value}>{t.icon} {t.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="agendado">Agendado</MenuItem>
                <MenuItem value="realizado">Realizado</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
                <MenuItem value="substituido">Substituído</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Data Início"
                type="date"
                value={filterDataInicio}
                onChange={(e) => setFilterDataInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Data Fim"
                type="date"
                value={filterDataFim}
                onChange={(e) => setFilterDataFim(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<CalendarIcon />} label="Lista" iconPosition="start" />
          <Tab icon={<HistoryIcon />} label="Timeline" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 0: Lista */}
      {activeTab === 0 && (
        <Card sx={{ mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Publicador</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Reunião</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Substituto</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDesignacoes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((des) => {
                    const tipoInfo = getTipoInfo(des.tipo)
                    return (
                      <TableRow key={des.id} hover>
                        <TableCell>
                          <Typography variant="body2">{formatDate(des.data)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {des.publicadorNome.charAt(0)}
                            </Avatar>
                            {des.publicadorNome}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${tipoInfo.icon} ${tipoInfo.label}`} 
                            size="small" 
                            color={tipoInfo.color as any}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={des.reuniao === 'meio_semana' ? 'Meio de Semana' : 'Fim de Semana'} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={des.status} 
                            size="small" 
                            color={STATUS_COLORS[des.status]}
                          />
                        </TableCell>
                        <TableCell>
                          {des.substitutoNome || '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenDialog(des)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" color="error" onClick={() => handleDelete(des.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                {filteredDesignacoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Nenhuma designação encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredDesignacoes.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Card>
      )}

      {/* Tab 1: Timeline */}
      {activeTab === 1 && (
        <Box sx={{ mt: 2, maxHeight: 600, overflow: 'auto' }}>
          <Timeline position="alternate">
            {Object.entries(designacoesPorData).slice(0, 20).map(([data, desList]) => (
              <TimelineItem key={data}>
                <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
                  {formatDate(data)}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color="primary">
                    <EventIcon />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                      {desList.map((des, i) => {
                        const tipoInfo = getTipoInfo(des.tipo)
                        return (
                          <Box key={des.id}>
                            {i > 0 && <Divider sx={{ my: 1 }} />}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">
                                  {tipoInfo.icon} {tipoInfo.label}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {des.publicadorNome}
                                </Typography>
                              </Box>
                              <Chip 
                                label={des.status} 
                                size="small" 
                                color={STATUS_COLORS[des.status]}
                              />
                            </Box>
                          </Box>
                        )
                      })}
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>
      )}

      {/* FAB para adicionar */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Dialog do Formulário */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}>
          <Typography variant="h6">
            {editingDesignacao ? 'Editar Designação' : 'Nova Designação'}
          </Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Publicador *</InputLabel>
                <Select
                  value={formData.publicadorId}
                  label="Publicador *"
                  onChange={(e) => setFormData({ ...formData, publicadorId: e.target.value })}
                >
                  {publicadores
                    .filter(p => p.status === 'ativo')
                    .sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto))
                    .map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.nomeCompleto}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data *"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Designação</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo de Designação"
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  {TIPOS_DESIGNACAO_LOCAL.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.icon} {t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Reunião</InputLabel>
                <Select
                  value={formData.reuniao}
                  label="Reunião"
                  onChange={(e) => setFormData({ ...formData, reuniao: e.target.value })}
                >
                  <MenuItem value="meio_semana">Meio de Semana</MenuItem>
                  <MenuItem value="fim_semana">Fim de Semana</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="agendado">Agendado</MenuItem>
                  <MenuItem value="realizado">Realizado</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                  <MenuItem value="substituido">Substituído</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.status === 'substituido' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Substituto</InputLabel>
                  <Select
                    value={formData.substitutoId}
                    label="Substituto"
                    onChange={(e) => setFormData({ ...formData, substitutoId: e.target.value })}
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {publicadores
                      .filter(p => p.status === 'ativo' && p.id !== formData.publicadorId)
                      .sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto))
                      .map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.nomeCompleto}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={2}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
