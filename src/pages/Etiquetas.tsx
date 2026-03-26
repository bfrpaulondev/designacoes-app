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
  IconButton,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import api from '../api'

interface Etiqueta {
  id: string
  nome: string
  icone: string
  cor: string
  descricao?: string
  ordem: number
  ativo: boolean
}

const CORES_PREDEFINIDAS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#22C55E',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#EC4899', '#F43F5E', '#6B7280'
]

const ICONES_PREDEFINIDOS = [
  'Tag', 'Key', 'Home', 'Users', 'MapPin', 'Phone', 'Mail',
  'Calendar', 'Clock', 'Star', 'Heart', 'AlertCircle',
  'CheckCircle', 'XCircle', 'Shield', 'Zap', 'Flag', 'Book'
]

export default function Etiquetas() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEtiqueta, setEditingEtiqueta] = useState<Etiqueta | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    icone: 'Tag',
    cor: '#6B7280',
    descricao: '',
    ordem: 0
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/etiquetas')
      setEtiquetas(res.data.etiquetas || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar etiquetas')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (etiqueta?: Etiqueta) => {
    if (etiqueta) {
      setEditingEtiqueta(etiqueta)
      setFormData({
        nome: etiqueta.nome,
        icone: etiqueta.icone,
        cor: etiqueta.cor,
        descricao: etiqueta.descricao || '',
        ordem: etiqueta.ordem
      })
    } else {
      setEditingEtiqueta(null)
      setFormData({
        nome: '',
        icone: 'Tag',
        cor: '#6B7280',
        descricao: '',
        ordem: etiquetas.length + 1
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingEtiqueta(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = {
        ...formData,
        ordem: parseInt(String(formData.ordem)) || 0
      }

      if (editingEtiqueta) {
        await api.put(`/etiquetas/${editingEtiqueta.id}`, data)
      } else {
        await api.post('/etiquetas', data)
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
    if (!confirm('Tem certeza que deseja excluir esta etiqueta?')) return
    
    try {
      await api.delete(`/etiquetas/${id}`)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir')
    }
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
        <Typography variant="h5">Etiquetas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nova Etiqueta
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cor</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Ícone</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Ordem</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {etiquetas.map((et) => (
                <TableRow key={et.id} hover>
                  <TableCell>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: et.cor
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={et.nome}
                      size="small"
                      sx={{ bgcolor: et.cor, color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>{et.icone}</TableCell>
                  <TableCell>{et.descricao || '-'}</TableCell>
                  <TableCell>{et.ordem}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(et)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(et.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {etiquetas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      Nenhuma etiqueta cadastrada
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEtiqueta ? 'Editar Etiqueta' : 'Nova Etiqueta'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Cor</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {CORES_PREDEFINIDAS.map((cor) => (
                  <Box
                    key={cor}
                    onClick={() => setFormData({ ...formData, cor })}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: cor,
                      cursor: 'pointer',
                      border: formData.cor === cor ? '3px solid black' : 'none',
                      '&:hover': { opacity: 0.8 }
                    }}
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                size="small"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                sx={{ mt: 1 }}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Ícone</InputLabel>
              <Select
                value={formData.icone}
                label="Ícone"
                onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
              >
                {ICONES_PREDEFINIDOS.map((icone) => (
                  <MenuItem key={icone} value={icone}>
                    {icone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
            <TextField
              fullWidth
              type="number"
              label="Ordem"
              value={formData.ordem}
              onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !formData.nome}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
