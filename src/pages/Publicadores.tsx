import { useState, useEffect } from 'react'
import {
  Box,
  Card,
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
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Grid,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  FamilyRestroom as FamilyIcon,
} from '@mui/icons-material'
import api from '../api'
import PublicadorForm from '../components/PublicadorForm'

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
  familiaId?: string
  familiaNome?: string
  contatoFamilia?: boolean
  restricoes?: any[]
  observacoes?: string
  ungido?: boolean
  relataFilial?: boolean
}

interface Familia {
  id: string
  nome: string
  membros: string[]
}

export default function Publicadores() {
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [familias, setFamilias] = useState<Familia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterGenero, setFilterGenero] = useState('todos')
  const [filterGrupo, setFilterGrupo] = useState('todos')
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPublicador, setEditingPublicador] = useState<Publicador | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pubRes, famRes] = await Promise.all([
        api.get('/publicadores'),
        api.get('/familias').catch(() => ({ data: { familias: [] } }))
      ])
      setPublicadores(pubRes.data.publicadores || [])
      setFamilias(famRes.data.familias || [])
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
    const matchGrupo = filterGrupo === 'todos' || p.grupoCampo === filterGrupo
    return matchSearch && matchStatus && matchGenero && matchGrupo
  })

  const grupos = [...new Set(publicadores.map(p => p.grupoCampo).filter(Boolean))].sort()

  const handleOpenDialog = (publicador?: Publicador) => {
    setEditingPublicador(publicador || null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingPublicador(null)
  }

  const handleSave = () => {
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este publicador?')) return
    
    try {
      await api.delete(`/publicadores/${id}`)
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
      'publicador_nao_batizado': 'Pub. Não Batizado',
      'publicador_batizado': 'Publicador',
      'pioneiro_auxiliar': 'P. Auxiliar',
      'pioneiro_auxiliar_continuo': 'P. Aux. Contínuo',
      'pioneiro_regular': 'Pioneiro Regular',
      'pioneiro_especial': 'P. Especial',
      'missionario': 'Missionário',
      'visitante': 'Visitante'
    }
    return labels[tipo] || tipo
  }

  const getPrivilegioLabel = (priv: string) => {
    const labels: Record<string, string> = {
      'nenhum': '',
      'ungido': 'Ungido',
      'anciao': 'Ancião',
      'servo_ministerial': 'SM'
    }
    return labels[priv] || ''
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
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
                <MenuItem value="mudou">Mudou</MenuItem>
                <MenuItem value="faleceu">Faleceu</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                select
                label="Gênero"
                value={filterGenero}
                onChange={(e) => setFilterGenero(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="masculino">Masculino</MenuItem>
                <MenuItem value="feminino">Feminino</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Grupo"
                value={filterGrupo}
                onChange={(e) => setFilterGrupo(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                {grupos.map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredPublicadores.length} publicadores
              </Typography>
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
                <TableCell>Nome</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Tipo / Privilégio</TableCell>
                <TableCell>Grupo</TableCell>
                <TableCell>Família</TableCell>
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
                        <Avatar sx={{ 
                          width: 36, 
                          height: 36,
                          bgcolor: pub.genero === 'masculino' ? 'primary.light' : 'secondary.light'
                        }}>
                          {pub.genero === 'masculino' ? <MaleIcon /> : <FemaleIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {pub.nomeCompleto}
                          </Typography>
                          {pub.contatoFamilia && (
                            <Chip label="Contato Família" size="small" color="info" sx={{ height: 16, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{pub.telemovel || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">{pub.email || ''}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTipoPublicadorLabel(pub.tipoPublicador)}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5 }}
                      />
                      {getPrivilegioLabel(pub.privilegioServico) && (
                        <Chip
                          label={getPrivilegioLabel(pub.privilegioServico)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{pub.grupoCampo || '-'}</Typography>
                      {pub.grupoLimpeza && (
                        <Chip label={`Limpeza ${pub.grupoLimpeza}`} size="small" sx={{ height: 16, fontSize: '0.65rem', mt: 0.5 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {pub.familiaNome && (
                        <Chip
                          icon={<FamilyIcon />}
                          label={pub.familiaNome}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
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

      {/* Dialog do Formulário */}
      <PublicadorForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        publicador={editingPublicador}
        familias={familias}
        publicadores={publicadores}
      />
    </Box>
  )
}
