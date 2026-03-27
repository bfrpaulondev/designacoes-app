import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Weekend as WeekendIcon,
  WbSunny as WeekdayIcon,
  Mic as MicIcon,
  CleanHands as CleaningIcon,
  Campaign as PublicWitnessingIcon,
  Block as AbsenceIcon,
  Assignment as DesignationIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  Security as PermissionIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import {
  ConfiguracoesSistema,
  CONFIGURACOES_PADRAO,
  EtiquetaConfig,
} from '../types/configuracoes'
import api from '../api'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ConfiguracoesProgramacao() {
  const [tabValue, setTabValue] = useState(0)
  const [config, setConfig] = useState<ConfiguracoesSistema>(CONFIGURACOES_PADRAO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogField, setDialogField] = useState<string>('')
  const [newEtiqueta, setNewEtiqueta] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const res = await api.get('/config-programacao')
      if (res.data.config) {
        setConfig({ ...CONFIGURACOES_PADRAO, ...res.data.config })
      }
    } catch (err: any) {
      // Se não existe configuração, usar padrão
      setConfig(CONFIGURACOES_PADRAO)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await api.post('/config-programacao', config)
      setSuccess('Configurações salvas com sucesso!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Handler para mudanças em campos simples
  const handleChange = (section: keyof ConfiguracoesSistema, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value
      },
      atualizadoEm: new Date().toISOString()
    }))
  }

  // Handler para adicionar etiqueta
  const handleAddEtiqueta = (section: 'avIndicadores', field: string) => {
    if (!newEtiqueta.trim()) return

    const etiquetas = config[section][field as keyof typeof config['avIndicadores']] as EtiquetaConfig[]
    const newEtiquetaObj: EtiquetaConfig = {
      id: `${field}_${Date.now()}`,
      label: newEtiqueta.trim(),
      ativo: true
    }

    handleChange(section, field, [...etiquetas, newEtiquetaObj])
    setNewEtiqueta('')
    setDialogOpen(false)
  }

  // Handler para remover etiqueta
  const handleRemoveEtiqueta = (section: 'avIndicadores', field: string, id: string) => {
    const etiquetas = config[section][field as keyof typeof config['avIndicadores']] as EtiquetaConfig[]
    handleChange(section, field, etiquetas.filter(e => e.id !== id))
  }

  // Handler para toggle etiqueta
  const handleToggleEtiqueta = (section: 'avIndicadores', field: string, id: string) => {
    const etiquetas = config[section][field as keyof typeof config['avIndicadores']] as EtiquetaConfig[]
    handleChange(section, field, etiquetas.map(e =>
      e.id === id ? { ...e, ativo: !e.ativo } : e
    ))
  }

  // Handler para motivos predefinidos
  const handleAddMotivo = () => {
    if (!newEtiqueta.trim()) return
    const motivos = config.ausencias.motivosPreDefinidos
    handleChange('ausencias', 'motivosPreDefinidos', [...motivos, newEtiqueta.trim()])
    setNewEtiqueta('')
    setDialogOpen(false)
  }

  const handleRemoveMotivo = (motivo: string) => {
    const motivos = config.ausencias.motivosPreDefinidos
    handleChange('ausencias', 'motivosPreDefinidos', motivos.filter(m => m !== motivo))
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Configurações de Programação
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Tudo'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<WeekendIcon />} label="Fim de Semana" />
          <Tab icon={<WeekdayIcon />} label="Meio de Semana" />
          <Tab icon={<MicIcon />} label="A/V e Indicadores" />
          <Tab icon={<CleaningIcon />} label="Limpeza" />
          <Tab icon={<PublicWitnessingIcon />} label="Test. Público" />
          <Tab icon={<AbsenceIcon />} label="Ausências" />
          <Tab icon={<DesignationIcon />} label="Designações" />
          <Tab icon={<NotificationIcon />} label="Notificações" />
          <Tab icon={<ScheduleIcon />} label="Horários" />
          <Tab icon={<PermissionIcon />} label="Permissões" />
        </Tabs>

        {/* Tab 0: Fim de Semana */}
        <TabPanel value={tabValue} index={0}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Hospitalidade</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.fimSemana.ativarHospitalidade}
                        onChange={(e) => handleChange('fimSemana', 'ativarHospitalidade', e.target.checked)}
                      />
                    }
                    label="Ativar sistema de hospitalidade"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.fimSemana.organizarHospitalidadePorGrupo}
                        onChange={(e) => handleChange('fimSemana', 'organizarHospitalidadePorGrupo', e.target.checked)}
                      />
                    }
                    label="Organizar por grupo"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Estudo da Sentinela</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.fimSemana.mostrarLeitorSentinela}
                        onChange={(e) => handleChange('fimSemana', 'mostrarLeitorSentinela', e.target.checked)}
                      />
                    }
                    label="Mostrar leitor da Sentinela"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.fimSemana.mostrarInterprete}
                        onChange={(e) => handleChange('fimSemana', 'mostrarInterprete', e.target.checked)}
                      />
                    }
                    label="Mostrar intérprete"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Congregação</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome da Congregação"
                    value={config.fimSemana.nomeCongregacao}
                    onChange={(e) => handleChange('fimSemana', 'nomeCongregacao', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contato do Coordenador de Discursos"
                    value={config.fimSemana.contatoCoordenadorDiscursos}
                    onChange={(e) => handleChange('fimSemana', 'contatoCoordenadorDiscursos', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Superintendente de Circuito</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome do Superintendente de Circuito"
                    value={config.fimSemana.nomeSuperintendenteCircuito}
                    onChange={(e) => handleChange('fimSemana', 'nomeSuperintendenteCircuito', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Título do Discurso Público"
                    value={config.fimSemana.tituloDiscursoPublicoSC}
                    onChange={(e) => handleChange('fimSemana', 'tituloDiscursoPublicoSC', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Título do Discurso de Serviço"
                    value={config.fimSemana.tituloDiscursoServicoSC}
                    onChange={(e) => handleChange('fimSemana', 'tituloDiscursoServicoSC', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cântico Final na Visita"
                    value={config.fimSemana.canticoFinalVisitaSC}
                    onChange={(e) => handleChange('fimSemana', 'canticoFinalVisitaSC', parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Opções de Impressão</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Formato de Data</InputLabel>
                    <Select
                      value={config.fimSemana.formatoDataImpressao}
                      label="Formato de Data"
                      onChange={(e) => handleChange('fimSemana', 'formatoDataImpressao', e.target.value)}
                    >
                      <MenuItem value="weekof">Semana de...</MenuItem>
                      <MenuItem value="dayof">Dia de...</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.fimSemana.esconderOradoresFora}
                        onChange={(e) => handleChange('fimSemana', 'esconderOradoresFora', e.target.checked)}
                      />
                    }
                    label="Esconder oradores de fora"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.fimSemana.designarOradorOrcadorFinal}
                        onChange={(e) => handleChange('fimSemana', 'designarOradorOrcadorFinal', e.target.checked)}
                      />
                    }
                    label="Designar orador para oração final"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Modelo de E-mail de Lembrete</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={config.fimSemana.modeloEmailLembrete}
                onChange={(e) => handleChange('fimSemana', 'modeloEmailLembrete', e.target.value)}
                helperText="Variáveis disponíveis: {{orador}}, {{discurso}}, {{numeroDiscurso}}, {{data}}, {{hora}}, {{congregacao}}, {{remetente}}"
              />
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 1: Meio de Semana */}
        <TabPanel value={tabValue} index={1}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Discurso de Serviço</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tema do Discurso de Serviço"
                    value={config.meioSemana.temaDiscursoServico}
                    onChange={(e) => handleChange('meioSemana', 'temaDiscursoServico', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Classes Auxiliares</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Número de Classes Auxiliares: {config.meioSemana.numeroClassesAuxiliares}
                  </Typography>
                  <Slider
                    value={config.meioSemana.numeroClassesAuxiliares}
                    onChange={(_, value) => handleChange('meioSemana', 'numeroClassesAuxiliares', value)}
                    min={0}
                    max={5}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Visita do Superintendente de Circuito</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cântico Final na Visita"
                    value={config.meioSemana.canticoFinalVisitaSCMeio}
                    onChange={(e) => handleChange('meioSemana', 'canticoFinalVisitaSCMeio', parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Impressão</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Formato de Data</InputLabel>
                    <Select
                      value={config.meioSemana.formatoDataImpressao}
                      label="Formato de Data"
                      onChange={(e) => handleChange('meioSemana', 'formatoDataImpressao', e.target.value)}
                    >
                      <MenuItem value="weekof">Semana de...</MenuItem>
                      <MenuItem value="dayof">Dia de...</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.meioSemana.gerarFormularioS89}
                        onChange={(e) => handleChange('meioSemana', 'gerarFormularioS89', e.target.checked)}
                      />
                    }
                    label="Gerar formulário S-89"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 2: A/V e Indicadores */}
        <TabPanel value={tabValue} index={2}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Quantidades</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Microfones: {config.avIndicadores.numeroMicrofones}
                  </Typography>
                  <Slider
                    value={config.avIndicadores.numeroMicrofones}
                    onChange={(_, value) => handleChange('avIndicadores', 'numeroMicrofones', value)}
                    min={0}
                    max={10}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Indicadores: {config.avIndicadores.numeroIndicadores}
                  </Typography>
                  <Slider
                    value={config.avIndicadores.numeroIndicadores}
                    onChange={(_, value) => handleChange('avIndicadores', 'numeroIndicadores', value)}
                    min={0}
                    max={10}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Assistentes Zoom: {config.avIndicadores.numeroAssistentesZoom}
                  </Typography>
                  <Slider
                    value={config.avIndicadores.numeroAssistentesZoom}
                    onChange={(_, value) => handleChange('avIndicadores', 'numeroAssistentesZoom', value)}
                    min={0}
                    max={5}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Designações Palco: {config.avIndicadores.numeroDesignacoesPalco}
                  </Typography>
                  <Slider
                    value={config.avIndicadores.numeroDesignacoesPalco}
                    onChange={(_, value) => handleChange('avIndicadores', 'numeroDesignacoesPalco', value)}
                    min={0}
                    max={5}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Designações Som: {config.avIndicadores.numeroDesignacoesSom}
                  </Typography>
                  <Slider
                    value={config.avIndicadores.numeroDesignacoesSom}
                    onChange={(_, value) => handleChange('avIndicadores', 'numeroDesignacoesSom', value)}
                    min={0}
                    max={5}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Designações Vídeo: {config.avIndicadores.numeroDesignacoesVideo}
                  </Typography>
                  <Slider
                    value={config.avIndicadores.numeroDesignacoesVideo}
                    onChange={(_, value) => handleChange('avIndicadores', 'numeroDesignacoesVideo', value)}
                    min={0}
                    max={5}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Etiquetas de Microfones</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {config.avIndicadores.etiquetasMicrofone.map((etiqueta) => (
                  <ListItem key={etiqueta.id}>
                    <ListItemText
                      primary={etiqueta.label}
                      secondary={etiqueta.ativo ? 'Ativo' : 'Inativo'}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={etiqueta.ativo}
                        onChange={() => handleToggleEtiqueta('avIndicadores', 'etiquetasMicrofone', etiqueta.id)}
                      />
                      <IconButton onClick={() => handleRemoveEtiqueta('avIndicadores', 'etiquetasMicrofone', etiqueta.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => { setDialogField('etiquetasMicrofone'); setDialogOpen(true); }}
              >
                Adicionar Microfone
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Etiquetas de Indicadores</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {config.avIndicadores.etiquetasIndicador.map((etiqueta) => (
                  <ListItem key={etiqueta.id}>
                    <ListItemText
                      primary={etiqueta.label}
                      secondary={etiqueta.ativo ? 'Ativo' : 'Inativo'}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={etiqueta.ativo}
                        onChange={() => handleToggleEtiqueta('avIndicadores', 'etiquetasIndicador', etiqueta.id)}
                      />
                      <IconButton onClick={() => handleRemoveEtiqueta('avIndicadores', 'etiquetasIndicador', etiqueta.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => { setDialogField('etiquetasIndicador'); setDialogOpen(true); }}
              >
                Adicionar Indicador
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Geral</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.avIndicadores.programacaoAVSemanal}
                    onChange={(e) => handleChange('avIndicadores', 'programacaoAVSemanal', e.target.checked)}
                  />
                }
                label="Programação A/V semanal"
              />
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 3: Limpeza */}
        <TabPanel value={tabValue} index={3}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Grupos de Limpeza</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Número de Grupos: {config.limpeza.numeroGruposLimpeza}
                  </Typography>
                  <Slider
                    value={config.limpeza.numeroGruposLimpeza}
                    onChange={(_, value) => handleChange('limpeza', 'numeroGruposLimpeza', value)}
                    min={1}
                    max={10}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.limpeza.avisarTodosMembrosGrupo}
                        onChange={(e) => handleChange('limpeza', 'avisarTodosMembrosGrupo', e.target.checked)}
                      />
                    }
                    label="Avisar todos os membros do grupo"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Etiquetas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {config.limpeza.etiquetasLimpeza.map((etiqueta) => (
                  <ListItem key={etiqueta.id}>
                    <ListItemText primary={etiqueta.label} />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => {
                        const novas = config.limpeza.etiquetasLimpeza.filter(e => e.id !== etiqueta.id)
                        handleChange('limpeza', 'etiquetasLimpeza', novas)
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 4: Testemunho Público */}
        <TabPanel value={tabValue} index={4}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Agendamento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.testemunhoPublico.ativarAgendamentoLivre}
                        onChange={(e) => handleChange('testemunhoPublico', 'ativarAgendamentoLivre', e.target.checked)}
                      />
                    }
                    label="Ativar agendamento livre"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.testemunhoPublico.permitirProgramarOutros}
                        onChange={(e) => handleChange('testemunhoPublico', 'permitirProgramarOutros', e.target.checked)}
                      />
                    }
                    label="Permitir programar outros"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.testemunhoPublico.permitirDefinirDisponibilidade}
                        onChange={(e) => handleChange('testemunhoPublico', 'permitirDefinirDisponibilidade', e.target.checked)}
                      />
                    }
                    label="Permitir definir própria disponibilidade"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Auto-Preenchimento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl fullWidth>
                <InputLabel>Comportamento de Auto-Preenchimento</InputLabel>
                <Select
                  value={config.testemunhoPublico.comportamentoAutoPreenchimento}
                  label="Comportamento de Auto-Preenchimento"
                  onChange={(e) => handleChange('testemunhoPublico', 'comportamentoAutoPreenchimento', e.target.value)}
                >
                  <MenuItem value="genero_familia">Por gênero/família</MenuItem>
                  <MenuItem value="todos">Todos disponíveis</MenuItem>
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 5: Ausências (NOVO!) */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" icon={<InfoIcon />}>
              Este módulo de ausências é mais avançado que o Hourglass. Permite dias específicos, não apenas períodos contínuos.
            </Alert>
          </Box>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Notificações de Ausência</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ausencias.notificarCoordenador}
                        onChange={(e) => handleChange('ausencias', 'notificarCoordenador', e.target.checked)}
                      />
                    }
                    label="Notificar coordenador"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ausencias.notificarPublicador}
                        onChange={(e) => handleChange('ausencias', 'notificarPublicador', e.target.checked)}
                      />
                    }
                    label="Notificar publicador"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Dias de antecedência para notificação"
                    value={config.ausencias.diasAntecedenciaNotificacao}
                    onChange={(e) => handleChange('ausencias', 'diasAntecedenciaNotificacao', parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Comportamento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ausencias.permitirAusenciaRecorrente}
                        onChange={(e) => handleChange('ausencias', 'permitirAusenciaRecorrente', e.target.checked)}
                      />
                    }
                    label="Permitir ausência recorrente"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ausencias.requerAprovacao}
                        onChange={(e) => handleChange('ausencias', 'requerAprovacao', e.target.checked)}
                      />
                    }
                    label="Requer aprovação"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Máximo de dias de ausência contínua"
                    value={config.ausencias.maxDiasAusenciaContinua}
                    onChange={(e) => handleChange('ausencias', 'maxDiasAusenciaContinua', parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Integração com Designações</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ausencias.bloquearDesignacoesAutomaticas}
                        onChange={(e) => handleChange('ausencias', 'bloquearDesignacoesAutomaticas', e.target.checked)}
                      />
                    }
                    label="Bloquear designações automáticas para ausentes"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ausencias.mostrarAusentesNaEscala}
                        onChange={(e) => handleChange('ausencias', 'mostrarAusentesNaEscala', e.target.checked)}
                      />
                    }
                    label="Mostrar ausentes na escala"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Tipos de Ausência Permitidos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  { value: 'periodo', label: 'Período (contínuo)' },
                  { value: 'dias_especificos', label: 'Dias Específicos' },
                  { value: 'recorrente', label: 'Recorrente (ex: toda quarta)' },
                ].map((tipo) => (
                  <Grid item xs={12} md={4} key={tipo.value}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.ausencias.tiposAusenciaPermitidos.includes(tipo.value as any)}
                          onChange={(e) => {
                            const tipos = [...config.ausencias.tiposAusenciaPermitidos] as any[]
                            if (e.target.checked) {
                              tipos.push(tipo.value as any)
                            } else {
                              const index = tipos.indexOf(tipo.value as any)
                              if (index > -1) tipos.splice(index, 1)
                            }
                            handleChange('ausencias', 'tiposAusenciaPermitidos', tipos)
                          }}
                        />
                      }
                      label={tipo.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Motivos Pré-definidos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                {config.ausencias.motivosPreDefinidos.map((motivo) => (
                  <Chip
                    key={motivo}
                    label={motivo}
                    onDelete={() => handleRemoveMotivo(motivo)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={() => { setDialogField('motivos'); setDialogOpen(true); }}
              >
                Adicionar Motivo
              </Button>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 6: Designações (NOVO!) */}
        <TabPanel value={tabValue} index={6}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" icon={<InfoIcon />}>
              Sistema inteligente de rotação que o Hourglass não possui. Balanceia designações automaticamente.
            </Alert>
          </Box>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Regras de Rotação</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Período mínimo entre designações: {config.designacoes.periodoMinimoEntreDesignacoes} dias
                  </Typography>
                  <Slider
                    value={config.designacoes.periodoMinimoEntreDesignacoes}
                    onChange={(_, value) => handleChange('designacoes', 'periodoMinimoEntreDesignacoes', value)}
                    min={0}
                    max={60}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Máximo de designações consecutivas: {config.designacoes.maxDesignacoesConsecutivas}
                  </Typography>
                  <Slider
                    value={config.designacoes.maxDesignacoesConsecutivas}
                    onChange={(_, value) => handleChange('designacoes', 'maxDesignacoesConsecutivas', value)}
                    min={1}
                    max={10}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.designacoes.evitarMesmaPessoaSemanaSeguinte}
                        onChange={(e) => handleChange('designacoes', 'evitarMesmaPessoaSemanaSeguinte', e.target.checked)}
                      />
                    }
                    label="Evitar mesma pessoa na semana seguinte"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Prioridades</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.designacoes.priorizarPioneiros}
                        onChange={(e) => handleChange('designacoes', 'priorizarPioneiros', e.target.checked)}
                      />
                    }
                    label="Priorizar pioneiros"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.designacoes.priorizarSemDesignacao}
                        onChange={(e) => handleChange('designacoes', 'priorizarSemDesignacao', e.target.checked)}
                      />
                    }
                    label="Priorizar sem designação recente"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Dias sem designar (urgência)"
                    value={config.designacoes.diasUrgencia}
                    onChange={(e) => handleChange('designacoes', 'diasUrgencia', parseInt(e.target.value) || 0)}
                    helperText="Pessoas sem designação há mais de X dias são consideradas urgentes"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Balanceamento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.designacoes.balancearPorGenero}
                        onChange={(e) => handleChange('designacoes', 'balancearPorGenero', e.target.checked)}
                      />
                    }
                    label="Balancear por gênero"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.designacoes.balancearPorGrupo}
                        onChange={(e) => handleChange('designacoes', 'balancearPorGrupo', e.target.checked)}
                      />
                    }
                    label="Balancear por grupo"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Confirmação</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.designacoes.requerConfirmacao}
                        onChange={(e) => handleChange('designacoes', 'requerConfirmacao', e.target.checked)}
                      />
                    }
                    label="Requer confirmação"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.designacoes.enviarLembreteAutomatico}
                        onChange={(e) => handleChange('designacoes', 'enviarLembreteAutomatico', e.target.checked)}
                      />
                    }
                    label="Enviar lembrete automático"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Dias limite para confirmação"
                    value={config.designacoes.diasLimiteConfirmacao}
                    onChange={(e) => handleChange('designacoes', 'diasLimiteConfirmacao', parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 7: Notificações (NOVO!) */}
        <TabPanel value={tabValue} index={7}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Canais de Comunicação</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notificacoes.emailAtivo}
                        onChange={(e) => handleChange('notificacoes', 'emailAtivo', e.target.checked)}
                      />
                    }
                    label="E-mail"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notificacoes.smsAtivo}
                        onChange={(e) => handleChange('notificacoes', 'smsAtivo', e.target.checked)}
                      />
                    }
                    label="SMS"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notificacoes.whatsappAtivo}
                        onChange={(e) => handleChange('notificacoes', 'whatsappAtivo', e.target.checked)}
                      />
                    }
                    label="WhatsApp"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Eventos de Notificação</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notificacoes.notificarNovaDesignacao}
                        onChange={(e) => handleChange('notificacoes', 'notificarNovaDesignacao', e.target.checked)}
                      />
                    }
                    label="Nova designação"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notificacoes.notificarAlteracaoDesignacao}
                        onChange={(e) => handleChange('notificacoes', 'notificarAlteracaoDesignacao', e.target.checked)}
                      />
                    }
                    label="Alteração de designação"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notificacoes.notificarLembrete}
                        onChange={(e) => handleChange('notificacoes', 'notificarLembrete', e.target.checked)}
                      />
                    }
                    label="Lembrete"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notificacoes.notificarAusenciaAprovada}
                        onChange={(e) => handleChange('notificacoes', 'notificarAusenciaAprovada', e.target.checked)}
                      />
                    }
                    label="Ausência aprovada"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Configurações de E-mail</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="E-mail remetente"
                    value={config.notificacoes.emailRemetente}
                    onChange={(e) => handleChange('notificacoes', 'emailRemetente', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome do remetente"
                    value={config.notificacoes.nomeRemetente}
                    onChange={(e) => handleChange('notificacoes', 'nomeRemetente', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora de envio dos lembretes"
                    value={config.notificacoes.horaEnvioLembretes}
                    onChange={(e) => handleChange('notificacoes', 'horaEnvioLembretes', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Dias de antecedência do lembrete"
                    value={config.notificacoes.diasAntecedenciaLembrete}
                    onChange={(e) => handleChange('notificacoes', 'diasAntecedenciaLembrete', parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 8: Horários (NOVO!) */}
        <TabPanel value={tabValue} index={8}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Reunião de Meio de Semana</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Dia da Semana</InputLabel>
                    <Select
                      value={config.horarios.diaMeioSemana}
                      label="Dia da Semana"
                      onChange={(e) => handleChange('horarios', 'diaMeioSemana', e.target.value)}
                    >
                      <MenuItem value="segunda">Segunda-feira</MenuItem>
                      <MenuItem value="terca">Terça-feira</MenuItem>
                      <MenuItem value="quarta">Quarta-feira</MenuItem>
                      <MenuItem value="quinta">Quinta-feira</MenuItem>
                      <MenuItem value="sexta">Sexta-feira</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora de Início"
                    value={config.horarios.horaInicioMeioSemana}
                    onChange={(e) => handleChange('horarios', 'horaInicioMeioSemana', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora de Término"
                    value={config.horarios.horaFimMeioSemana}
                    onChange={(e) => handleChange('horarios', 'horaFimMeioSemana', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Reunião de Fim de Semana</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Dia da Semana</InputLabel>
                    <Select
                      value={config.horarios.diaFimSemana}
                      label="Dia da Semana"
                      onChange={(e) => handleChange('horarios', 'diaFimSemana', e.target.value)}
                    >
                      <MenuItem value="sabado">Sábado</MenuItem>
                      <MenuItem value="domingo">Domingo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora de Início"
                    value={config.horarios.horaInicioFimSemana}
                    onChange={(e) => handleChange('horarios', 'horaInicioFimSemana', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora de Término"
                    value={config.horarios.horaFimFimSemana}
                    onChange={(e) => handleChange('horarios', 'horaFimFimSemana', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Tab 9: Permissões (NOVO!) */}
        <TabPanel value={tabValue} index={9}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" icon={<InfoIcon />}>
              Sistema de permissões granular que o Hourglass não possui.
            </Alert>
          </Box>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Anciãos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.anciãos.editarDesignacoes}
                        onChange={(e) => handleChange('permissoes', 'anciãos', {
                          ...config.permissoes.anciãos,
                          editarDesignacoes: e.target.checked
                        })}
                      />
                    }
                    label="Editar designações"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.anciãos.editarAusencias}
                        onChange={(e) => handleChange('permissoes', 'anciãos', {
                          ...config.permissoes.anciãos,
                          editarAusencias: e.target.checked
                        })}
                      />
                    }
                    label="Editar ausências"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.anciãos.verRelatorios}
                        onChange={(e) => handleChange('permissoes', 'anciãos', {
                          ...config.permissoes.anciãos,
                          verRelatorios: e.target.checked
                        })}
                      />
                    }
                    label="Ver relatórios"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.anciãos.exportarDados}
                        onChange={(e) => handleChange('permissoes', 'anciãos', {
                          ...config.permissoes.anciãos,
                          exportarDados: e.target.checked
                        })}
                      />
                    }
                    label="Exportar dados"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Servos Ministeriais</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.servosMinisteriais.editarDesignacoes}
                        onChange={(e) => handleChange('permissoes', 'servosMinisteriais', {
                          ...config.permissoes.servosMinisteriais,
                          editarDesignacoes: e.target.checked
                        })}
                      />
                    }
                    label="Editar designações"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.servosMinisteriais.editarAusencias}
                        onChange={(e) => handleChange('permissoes', 'servosMinisteriais', {
                          ...config.permissoes.servosMinisteriais,
                          editarAusencias: e.target.checked
                        })}
                      />
                    }
                    label="Editar ausências"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.servosMinisteriais.verRelatorios}
                        onChange={(e) => handleChange('permissoes', 'servosMinisteriais', {
                          ...config.permissoes.servosMinisteriais,
                          verRelatorios: e.target.checked
                        })}
                      />
                    }
                    label="Ver relatórios"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.servosMinisteriais.exportarDados}
                        onChange={(e) => handleChange('permissoes', 'servosMinisteriais', {
                          ...config.permissoes.servosMinisteriais,
                          exportarDados: e.target.checked
                        })}
                      />
                    }
                    label="Exportar dados"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">Publicadores</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.publicadores.verPropriaEscala}
                        onChange={(e) => handleChange('permissoes', 'publicadores', {
                          ...config.permissoes.publicadores,
                          verPropriaEscala: e.target.checked
                        })}
                      />
                    }
                    label="Ver própria escala"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.publicadores.editarPropriaDisponibilidade}
                        onChange={(e) => handleChange('permissoes', 'publicadores', {
                          ...config.permissoes.publicadores,
                          editarPropriaDisponibilidade: e.target.checked
                        })}
                      />
                    }
                    label="Editar própria disponibilidade"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.permissoes.publicadores.verOutrasEscalas}
                        onChange={(e) => handleChange('permissoes', 'publicadores', {
                          ...config.permissoes.publicadores,
                          verOutrasEscalas: e.target.checked
                        })}
                      />
                    }
                    label="Ver outras escalas"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </TabPanel>
      </Paper>

      {/* Dialog para adicionar etiqueta/motivo */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {dialogField === 'motivos' ? 'Adicionar Motivo' : 'Adicionar Etiqueta'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={newEtiqueta}
            onChange={(e) => setNewEtiqueta(e.target.value)}
            label={dialogField === 'motivos' ? 'Motivo' : 'Nome da etiqueta'}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                if (dialogField === 'motivos') {
                  handleAddMotivo()
                } else {
                  handleAddEtiqueta('avIndicadores', dialogField)
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (dialogField === 'motivos') {
                handleAddMotivo()
              } else {
                handleAddEtiqueta('avIndicadores', dialogField)
              }
            }}
            variant="contained"
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
