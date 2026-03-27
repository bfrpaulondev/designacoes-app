import { useState, useEffect } from 'react'
import {
  Box,
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
  Grid,
  Typography,
  Divider,
  Chip,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import api from '../api'

interface Publicador {
  id: string
  nome: string
  nomeCompleto: string
  nomePrimeiro: string
  nomeUltimo: string
  nomeMeio?: string
  sufixo?: string
  email?: string
  telemovel?: string
  telefoneCasa?: string
  telefoneOutro?: string
  genero: 'masculino' | 'feminino'
  dataNascimento?: string
  dataBatismo?: string
  tipoPublicador: string
  privilegioServico: string
  ungido?: boolean
  grupoCampo?: string
  grupoLimpeza?: string
  morada?: string
  morada2?: string
  codigoPostal?: string
  cidade?: string
  latitude?: number
  longitude?: number
  status: string
  etiquetas?: string[]
  familiaId?: string
  familiaNome?: string
  contatoFamilia?: boolean
  observacoes?: string
  primeiroMes?: string
  lingua?: string
  relataFilial?: boolean
  consentimentoDados?: string
}

interface Familia {
  id: string
  nome: string
  membros: string[]
}

interface PublicadorFormProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  publicador?: Publicador | null
  familias: Familia[]
  publicadores: Publicador[]
}

const TIPOS_PUBLICADOR = [
  { value: 'estudante', label: 'Estudante da Bíblia' },
  { value: 'publicador_nao_batizado', label: 'Publicador Não Batizado' },
  { value: 'publicador_batizado', label: 'Publicador Batizado' },
  { value: 'pioneiro_auxiliar', label: 'Pioneiro Auxiliar' },
  { value: 'pioneiro_auxiliar_continuo', label: 'Pioneiro Auxiliar Contínuo' },
  { value: 'pioneiro_regular', label: 'Pioneiro Regular' },
  { value: 'pioneiro_especial', label: 'Pioneiro Especial' },
  { value: 'missionario', label: 'Missionário de Campo' },
  { value: 'visitante', label: 'Visitante' },
]

const PRIVILEGIOS = [
  { value: 'nenhum', label: 'Nenhum' },
  { value: 'ungido', label: 'Ungido' },
  { value: 'anciao', label: 'Ancião' },
  { value: 'servo_ministerial', label: 'Servo Ministerial' },
]

const GRUPOS_CAMPO = [
  'G-1 - Jorge Sanches',
  'G-2 - João Pedro',
  'G-3 - Filipe Paulino',
  'G-4 - David Resende',
  'G-5 - Miguel Cascalheira',
  'G-6 - Edson Nascimento',
  'G-7 - António Fernandes',
  'G-8 - Miguel Calisto',
  'G-9 - Florivaldo Gomes',
]

const GRUPOS_LIMPEZA = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const LINGUAS = [
  { value: 'pt', label: 'Português' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
]

export default function PublicadorForm({ open, onClose, onSave, publicador, familias, publicadores }: PublicadorFormProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [activeTab, setActiveTab] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<Partial<Publicador>>({
    nomePrimeiro: '',
    nomeMeio: '',
    nomeUltimo: '',
    sufixo: '',
    genero: 'masculino',
    dataNascimento: '',
    telemovel: '',
    telefoneCasa: '',
    telefoneOutro: '',
    email: '',
    morada: '',
    morada2: '',
    codigoPostal: '',
    cidade: '',
    latitude: undefined,
    longitude: undefined,
    dataBatismo: '',
    tipoPublicador: 'publicador_batizado',
    privilegioServico: 'nenhum',
    ungido: false,
    grupoCampo: '',
    grupoLimpeza: '',
    contatoFamilia: false,
    familiaId: '',
    observacoes: '',
    primeiroMes: '',
    lingua: 'pt',
    relataFilial: false,
    consentimentoDados: '',
    status: 'ativo',
    etiquetas: [],
  })

  const [novaFamilia, setNovaFamilia] = useState('')
  const [criarNovaFamilia, setCriarNovaFamilia] = useState(false)

  useEffect(() => {
    if (publicador) {
      setFormData({
        ...publicador,
      })
    } else {
      setFormData({
        nomePrimeiro: '',
        nomeMeio: '',
        nomeUltimo: '',
        sufixo: '',
        genero: 'masculino',
        dataNascimento: '',
        telemovel: '',
        telefoneCasa: '',
        telefoneOutro: '',
        email: '',
        morada: '',
        morada2: '',
        codigoPostal: '',
        cidade: '',
        latitude: undefined,
        longitude: undefined,
        dataBatismo: '',
        tipoPublicador: 'publicador_batizado',
        privilegioServico: 'nenhum',
        ungido: false,
        grupoCampo: '',
        grupoLimpeza: '',
        contatoFamilia: false,
        familiaId: '',
        observacoes: '',
        primeiroMes: '',
        lingua: 'pt',
        relataFilial: false,
        consentimentoDados: '',
        status: 'ativo',
        etiquetas: [],
      })
    }
    setActiveTab(0)
    setError('')
  }, [publicador, open])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.nomePrimeiro || !formData.nomeUltimo) {
      setError('Nome e sobrenome são obrigatórios')
      return
    }

    try {
      setSaving(true)
      setError('')

      const nomeCompleto = [formData.nomePrimeiro, formData.nomeMeio, formData.nomeUltimo]
        .filter(Boolean).join(' ')
      
      const data = {
        ...formData,
        nome: formData.nomePrimeiro,
        nomeCompleto,
        familiaNome: criarNovaFamilia ? novaFamilia : undefined,
      }

      if (publicador) {
        await api.put(`/publicadores/${publicador.id}`, data)
      } else {
        await api.post('/publicadores', data)
      }

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const familiaOptions = familias.map(f => ({ id: f.id, nome: f.nome }))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: { height: fullScreen ? '100%' : '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.dark' }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="h6">
            {publicador ? `Editar: ${publicador.nomeCompleto}` : 'Novo Publicador'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab icon={<PersonIcon />} label="Dados Pessoais" iconPosition="start" />
            <Tab icon={<HomeIcon />} label="Morada" iconPosition="start" />
            <Tab icon={<CalendarIcon />} label="Serviço" iconPosition="start" />
            <Tab icon={<FamilyIcon />} label="Família" iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: Dados Pessoais */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                  Nome Completo
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Primeiro Nome *"
                  value={formData.nomePrimeiro || ''}
                  onChange={(e) => handleChange('nomePrimeiro', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Nome do Meio"
                  value={formData.nomeMeio || ''}
                  onChange={(e) => handleChange('nomeMeio', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Último Nome *"
                  value={formData.nomeUltimo || ''}
                  onChange={(e) => handleChange('nomeUltimo', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Sufixo"
                  value={formData.sufixo || ''}
                  onChange={(e) => handleChange('sufixo', e.target.value)}
                  placeholder="Ex: Jr, III"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Gênero *</InputLabel>
                  <Select
                    value={formData.genero || 'masculino'}
                    label="Gênero *"
                    onChange={(e) => handleChange('genero', e.target.value)}
                  >
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="feminino">Feminino</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  type="date"
                  value={formData.dataNascimento || ''}
                  onChange={(e) => handleChange('dataNascimento', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.contatoFamilia || false}
                      onChange={(e) => handleChange('contatoFamilia', e.target.checked)}
                    />
                  }
                  label="Contato de Família"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                  <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Contactos
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Telemóvel"
                  value={formData.telemovel || ''}
                  onChange={(e) => handleChange('telemovel', e.target.value)}
                  placeholder="912 345 678"
                  InputProps={{
                    startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Telefone de Casa"
                  value={formData.telefoneCasa || ''}
                  onChange={(e) => handleChange('telefoneCasa', e.target.value)}
                  placeholder="265 123 456"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Outro Telefone"
                  value={formData.telefoneOutro || ''}
                  onChange={(e) => handleChange('telefoneOutro', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  InputProps={{
                    startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Morada */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                  <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Endereço
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Morada"
                  value={formData.morada || ''}
                  onChange={(e) => handleChange('morada', e.target.value)}
                  placeholder="Rua, número, andar"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Morada 2"
                  value={formData.morada2 || ''}
                  onChange={(e) => handleChange('morada2', e.target.value)}
                  placeholder="Complemento"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Código Postal"
                  value={formData.codigoPostal || ''}
                  onChange={(e) => handleChange('codigoPostal', e.target.value)}
                  placeholder="2900-000"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={formData.cidade || ''}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Coordenadas (para o mapa)
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  value={formData.latitude || ''}
                  onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || undefined)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  value={formData.longitude || ''}
                  onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || undefined)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  Dica: As coordenadas podem ser obtidas clicando no mapa de grupos
                </Alert>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Serviço */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data do Batismo"
                  type="date"
                  value={formData.dataBatismo || ''}
                  onChange={(e) => handleChange('dataBatismo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Publicador</InputLabel>
                  <Select
                    value={formData.tipoPublicador || 'publicador_batizado'}
                    label="Tipo de Publicador"
                    onChange={(e) => handleChange('tipoPublicador', e.target.value)}
                  >
                    {TIPOS_PUBLICADOR.map(tipo => (
                      <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Privilégio de Serviço</InputLabel>
                  <Select
                    value={formData.privilegioServico || 'nenhum'}
                    label="Privilégio de Serviço"
                    onChange={(e) => handleChange('privilegioServico', e.target.value)}
                  >
                    {PRIVILEGIOS.map(priv => (
                      <MenuItem key={priv.value} value={priv.value}>{priv.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.ungido || false}
                      onChange={(e) => handleChange('ungido', e.target.checked)}
                    />
                  }
                  label="Ungido"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Grupo de Campo</InputLabel>
                  <Select
                    value={formData.grupoCampo || ''}
                    label="Grupo de Campo"
                    onChange={(e) => handleChange('grupoCampo', e.target.value)}
                  >
                    <MenuItem value="">Sem grupo</MenuItem>
                    {GRUPOS_CAMPO.map(grupo => (
                      <MenuItem key={grupo} value={grupo}>{grupo}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Grupo de Limpeza</InputLabel>
                  <Select
                    value={formData.grupoLimpeza || ''}
                    label="Grupo de Limpeza"
                    onChange={(e) => handleChange('grupoLimpeza', e.target.value)}
                  >
                    <MenuItem value="">Sem grupo</MenuItem>
                    {GRUPOS_LIMPEZA.map(grupo => (
                      <MenuItem key={grupo} value={grupo}>Grupo {grupo}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Opções Avançadas</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Primeiro Mês de Relatório"
                          type="month"
                          value={formData.primeiroMes || ''}
                          onChange={(e) => handleChange('primeiroMes', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Língua</InputLabel>
                          <Select
                            value={formData.lingua || 'pt'}
                            label="Língua"
                            onChange={(e) => handleChange('lingua', e.target.value)}
                          >
                            {LINGUAS.map(lang => (
                              <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.relataFilial || false}
                              onChange={(e) => handleChange('relataFilial', e.target.checked)}
                            />
                          }
                          label="Relata diretamente à Filial"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Consentimento de Dados Pessoais"
                          type="date"
                          value={formData.consentimentoDados || ''}
                          onChange={(e) => handleChange('consentimentoDados', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={formData.observacoes || ''}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Família */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                  <FamilyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Agrupamento Familiar
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Agrupe publicadores em famílias para facilitar a organização e visualização.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={criarNovaFamilia}
                      onChange={(e) => setCriarNovaFamilia(e.target.checked)}
                    />
                  }
                  label="Criar nova família"
                />
              </Grid>

              {criarNovaFamilia ? (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome da Família"
                    value={novaFamilia}
                    onChange={(e) => setNovaFamilia(e.target.value)}
                    placeholder="Ex: Família Silva"
                  />
                </Grid>
              ) : (
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={familiaOptions}
                    getOptionLabel={(option) => option.nome}
                    value={familiaOptions.find(f => f.id === formData.familiaId) || null}
                    onChange={(_, value) => handleChange('familiaId', value?.id || '')}
                    renderInput={(params) => (
                      <TextField {...params} label="Selecionar Família" />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FamilyIcon color="primary" />
                          {option.nome}
                        </Box>
                      </li>
                    )}
                  />
                </Grid>
              )}

              {formData.familiaId && !criarNovaFamilia && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Membros da Família
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {publicadores
                          .filter(p => p.familiaId === formData.familiaId)
                          .map(p => (
                            <Chip
                              key={p.id}
                              avatar={<Avatar>{p.nome.charAt(0)}</Avatar>}
                              label={p.nome}
                              variant="outlined"
                            />
                          ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12}>
                <Alert severity="info">
                  Families help organize publicadores and show relationships in reports and maps.
                </Alert>
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
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
  )
}
