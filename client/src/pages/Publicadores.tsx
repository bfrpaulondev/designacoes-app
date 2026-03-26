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
  Button,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Fab,
  Tooltip,
  Alert,
  CircularProgress,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Map as MapIcon,
  Label as LabelIcon,
  MoreVert as MoreVertIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material'
import axios from 'axios'

interface Publicador {
  id: string
  nome: string
  nomeCompleto: string
  nomePrimeiro: string
  nomeUltimo: string
  email?: string
  telemovel?: string
  genero: 'masculino' | 'feminino'
  tipoPublicador: string
  privilegioServico: string
  grupoCampo?: string
  grupoLimpeza?: string
  cidade?: string
  morada?: string
  latitude?: number
  longitude?: number
  status: string
  etiquetas: string[]
  restricoes: any[]
  observacoes?: string
}

interface Etiqueta {
  id: string
  nome: string
  icone: string
  cor: string
}

export default function Publicadores() {
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterGenero, setFilterGenero] = useState('todos')
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPublicador, setEditingPublicador] = useState<Publicador | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pubRes, etqRes] = await Promise.all([
        axios.get('/api/publicadores'),
        axios.get('/api/etiquetas')
      ])
      setPublicadores(pubRes.data.publicadores || [])
      setEtiquetas(etqRes.data.etiquetas || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const filteredPublicadores = publicadores.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.telemovel?.includes(search)
    const matchStatus = filterStatus === 'todos' || p.status === filterStatus
    const matchGenero = filterGenero === 'todos' || p.genero === filterGenero
    return matchSearch && matchStatus && matchGenero
  })

  const handleOpenDialog = (publicador?: Publicador) => {
    if (publicador) {
      setEditingPublicador(publicador)
      setFormData({
        nomePrimeiro: publicador.nomePrimeiro,
        nomeUltimo: publicador.nomeUltimo,
        email: publicador.email || '',
        telemovel: publicador.telemovel || '',
        genero: publicador.genero,
        tipoPublicador: publicador.tipoPublicador,
        privilegioServico: publicador.privilegioServico,
        grupoCampo: publicador.grupoCampo || '',
        grupoLimpeza: publicador.grupoLimpeza || '',
        morada: publicador.morada || '',
        cidade: publicador.cidade || '',
        latitude: publicador.latitude || '',
        longitude: publicador.longitude || '',
        status: publicador.status,
        etiquetas: publicador.etiquetas || [],
        observacoes: publicador.observacoes || ''
      })
    } else {
      setEditingPublicador(null)
      setFormData({
        nomePrimeiro: '',
        nomeUltimo: '',
        email: '',
        telemovel: '',
        genero: 'masculino',
        tipoPublicador: 'publicador_batizado',
        privilegioServico: 'nenhum',
        grupoCampo: '',
        grupoLimpeza: '',
        morada: '',
        cidade: '',
        latitude: '',
        longitude: '',
        status: 'ativo',
        etiquetas: [],
        observacoes: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingPublicador(null)
    setFormData({})
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      }

      if (editingPublicador) {
        await axios.put(`/api/publicadores/${editingPublicador.id}`, data)
      } else {
        await axios.post('/api/publicadores', data)
      }

      handleCloseDialog()
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este publicador?')) return
    
    try {
      await axios.delete(`/api/publicadores/${id}`)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir')
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedId(id)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedId(null)
  }

  const getTipoPublicadorLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'estudante': 'Estudante',
      'publicador_nao_batizado': 'Publicador Não Batizado',
      'publicador_batizado': 'Publicador Batizado',
      'pioneiro_auxiliar': 'Pioneiro Auxiliar',
      'pioneiro_regular': 'Pioneiro Regular'
    }
    return labels[tipo] || tipo
  }

  const getPrivilegioLabel = (priv: string) => {
    const labels: Record<string, string> = {
      'nenhum': 'Nenhum',
      'ungido': 'Ungido',
      'anciao': 'Ancião',
      'servo_ministerial': 'Servo Ministerial',
      'superintendente_viajante': 'Superintendente Viajante'
    }
    return labels[priv] || priv
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
      'ativo': 'success',
      'inativo': 'warning',
      'mudou': 'error',
      'faleceu': 'error',
      'restrito': 'warning'
    }
    return colors[status] || 'default'
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

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Buscar por nome, email ou telefone..."
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
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                  <MenuItem value="mudou">Mudou</MenuItem>
                  <MenuItem value="faleceu">Faleceu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Gênero</InputLabel>
                <Select
                  value={filterGenero}
                  label="Gênero"
                  onChange={(e) => setFilterGenero(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="feminino">Feminino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredPublicadores.length} publicadores encontrados
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Grupo Campo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPublicadores
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pub) => (
                  <TableRow key={pub.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {pub.genero === 'masculino' ? <MaleIcon /> : <FemaleIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {pub.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getPrivilegioLabel(pub.privilegioServico)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{pub.email || '-'}</TableCell>
                    <TableCell>{pub.telemovel || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getTipoPublicadorLabel(pub.tipoPublicador)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{pub.grupoCampo || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={pub.status}
                        size="small"
                        color={getStatusColor(pub.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, pub.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredPublicadores.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Menu de ações */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          const pub = publicadores.find(p => p.id === selectedId)
          if (pub) handleOpenDialog(pub)
          handleMenuClose()
        }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedId) handleDelete(selectedId)
          handleMenuClose()
        }}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      {/* FAB para adicionar */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Dialog de edição/criação */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPublicador ? 'Editar Publicador' : 'Novo Publicador'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Primeiro Nome"
                value={formData.nomePrimeiro || ''}
                onChange={(e) => setFormData({ ...formData, nomePrimeiro: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Último Nome"
                value={formData.nomeUltimo || ''}
                onChange={(e) => setFormData({ ...formData, nomeUltimo: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Telemóvel"
                value={formData.telemovel || ''}
                onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Gênero</InputLabel>
                <Select
                  value={formData.genero || 'masculino'}
                  label="Gênero"
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                >
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="feminino">Feminino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipoPublicador || 'publicador_batizado'}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, tipoPublicador: e.target.value })}
                >
                  <MenuItem value="estudante">Estudante</MenuItem>
                  <MenuItem value="publicador_nao_batizado">Publicador Não Batizado</MenuItem>
                  <MenuItem value="publicador_batizado">Publicador Batizado</MenuItem>
                  <MenuItem value="pioneiro_auxiliar">Pioneiro Auxiliar</MenuItem>
                  <MenuItem value="pioneiro_regular">Pioneiro Regular</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Privilégio</InputLabel>
                <Select
                  value={formData.privilegioServico || 'nenhum'}
                  label="Privilégio"
                  onChange={(e) => setFormData({ ...formData, privilegioServico: e.target.value })}
                >
                  <MenuItem value="nenhum">Nenhum</MenuItem>
                  <MenuItem value="ungido">Ungido</MenuItem>
                  <MenuItem value="anciao">Ancião</MenuItem>
                  <MenuItem value="servo_ministerial">Servo Ministerial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Morada"
                value={formData.morada || ''}
                onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.cidade || ''}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Grupo Campo"
                value={formData.grupoCampo || ''}
                onChange={(e) => setFormData({ ...formData, grupoCampo: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Grupo Limpeza"
                value={formData.grupoLimpeza || ''}
                onChange={(e) => setFormData({ ...formData, grupoLimpeza: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'ativo'}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                  <MenuItem value="mudou">Mudou</MenuItem>
                  <MenuItem value="faleceu">Faleceu</MenuItem>
                  <MenuItem value="restrito">Restrito</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Etiquetas</InputLabel>
                <Select
                  multiple
                  value={formData.etiquetas || []}
                  label="Etiquetas"
                  onChange={(e) => setFormData({ ...formData, etiquetas: e.target.value })}
                >
                  {etiquetas.map((et) => (
                    <MenuItem key={et.id} value={et.id}>
                      <Chip
                        size="small"
                        label={et.nome}
                        sx={{ bgcolor: et.cor, color: 'white', mr: 1 }}
                      />
                      {et.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
