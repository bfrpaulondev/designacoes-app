import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Button,
  Chip,
  Avatar,
  TextField,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  Snackbar,
  Autocomplete,
  Badge,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  Repeat as RepeatIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Block as BlockIcon,
} from '@mui/icons-material'
import api from '../api'
import type { Publicador, Ausencia, TipoAusencia, DiaSemana, TipoDesignacaoAusencia } from '../types'
import { DIAS_SEMANA, TIPOS_DESIGNACAO_AUSENCIA, PRIVILEGIOS } from '../types'

// Utilitários
const formatDate = (date: Date): string => date.toISOString().split('T')[0]

const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Ausencias() {
  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [ausencias, setAusencias] = useState<Ausencia[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAusencia, setEditingAusencia] = useState<Ausencia | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Filtros
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoAusencia | 'todas'>('todas')
  const [filtroGenero, setFiltroGenero] = useState<string>('todos')
  const [filtroPrivilegio, setFiltroPrivilegio] = useState<string>('todos')
  const [showFilters, setShowFilters] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    publicadorId: string
    publicadorNome: string
    tipo: TipoAusencia
    dataInicio: string
    dataFim: string
    diasEspecificos: string[]
    diasSemana: DiaSemana[]
    recorrenciaInicio: string
    recorrenciaFim: string
    tiposDesignacao: TipoDesignacaoAusencia[]
    notas: string
  }>({
    publicadorId: '',
    publicadorNome: '',
    tipo: 'periodo',
    dataInicio: '',
    dataFim: '',
    diasEspecificos: [],
    diasSemana: [],
    recorrenciaInicio: '',
    recorrenciaFim: '',
    tiposDesignacao: ['todas'],
    notas: '',
  })

  // Calendário visual
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [selectedCalendarDates, setSelectedCalendarDates] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pubRes, ausRes] = await Promise.all([
        api.get('/publicadores').catch(() => ({ data: { publicadores: [] } })),
        api.get('/ausencias').catch(() => ({ data: { ausencias: [] } }))
      ])
      setPublicadores(pubRes.data.publicadores || [])
      setAusencias(ausRes.data.ausencias || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setSnackbar({ message: 'Erro ao carregar dados', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar ausências
  const ausenciasFiltradas = useMemo(() => {
    return ausencias.filter(a => {
      // Filtro por nome
      if (filtroNome && !a.publicadorNome.toLowerCase().includes(filtroNome.toLowerCase())) {
        return false
      }
      // Filtro por tipo
      if (filtroTipo !== 'todas' && a.tipo !== filtroTipo) {
        return false
      }
      // Filtro por gênero
      if (filtroGenero !== 'todos') {
        const pub = publicadores.find(p => p.id === a.publicadorId)
        if (pub && pub.genero !== filtroGenero) return false
      }
      // Filtro por privilégio
      if (filtroPrivilegio !== 'todos') {
        const pub = publicadores.find(p => p.id === a.publicadorId)
        if (pub && pub.privilegioServico !== filtroPrivilegio) return false
      }
      return true
    })
  }, [ausencias, filtroNome, filtroTipo, filtroGenero, filtroPrivilegio, publicadores])

  // Abrir diálogo para nova ausência
  const handleNew = () => {
    setEditingAusencia(null)
    setFormData({
      publicadorId: '',
      publicadorNome: '',
      tipo: 'periodo',
      dataInicio: formatDate(new Date()),
      dataFim: '',
      diasEspecificos: [],
      diasSemana: [],
      recorrenciaInicio: formatDate(new Date()),
      recorrenciaFim: '',
      tiposDesignacao: ['todas'],
      notas: '',
    })
    setSelectedCalendarDates([])
    setDialogOpen(true)
  }

  // Abrir diálogo para editar
  const handleEdit = (ausencia: Ausencia) => {
    setEditingAusencia(ausencia)
    setFormData({
      publicadorId: ausencia.publicadorId,
      publicadorNome: ausencia.publicadorNome,
      tipo: ausencia.tipo,
      dataInicio: ausencia.dataInicio || '',
      dataFim: ausencia.dataFim || '',
      diasEspecificos: ausencia.diasEspecificos || [],
      diasSemana: ausencia.diasSemana || [],
      recorrenciaInicio: ausencia.recorrenciaInicio || '',
      recorrenciaFim: ausencia.recorrenciaFim || '',
      tiposDesignacao: ausencia.tiposDesignacao,
      notas: ausencia.notas || '',
    })
    setSelectedCalendarDates(ausencia.diasEspecificos || [])
    setDialogOpen(true)
  }

  // Salvar ausência
  const handleSave = async () => {
    if (!formData.publicadorId) {
      setSnackbar({ message: 'Selecione um publicador', type: 'error' })
      return
    }

    // Validar baseado no tipo
    if (formData.tipo === 'periodo' && (!formData.dataInicio || !formData.dataFim)) {
      setSnackbar({ message: 'Preencha a data de início e fim', type: 'error' })
      return
    }
    if (formData.tipo === 'dias_especificos' && formData.diasEspecificos.length === 0) {
      setSnackbar({ message: 'Selecione pelo menos um dia', type: 'error' })
      return
    }
    if (formData.tipo === 'recorrente' && formData.diasSemana.length === 0) {
      setSnackbar({ message: 'Selecione pelo menos um dia da semana', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const now = new Date().toISOString()
      const newAusencia: Ausencia = {
        id: editingAusencia?.id || '',
        publicadorId: formData.publicadorId,
        publicadorNome: formData.publicadorNome,
        tipo: formData.tipo,
        dataInicio: formData.tipo === 'periodo' ? formData.dataInicio : undefined,
        dataFim: formData.tipo === 'periodo' ? formData.dataFim : undefined,
        diasEspecificos: formData.tipo === 'dias_especificos' ? formData.diasEspecificos : undefined,
        diasSemana: formData.tipo === 'recorrente' ? formData.diasSemana : undefined,
        recorrenciaInicio: formData.tipo === 'recorrente' ? formData.recorrenciaInicio : undefined,
        recorrenciaFim: formData.tipo === 'recorrente' ? formData.recorrenciaFim : undefined,
        tiposDesignacao: formData.tiposDesignacao,
        notas: formData.notas || undefined,
        criadoEm: editingAusencia?.criadoEm || now,
        atualizadoEm: now,
      }

      if (editingAusencia) {
        const response = await api.put(`/ausencias/${editingAusencia.id}`, newAusencia)
        const updatedAusencia = response.data.ausencia || response.data
        setAusencias(prev => prev.map(a => a.id === editingAusencia.id ? updatedAusencia : a))
        setSnackbar({ message: 'Ausência atualizada com sucesso', type: 'success' })
      } else {
        const response = await api.post('/ausencias', newAusencia)
        const savedAusencia = response.data.ausencia || response.data
        setAusencias(prev => [...prev, savedAusencia])
        setSnackbar({ message: 'Ausência criada com sucesso', type: 'success' })
      }

      setDialogOpen(false)
    } catch (err: any) {
      console.error('Erro ao salvar:', err)
      setSnackbar({ message: err.response?.data?.error || 'Erro ao salvar ausência', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Excluir ausência
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/ausencias/${id}`)
      setAusencias(prev => prev.filter(a => a.id !== id))
      setDeleteConfirm(null)
      setSnackbar({ message: 'Ausência removida com sucesso', type: 'success' })
    } catch (err: any) {
      console.error('Erro ao excluir:', err)
      setSnackbar({ message: 'Erro ao excluir ausência', type: 'error' })
    }
  }

  // Toggle dia no calendário
  const toggleCalendarDate = (dateStr: string) => {
    setSelectedCalendarDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr)
      }
      return [...prev, dateStr].sort()
    })
  }

  // Atualizar dias específicos do formulário
  useEffect(() => {
    if (formData.tipo === 'dias_especificos') {
      setFormData(prev => ({ ...prev, diasEspecificos: selectedCalendarDates }))
    }
  }, [selectedCalendarDates, formData.tipo])

  // Selecionar publicador
  const handleSelectPublicador = (publicadorId: string) => {
    const pub = publicadores.find(p => p.id === publicadorId)
    if (pub) {
      setFormData(prev => ({
        ...prev,
        publicadorId: pub.id,
        publicadorNome: pub.nomeCompleto || pub.nome,
      }))
    }
  }

  // Exportar para Excel (simulado)
  const handleExport = () => {
    setSnackbar({ message: 'Funcionalidade de exportação em desenvolvimento', type: 'error' })
  }

  // Calcular dias de ausência
  const calcularDiasAusencia = (ausencia: Ausencia): number => {
    if (ausencia.tipo === 'periodo' && ausencia.dataInicio && ausencia.dataFim) {
      const start = new Date(ausencia.dataInicio)
      const end = new Date(ausencia.dataFim)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }
    if (ausencia.tipo === 'dias_especificos' && ausencia.diasEspecificos) {
      return ausencia.diasEspecificos.length
    }
    if (ausencia.tipo === 'recorrente' && ausencia.diasSemana) {
      return ausencia.diasSemana.length // dias por semana
    }
    return 0
  }

  // Obter label do tipo
  const getTipoLabel = (tipo: TipoAusencia): string => {
    const labels = {
      periodo: 'Período',
      dias_especificos: 'Dias Específicos',
      recorrente: 'Recorrente',
    }
    return labels[tipo]
  }

  // Obter ícone do tipo
  const getTipoIcon = (tipo: TipoAusencia) => {
    switch (tipo) {
      case 'periodo': return <CalendarIcon />
      case 'dias_especificos': return <EventIcon />
      case 'recorrente': return <RepeatIcon />
    }
  }

  // Renderizar resumo de datas
  const renderResumoDatas = (ausencia: Ausencia): string => {
    switch (ausencia.tipo) {
      case 'periodo':
        return `${formatDateDisplay(ausencia.dataInicio!)} - ${formatDateDisplay(ausencia.dataFim!)}`
      case 'dias_especificos':
        if (!ausencia.diasEspecificos?.length) return 'Nenhum dia selecionado'
        if (ausencia.diasEspecificos.length === 1) return formatDateDisplay(ausencia.diasEspecificos[0])
        return `${ausencia.diasEspecificos.length} dias selecionados`
      case 'recorrente':
        const dias = ausencia.diasSemana?.map(d => DIAS_SEMANA.find(ds => ds.value === d)?.abrev).join(', ')
        return `Toda(o) ${dias}`
      default:
        return ''
    }
  }

  // Gerar calendário do mês
  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = []

    // Dias do mês anterior
    const startPadding = firstDay.getDay()
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, dateStr: formatDate(date), isCurrentMonth: false })
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({ date, dateStr: formatDate(date), isCurrentMonth: true })
    }

    // Dias do próximo mês
    const endPadding = 42 - days.length
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, dateStr: formatDate(date), isCurrentMonth: false })
    }

    return days
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Ausências
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerir períodos em que publicadores não estão disponíveis para designações
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Filtros">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <Badge color="primary" variant="dot" invisible={filtroTipo === 'todas' && !filtroNome}>
                <FilterIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar Excel">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
            Nova Ausência
          </Button>
        </Box>
      </Box>

      {/* Alerta informativo */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Novo!</strong> Agora pode selecionar dias específicos ou criar ausências recorrentes.
          Os publicadores marcados como ausentes não aparecerão nas sugestões de designação.
        </Typography>
      </Alert>

      {/* Filtros */}
      {showFilters && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  label="Pesquisar por nome"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtroTipo}
                    label="Tipo"
                    onChange={(e) => setFiltroTipo(e.target.value as TipoAusencia | 'todas')}
                  >
                    <MenuItem value="todas">Todos</MenuItem>
                    <MenuItem value="periodo">Período</MenuItem>
                    <MenuItem value="dias_especificos">Dias Específicos</MenuItem>
                    <MenuItem value="recorrente">Recorrente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Gênero</InputLabel>
                  <Select
                    value={filtroGenero}
                    label="Gênero"
                    onChange={(e) => setFiltroGenero(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="feminino">Feminino</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Privilégio</InputLabel>
                  <Select
                    value={filtroPrivilegio}
                    label="Privilégio"
                    onChange={(e) => setFiltroPrivilegio(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {PRIVILEGIOS.map(p => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button 
                  size="small" 
                  onClick={() => {
                    setFiltroNome('')
                    setFiltroTipo('todas')
                    setFiltroGenero('todos')
                    setFiltroPrivilegio('todos')
                  }}
                >
                  Limpar Filtros
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ausências */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {ausenciasFiltradas.length} ausência(s) encontrada(s)
            </Typography>
          </Box>

          {ausenciasFiltradas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                Nenhuma ausência encontrada
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={handleNew}>
                Adicionar Ausência
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Publicador</b></TableCell>
                    <TableCell><b>Tipo</b></TableCell>
                    <TableCell><b>Período/Dias</b></TableCell>
                    <TableCell><b>Afeta</b></TableCell>
                    <TableCell><b>Dias</b></TableCell>
                    <TableCell><b>Notas</b></TableCell>
                    <TableCell align="right"><b>Ações</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ausenciasFiltradas.map((ausencia) => {
                    const pub = publicadores.find(p => p.id === ausencia.publicadorId)
                    const diasAusencia = calcularDiasAusencia(ausencia)
                    
                    return (
                      <TableRow key={ausencia.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32,
                              bgcolor: pub?.genero === 'masculino' ? 'primary.light' : 'secondary.light',
                              fontSize: '0.875rem'
                            }}>
                              {ausencia.publicadorNome.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {ausencia.publicadorNome}
                              </Typography>
                              {pub && (
                                <Typography variant="caption" color="text.secondary">
                                  {pub.privilegioServico === 'anciao' ? 'Ancião' : 
                                   pub.privilegioServico === 'servo_ministerial' ? 'Servo Ministerial' : 
                                   pub.tipoPublicador}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getTipoIcon(ausencia.tipo) as React.ReactElement}
                            label={getTipoLabel(ausencia.tipo)}
                            size="small"
                            variant="outlined"
                            color={ausencia.tipo === 'dias_especificos' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {renderResumoDatas(ausencia)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                            {ausencia.tiposDesignacao.includes('todas') ? (
                              <Chip label="Todas" size="small" color="error" />
                            ) : (
                              ausencia.tiposDesignacao.slice(0, 2).map(t => (
                                <Chip 
                                  key={t}
                                  label={TIPOS_DESIGNACAO_AUSENCIA.find(td => td.value === t)?.label || t} 
                                  size="small" 
                                  variant="outlined"
                                />
                              ))
                            )}
                            {ausencia.tiposDesignacao.length > 2 && !ausencia.tiposDesignacao.includes('todas') && (
                              <Chip label={`+${ausencia.tiposDesignacao.length - 2}`} size="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {diasAusencia} {diasAusencia === 1 ? 'dia' : 'dias'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 150 }} noWrap>
                            {ausencia.notas || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEdit(ausencia)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setDeleteConfirm(ausencia.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* FAB para adicionar */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={handleNew}
      >
        <AddIcon />
      </Fab>

      {/* Dialog de Nova/Editar Ausência */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BlockIcon color="error" />
            <Box>
              <Typography variant="h6">
                {editingAusencia ? 'Editar Ausência' : 'Nova Ausência'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                O publicador não receberá designações nos períodos indicados
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Seleção de Publicador */}
            <Grid item xs={12}>
              <Autocomplete
                options={publicadores.filter(p => p.status === 'ativo')}
                getOptionLabel={(option) => option.nomeCompleto || option.nome}
                value={publicadores.find(p => p.id === formData.publicadorId) || null}
                onChange={(_, value) => handleSelectPublicador(value?.id || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Publicador"
                    placeholder="Pesquisar por nome..."
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        width: 28, 
                        height: 28,
                        bgcolor: option.genero === 'masculino' ? 'primary.light' : 'secondary.light',
                        fontSize: '0.75rem'
                      }}>
                        {option.nome.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.nomeCompleto || option.nome}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.privilegioServico === 'anciao' ? 'Ancião' : 
                           option.privilegioServico === 'servo_ministerial' ? 'Servo Ministerial' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                )}
              />
            </Grid>

            {/* Tipo de Ausência */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tipo de Ausência
              </Typography>
              <ToggleButtonGroup
                value={formData.tipo}
                exclusive
                onChange={(_, value) => value && setFormData(prev => ({ ...prev, tipo: value }))}
                fullWidth
              >
                <ToggleButton value="periodo">
                  <CalendarIcon sx={{ mr: 1 }} />
                  Período
                </ToggleButton>
                <ToggleButton value="dias_especificos">
                  <EventIcon sx={{ mr: 1 }} />
                  Dias Específicos
                </ToggleButton>
                <ToggleButton value="recorrente">
                  <RepeatIcon sx={{ mr: 1 }} />
                  Recorrente
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Período */}
            {formData.tipo === 'periodo' && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="De"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Até"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Dias Específicos - Calendário */}
            {formData.tipo === 'dias_especificos' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Selecione os dias de ausência
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {/* Navegação do mês */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))}>
                      ◀
                    </IconButton>
                    <Typography fontWeight="medium">
                      {calendarMonth.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() + 1)))}>
                      ▶
                    </IconButton>
                  </Box>
                  
                  {/* Cabeçalho dos dias */}
                  <Grid container spacing={0.5} sx={{ mb: 1 }}>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                      <Grid item xs={12/7} key={dia}>
                        <Typography variant="caption" align="center" sx={{ display: 'block', fontWeight: 'medium' }}>
                          {dia}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Dias do calendário */}
                  <Grid container spacing={0.5}>
                    {generateCalendarDays().map(({ date, dateStr, isCurrentMonth }) => {
                      const isSelected = selectedCalendarDates.includes(dateStr)
                      const isToday = dateStr === formatDate(new Date())
                      
                      return (
                        <Grid item xs={12/7} key={dateStr}>
                          <Paper
                            onClick={() => toggleCalendarDate(dateStr)}
                            sx={{
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              bgcolor: isSelected ? 'primary.main' : isToday ? 'primary.light' : 'transparent',
                              color: isSelected ? 'white' : !isCurrentMonth ? 'text.disabled' : 'text.primary',
                              border: isToday && !isSelected ? 2 : 0,
                              borderColor: 'primary.main',
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                              },
                            }}
                          >
                            <Typography variant="body2">{date.getDate()}</Typography>
                          </Paper>
                        </Grid>
                      )
                    })}
                  </Grid>
                  
                  {/* Resumo */}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCalendarDates.length} dia(s) selecionado(s)
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={() => setSelectedCalendarDates([])}
                      disabled={selectedCalendarDates.length === 0}
                    >
                      Limpar seleção
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Recorrente */}
            {formData.tipo === 'recorrente' && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Dias da semana
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {DIAS_SEMANA.map(dia => (
                        <Chip
                          key={dia.value}
                          label={dia.abrev}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              diasSemana: prev.diasSemana.includes(dia.value)
                                ? prev.diasSemana.filter(d => d !== dia.value)
                                : [...prev.diasSemana, dia.value]
                            }))
                          }}
                          color={formData.diasSemana.includes(dia.value) ? 'primary' : 'default'}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Válido de"
                      type="date"
                      value={formData.recorrenciaInicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, recorrenciaInicio: e.target.value }))}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Válido até"
                      type="date"
                      value={formData.recorrenciaFim}
                      onChange={(e) => setFormData(prev => ({ ...prev, recorrenciaFim: e.target.value }))}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Tipos de Designação Afetados */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Afeta quais tipos de designação?
              </Typography>
              <Grid container spacing={1}>
                {TIPOS_DESIGNACAO_AUSENCIA.map(tipo => (
                  <Grid item xs={6} md={4} key={tipo.value}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.tiposDesignacao.includes(tipo.value)}
                          onChange={(e) => {
                            if (tipo.value === 'todas' && e.target.checked) {
                              setFormData(prev => ({ ...prev, tiposDesignacao: ['todas'] }))
                            } else if (tipo.value === 'todas' && !e.target.checked) {
                              setFormData(prev => ({ ...prev, tiposDesignacao: [] }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                tiposDesignacao: e.target.checked
                                  ? [...prev.tiposDesignacao.filter(t => t !== 'todas'), tipo.value]
                                  : prev.tiposDesignacao.filter(t => t !== tipo.value)
                              }))
                            }
                          }}
                        />
                      }
                      label={tipo.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Notas */}
            <Grid item xs={12}>
              <TextField
                label="Notas"
                value={formData.notas}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                placeholder="Ex: Viagem de trabalho, consulta médica, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving || !formData.publicadorId || 
              (formData.tipo === 'periodo' && (!formData.dataInicio || !formData.dataFim)) ||
              (formData.tipo === 'dias_especificos' && formData.diasEspecificos.length === 0) ||
              (formData.tipo === 'recorrente' && formData.diasSemana.length === 0) ||
              formData.tiposDesignacao.length === 0
            }
          >
            {saving ? 'Salvando...' : editingAusencia ? 'Guardar' : 'Criar Ausência'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta ausência?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button color="error" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.type} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  )
}
