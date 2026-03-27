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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  MenuBook as StudyIcon,
  PlayCircle as VideoIcon,
  Book as PublicationIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import api from '../api'
import type { Publicador, RelatorioCampo } from '../types'

export default function RelatoriosCampo() {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  
  const [relatorios, setRelatorios] = useState<RelatorioCampo[]>([])
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [filterMes, setFilterMes] = useState('')
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRelatorio, setEditingRelatorio] = useState<RelatorioCampo | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    publicadorId: '',
    mes: '',
    horas: 0,
    revisitas: 0,
    estudos: 0,
    videos: 0,
    publicacoes: 0,
    observacoes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [relRes, pubRes] = await Promise.all([
        api.get('/relatorios').catch(() => ({ data: { relatorios: [] } })),
        api.get('/publicadores'),
      ])
      setRelatorios(relRes.data.relatorios || [])
      setPublicadores(pubRes.data.publicadores || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  // Gerar meses para o filtro
  const generateMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
      months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
    }
    return months
  }

  const meses = generateMonths()

  const filteredRelatorios = relatorios.filter(r => {
    const matchSearch = r.publicadorNome.toLowerCase().includes(search.toLowerCase())
    const matchMes = !filterMes || r.mes === filterMes
    return matchSearch && matchMes
  })

  const handleOpenDialog = (relatorio?: RelatorioCampo) => {
    if (relatorio) {
      setEditingRelatorio(relatorio)
      setFormData({
        publicadorId: relatorio.publicadorId,
        mes: relatorio.mes,
        horas: relatorio.horas,
        revisitas: relatorio.revisitas,
        estudos: relatorio.estudos,
        videos: relatorio.videos,
        publicacoes: relatorio.publicacoes,
        observacoes: relatorio.observacoes || '',
      })
    } else {
      setEditingRelatorio(null)
      const currentMonth = new Date()
      setFormData({
        publicadorId: '',
        mes: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`,
        horas: 0,
        revisitas: 0,
        estudos: 0,
        videos: 0,
        publicacoes: 0,
        observacoes: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRelatorio(null)
  }

  const handleSave = async () => {
    if (!formData.publicadorId || !formData.mes) {
      setError('Publicador e mês são obrigatórios')
      return
    }

    try {
      setSaving(true)
      const pub = publicadores.find(p => p.id === formData.publicadorId)
      const data = {
        ...formData,
        publicadorNome: pub?.nomeCompleto || pub?.nome,
      }

      if (editingRelatorio) {
        await api.put(`/relatorios/${editingRelatorio.id}`, data)
      } else {
        await api.post('/relatorios', data)
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
    if (!confirm('Tem certeza que deseja excluir este relatório?')) return
    
    try {
      await api.delete(`/relatorios/${id}`)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir')
    }
  }

  const formatMes = (mes: string) => {
    const [year, month] = mes.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  }

  // Calcular totais
  const totais = filteredRelatorios.reduce((acc, r) => ({
    horas: acc.horas + r.horas,
    revisitas: acc.revisitas + r.revisitas,
    estudos: acc.estudos + r.estudos,
    videos: acc.videos + r.videos,
    publicacoes: acc.publicacoes + r.publicacoes,
  }), { horas: 0, revisitas: 0, estudos: 0, videos: 0, publicacoes: 0 })

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

      {/* Cards de Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TimeIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{totais.horas}</Typography>
              <Typography variant="body2">Horas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PeopleIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{totais.revisitas}</Typography>
              <Typography variant="body2">Revisitas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <StudyIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{totais.estudos}</Typography>
              <Typography variant="body2">Estudos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <VideoIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{totais.videos}</Typography>
              <Typography variant="body2">Vídeos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PublicationIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{totais.publicacoes}</Typography>
              <Typography variant="body2">Publicações</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ bgcolor: 'grey.700', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{filteredRelatorios.length}</Typography>
              <Typography variant="body2">Relatórios</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Mês"
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
              >
                <MenuItem value="">Todos os meses</MenuItem>
                {meses.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                fullWidth
              >
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Tabela */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Publicador</TableCell>
                <TableCell>Mês</TableCell>
                <TableCell align="center">Horas</TableCell>
                <TableCell align="center">Revisitas</TableCell>
                <TableCell align="center">Estudos</TableCell>
                <TableCell align="center">Vídeos</TableCell>
                <TableCell align="center">Publicações</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRelatorios
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((rel) => (
                  <TableRow key={rel.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {rel.publicadorNome.charAt(0)}
                        </Avatar>
                        {rel.publicadorNome}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={formatMes(rel.mes)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold" color="primary">{rel.horas}</Typography>
                    </TableCell>
                    <TableCell align="center">{rel.revisitas}</TableCell>
                    <TableCell align="center">{rel.estudos}</TableCell>
                    <TableCell align="center">{rel.videos}</TableCell>
                    <TableCell align="center">{rel.publicacoes}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenDialog(rel)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => handleDelete(rel.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredRelatorios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Nenhum relatório encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredRelatorios.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

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
            {editingRelatorio ? 'Editar Relatório' : 'Novo Relatório de Campo'}
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
              <FormControl fullWidth>
                <InputLabel>Mês *</InputLabel>
                <Select
                  value={formData.mes}
                  label="Mês *"
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                >
                  {meses.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1 }}>
                Atividade do Mês
              </Typography>
            </Grid>

            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Horas"
                type="number"
                value={formData.horas}
                onChange={(e) => setFormData({ ...formData, horas: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Revisitas"
                type="number"
                value={formData.revisitas}
                onChange={(e) => setFormData({ ...formData, revisitas: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Estudos Bíblicos"
                type="number"
                value={formData.estudos}
                onChange={(e) => setFormData({ ...formData, estudos: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <TextField
                fullWidth
                label="Vídeos Mostrados"
                type="number"
                value={formData.videos}
                onChange={(e) => setFormData({ ...formData, videos: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6} md={6}>
              <TextField
                fullWidth
                label="Publicações"
                type="number"
                value={formData.publicacoes}
                onChange={(e) => setFormData({ ...formData, publicacoes: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>

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
