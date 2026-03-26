import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Publish as PublishIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material'
import axios from 'axios'

interface Semana {
  id: string
  dataInicio: string
  dataFim: string
  observacoes?: string
  status: 'rascunho' | 'publicado'
}

export default function Semanas() {
  const [semanas, setSemanas] = useState<Semana[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSemana, setEditingSemana] = useState<Semana | null>(null)
  const [formData, setFormData] = useState({
    dataInicio: '',
    observacoes: ''
  })
  const [saving, setSaving] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/semanas')
      setSemanas(res.data.semanas || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleOpenDialog = (semana?: Semana) => {
    if (semana) {
      setEditingSemana(semana)
      setFormData({
        dataInicio: semana.dataInicio ? semana.dataInicio.split('T')[0] : '',
        observacoes: semana.observacoes || ''
      })
    } else {
      setEditingSemana(null)
      setFormData({
        dataInicio: '',
        observacoes: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSemana(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      if (editingSemana) {
        await axios.put(`/api/semanas/${editingSemana.id}`, {
          observacoes: formData.observacoes
        })
      } else {
        await axios.post('/api/semanas', formData)
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
    if (!confirm('Tem certeza que deseja excluir esta semana e todas as suas designações?')) return
    
    try {
      await axios.delete(`/api/semanas/${id}`)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir')
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await axios.put(`/api/semanas/${id}`, { status: 'publicado' })
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao publicar')
    }
    handleMenuClose()
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedId(id)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedId(null)
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Semanas de Designação</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nova Semana
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data Início</TableCell>
                <TableCell>Data Fim</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {semanas.map((sem) => (
                <TableRow key={sem.id} hover>
                  <TableCell>{formatDate(sem.dataInicio)}</TableCell>
                  <TableCell>{formatDate(sem.dataFim)}</TableCell>
                  <TableCell>{sem.observacoes || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={sem.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                      color={sem.status === 'publicado' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuOpen(e, sem.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {semanas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      Nenhuma semana cadastrada
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          const sem = semanas.find(s => s.id === selectedId)
          if (sem) handleOpenDialog(sem)
          handleMenuClose()
        }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        {selectedId && semanas.find(s => s.id === selectedId)?.status === 'rascunho' && (
          <MenuItem onClick={() => handlePublish(selectedId!)}>
            <ListItemIcon><PublishIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Publicar</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          if (selectedId) handleDelete(selectedId)
          handleMenuClose()
        }}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSemana ? 'Editar Semana' : 'Nova Semana'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Data de Início"
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              disabled={!!editingSemana}
            />
            {editingSemana && (
              <Typography variant="body2" color="text.secondary">
                A data de fim será automaticamente calculada (data início + 6 dias)
              </Typography>
            )}
            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || (!editingSemana && !formData.dataInicio)}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
