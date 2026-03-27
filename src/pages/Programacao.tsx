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
  Badge,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Settings as SettingsIcon,
  Print as PrintIcon,
} from '@mui/icons-material'
import api from '../api'
import type { Publicador, Designacao, Ausencia } from '../types'
import type { 
  ParteReuniao, 
  SugestaoDesignacao
} from '../types/programacao'
import { 
  TIPOS_PARTE_LABELS, 
  STATUS_LABELS, 
  TEMPLATE_MEIO_SEMANA 
} from '../types/programacao'
import { verificarAusencia } from '../utils/ausencias'

// Funções auxiliares
const getMonday = (d: Date) => {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

const formatDate = (date: Date) => date.toISOString().split('T')[0]

const formatWeekRange = (monday: Date) => {
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${monday.toLocaleDateString('pt-PT', opts)} - ${sunday.toLocaleDateString('pt-PT', opts)}`
}

const getDaysSince = (dateStr: string) => {
  if (!dateStr) return 999
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

// Dados de exemplo para ausências
const AUSENCIAS_EXEMPLO: Ausencia[] = [
  {
    id: '1',
    publicadorId: 'pub1',
    publicadorNome: 'Anabela D. C. M. Almeida',
    tipo: 'dias_especificos',
    diasEspecificos: ['2026-03-31', '2026-04-01', '2026-04-02'],
    tiposDesignacao: ['todas'],
    notas: 'Viagem de família',
    criadoEm: '2026-03-15T10:00:00Z',
    atualizadoEm: '2026-03-15T10:00:00Z',
  },
]

export default function Programacao() {
  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [designacoes, setDesignacoes] = useState<Designacao[]>([])
  const [ausencias] = useState<Ausencia[]>(AUSENCIAS_EXEMPLO)
  const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()))
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [activeTab, setActiveTab] = useState<'schedule' | 'stats'>('schedule')
  
  // Dialog states
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedPublicador, setSelectedPublicador] = useState<Publicador | null>(null)
  const [suggestionsAnchor, setSuggestionsAnchor] = useState<null | HTMLElement>(null)
  const [currentParte, setCurrentParte] = useState<ParteReuniao | null>(null)
  const [suggestions, setSuggestions] = useState<SugestaoDesignacao[]>([])
  
  // Partes da reunião
  const [partes, setPartes] = useState<ParteReuniao[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (publicadores.length > 0) {
      loadWeekData()
    }
  }, [currentMonday, publicadores])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pubRes, desRes] = await Promise.all([
        api.get('/publicadores'),
        api.get('/designacoes').catch(() => ({ data: { designacoes: [] } })),
      ])
      setPublicadores(pubRes.data.publicadores || [])
      setDesignacoes(desRes.data.designacoes || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadWeekData = async () => {
    // Gerar partes para a semana atual
    const novasPartes: ParteReuniao[] = TEMPLATE_MEIO_SEMANA.map((template, idx) => ({
      ...template,
      id: `${formatDate(currentMonday)}-${idx}`,
      data: formatDate(currentMonday),
      ordem: idx + 1,
        }))
    setPartes(novasPartes)
  }

  // Calcular sugestões para uma parte
  const calcularSugestoes = (parte: ParteReuniao): SugestaoDesignacao[] => {
    const publicadoresAtivos = publicadores.filter(p => p.status === 'ativo')
    
    const sugestoes: SugestaoDesignacao[] = publicadoresAtivos.map(pub => {
      // Filtrar designações deste publicador
      const minhasDesignacoes = designacoes.filter(d => d.publicadorId === pub.id)
      
      // Encontrar última designação
      const ultimaDesignacao = minhasDesignacoes
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
      
      const diasSemDesignar = ultimaDesignacao 
        ? getDaysSince(ultimaDesignacao.data)
        : 999
      
      // Verificar se está ausente nesta data para este tipo de designação
      const resultadoAusencia = verificarAusencia(
        ausencias, 
        pub.id, 
        parte.data, 
        parte.tipo
      )
      
      // Calcular score (maior = mais prioritário)
      let score = diasSemDesignar
      
      // Se está ausente, penalizar muito o score
      if (resultadoAusencia.estaAusente) {
        score -= 1000
      }
      
      // Bonus para anciãos/servos como presidentes
      if (parte.tipo === 'presidente' || parte.tipo === 'presidente_auxiliar') {
        if (pub.privilegioServico === 'anciao') score += 100
        if (pub.privilegioServico === 'servo_ministerial') score += 50
      }
      
      // Bonus para homens em leitura/oração
      if (['leitura_biblia', 'oracao_inicial', 'oracao_final'].includes(parte.tipo)) {
        if (pub.genero === 'masculino') score += 30
      }
      
      // Bonus para pioneiros em ministério
      if (parte.tipo.startsWith('ministerio_')) {
        if (['pioneiro_regular', 'pioneiro_auxiliar', 'pioneiro_auxiliar_continuo'].includes(pub.tipoPublicador)) {
          score += 40
        }
      }
      
      // Verificar conflitos (mesma data)
      const conflitos = minhasDesignacoes
        .filter(d => d.data === parte.data)
        .map(d => d.tipo)
      
      // Se tem conflito, reduzir muito o score
      if (conflitos.length > 0) {
        score -= 500
      }
      
      return {
        publicadorId: pub.id,
        publicadorNome: pub.nomeCompleto || pub.nome,
        diasSemDesignar,
        ultimaDesignacao: ultimaDesignacao?.data || 'Nunca',
        score,
        motivo: resultadoAusencia.estaAusente 
          ? `🚫 Ausente: ${resultadoAusencia.motivo}`
          : diasSemDesignar > 30 ? 'Há muito tempo sem designar' : 
                diasSemDesignar > 14 ? 'Algum tempo sem designar' : 
                'Designado recentemente',
        conflitos,
        estaAusente: resultadoAusencia.estaAusente,
        motivoAusencia: resultadoAusencia.motivo,
      }
    })
    
    // Ordenar por score (maior primeiro)
    return sugestoes.sort((a, b) => b.score - a.score)
  }

  const handleOpenSuggestions = (event: React.MouseEvent<HTMLElement>, parte: ParteReuniao) => {
    setCurrentParte(parte)
    setSuggestionsAnchor(event.currentTarget)
    setSuggestions(calcularSugestoes(parte))
  }

  const handleCloseSuggestions = () => {
    setSuggestionsAnchor(null)
    setCurrentParte(null)
  }

  const handleSelectPublicador = (sugestao: SugestaoDesignacao) => {
    if (!currentParte) return
    
    setPartes(prev => prev.map(p => 
      p.id === currentParte.id 
        ? { ...p, publicadorId: sugestao.publicadorId, publicadorNome: sugestao.publicadorNome, status: 'pendente' }
        : p
    ))
    handleCloseSuggestions()
  }

  const handleOpenHistory = (publicador: Publicador) => {
    setSelectedPublicador(publicador)
    setHistoryOpen(true)
  }

  const handlePrevWeek = () => {
    const newMonday = new Date(currentMonday)
    newMonday.setDate(newMonday.getDate() - 7)
    setCurrentMonday(newMonday)
  }

  const handleNextWeek = () => {
    const newMonday = new Date(currentMonday)
    newMonday.setDate(newMonday.getDate() + 7)
    setCurrentMonday(newMonday)
  }

  const handleToday = () => {
    setCurrentMonday(getMonday(new Date()))
  }

  // Histórico do publicador selecionado
  const publicadorHistory = useMemo(() => {
    if (!selectedPublicador) return []
    return designacoes
      .filter(d => d.publicadorId === selectedPublicador.id)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 10)
  }, [selectedPublicador, designacoes])

  // Estatísticas da semana
  const weekStats = useMemo(() => {
    const total = partes.length
    const preenchidos = partes.filter(p => p.publicadorId).length
    const pendentes = partes.filter(p => !p.publicadorId).length
    const aceites = partes.filter(p => p.status === 'aceite').length
    
    return { total, preenchidos, pendentes, aceites }
  }, [partes])

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

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Reunião de Semana
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Programação e designações
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Configurações">
            <IconButton><SettingsIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Imprimir">
            <IconButton><PrintIcon /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Navegação */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handlePrevWeek}>
                <ChevronLeftIcon />
              </IconButton>
              <Tooltip title="Ir para hoje">
                <IconButton onClick={handleToday}>
                  <TodayIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleNextWeek}>
                <ChevronRightIcon />
              </IconButton>
              <TextField
                type="date"
                value={formatDate(currentMonday)}
                onChange={(e) => setCurrentMonday(getMonday(new Date(e.target.value)))}
                size="small"
                sx={{ mx: 2, width: 160 }}
              />
              <Typography variant="h6">
                {formatWeekRange(currentMonday)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                size="small"
              >
                <ToggleButton value="week">Semana</ToggleButton>
                <ToggleButton value="month">Mês</ToggleButton>
              </ToggleButtonGroup>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${weekStats.preenchidos}/${weekStats.total} preenchidos`}
                  color={weekStats.preenchidos === weekStats.total ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(_, v) => v && setActiveTab(v)}
        >
          <ToggleButton value="schedule">
            <ScheduleIcon sx={{ mr: 1 }} />
            Programa
          </ToggleButton>
          <ToggleButton value="stats">
            <HistoryIcon sx={{ mr: 1 }} />
            Estatísticas
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Conteúdo */}
      {activeTab === 'schedule' && (
        <Grid container spacing={2}>
          {/* Sala Principal */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    🏠 Sala Principal
                  </Typography>
                  <Chip 
                    label="Terça-feira" 
                    size="small" 
                    sx={{ ml: 2 }}
                    color="primary"
                  />
                </Box>
                
                {partes.filter(p => p.sala === 'principal').map((parte) => (
                  <ParteCard
                    key={parte.id}
                    parte={parte}
                    onOpenSuggestions={handleOpenSuggestions}
                    onOpenHistory={handleOpenHistory}
                    publicadores={publicadores}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Sala Auxiliar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    🚪 Sala Auxiliar
                  </Typography>
                </Box>
                
                {partes.filter(p => p.sala === 'auxiliar').map((parte) => (
                  <ParteCard
                    key={parte.id}
                    parte={parte}
                    onOpenSuggestions={handleOpenSuggestions}
                    onOpenHistory={handleOpenHistory}
                    publicadores={publicadores}
                    compact
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 'stats' && (
        <EstatisticasTab 
          publicadores={publicadores}
          designacoes={designacoes}
          onOpenHistory={handleOpenHistory}
        />
      )}

      {/* Popover de Sugestões */}
      <Popover
        open={Boolean(suggestionsAnchor)}
        anchorEl={suggestionsAnchor}
        onClose={handleCloseSuggestions}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { width: 450, maxHeight: 550 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            💡 Sugestões de Designação
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Publicadores ausentes aparecem riscados no final da lista
          </Typography>
          
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {suggestions.slice(0, 15).map((sug, idx) => {
              const pub = publicadores.find(p => p.id === sug.publicadorId)
              const isAusente = sug.estaAusente
              
              return (
                <ListItem 
                  key={sug.publicadorId}
                  onClick={() => !isAusente && handleSelectPublicador(sug)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: isAusente ? 'error.50' : idx === 0 ? 'success.50' : idx < 3 ? 'grey.50' : 'transparent',
                    border: isAusente ? '1px dashed' : idx === 0 ? '2px solid' : '1px solid',
                    borderColor: isAusente ? 'error.main' : idx === 0 ? 'success.main' : 'divider',
                    opacity: isAusente ? 0.7 : 1,
                    cursor: isAusente ? 'not-allowed' : 'pointer',
                    '&:hover': isAusente ? {} : { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={isAusente ? '🚫' : idx === 0 ? '⭐' : null}
                      overlap="circular"
                    >
                      <Avatar sx={{ 
                        width: 36, 
                        height: 36,
                        bgcolor: isAusente ? 'grey.400' : pub?.genero === 'masculino' ? 'primary.light' : 'secondary.light',
                      }}>
                        {pub?.genero === 'masculino' ? <MaleIcon /> : <FemaleIcon />}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={idx === 0 && !isAusente ? 'bold' : 'normal'}
                          sx={{ 
                            textDecoration: isAusente ? 'line-through' : 'none',
                            color: isAusente ? 'text.disabled' : 'text.primary'
                          }}
                        >
                          {sug.publicadorNome}
                        </Typography>
                        {isAusente && (
                          <Chip label="AUSENTE" size="small" color="error" />
                        )}
                        {!isAusente && sug.diasSemDesignar > 30 && (
                          <Chip label="⏰ Há muito tempo" size="small" color="warning" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        {isAusente ? (
                          <Typography variant="caption" color="error" display="block">
                            {sug.motivoAusencia || 'Não disponível nesta data'}
                          </Typography>
                        ) : (
                          <>
                            <Typography variant="caption" display="block">
                              {sug.diasSemDesignar === 999 ? 'Nunca designado' : `${sug.diasSemDesignar} dias desde última designação`}
                            </Typography>
                            {sug.conflitos.length > 0 && (
                              <Typography variant="caption" color="error">
                                ⚠️ Conflito: já designado para esta data
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              )
            })}
          </List>
          
          {suggestions.some(s => s.estaAusente) && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="caption">
                {suggestions.filter(s => s.estaAusente).length} publicador(es) ausente(s) nesta data
              </Typography>
            </Alert>
          )}
        </Box>
      </Popover>

      {/* Dialog de Histórico */}
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: selectedPublicador?.genero === 'masculino' ? 'primary.main' : 'secondary.main' }}>
              {selectedPublicador?.nome.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedPublicador?.nomeCompleto}</Typography>
              <Typography variant="caption" color="text.secondary">
                Histórico de designações
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {publicadorHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Nenhuma designação encontrada
              </Typography>
            </Box>
          ) : (
            <List>
              {publicadorHistory.map((des, idx) => (
                <Box key={des.id}>
                  {idx > 0 && <Divider />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <ScheduleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={new Date(des.data + 'T12:00:00').toLocaleDateString('pt-PT', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={des.tipo} size="small" />
                          <Chip 
                            label={des.status} 
                            size="small"
                            color={des.status === 'realizado' ? 'success' : 'default'}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Componente para cada parte da reunião
interface ParteCardProps {
  parte: ParteReuniao
  onOpenSuggestions: (event: React.MouseEvent<HTMLElement>, parte: ParteReuniao) => void
  onOpenHistory: (publicador: Publicador) => void
  publicadores: Publicador[]
  compact?: boolean
}

function ParteCard({ parte, onOpenSuggestions, onOpenHistory, publicadores, compact }: ParteCardProps) {
  const tipoInfo = TIPOS_PARTE_LABELS[parte.tipo]
  const statusInfo = STATUS_LABELS[parte.status]
  const publicador = publicadores.find(p => p.id === parte.publicadorId)

  if (compact) {
    return (
      <Paper 
        variant="outlined" 
        sx={{ p: 1.5, mb: 1, cursor: 'pointer' }}
        onClick={(e) => onOpenSuggestions(e, parte)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{tipoInfo.icon}</Typography>
          <Typography variant="body2" fontWeight="medium" sx={{ flex: 1 }}>
            {parte.titulo}
          </Typography>
          {parte.publicadorNome ? (
            <Chip 
              label={parte.publicadorNome.split(' ')[0]}
              size="small"
              color="success"
            />
          ) : (
            <Chip label="Selecionar" size="small" variant="outlined" />
          )}
        </Box>
      </Paper>
    )
  }

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        mb: 2,
        borderLeft: 4,
        borderLeftColor: tipoInfo.cor,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 2 }
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={5}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {tipoInfo.icon} {parte.titulo}
            </Typography>
            {parte.descricao && (
              <Typography variant="caption" color="text.secondary">
                {parte.descricao}
              </Typography>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Button
            variant={parte.publicadorNome ? "outlined" : "contained"}
            fullWidth
            onClick={(e) => onOpenSuggestions(e, parte)}
            sx={{ 
              justifyContent: 'flex-start',
              textTransform: 'none',
              py: 1.5,
            }}
          >
            {parte.publicadorNome ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: publicador?.genero === 'masculino' ? 'primary.light' : 'secondary.light' }}>
                  {publicador?.genero === 'masculino' ? <MaleIcon fontSize="small" /> : <FemaleIcon fontSize="small" />}
                </Avatar>
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {parte.publicadorNome}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip 
                      label={statusInfo.icon + ' ' + statusInfo.label}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                      color={parte.status === 'aceite' ? 'success' : parte.status === 'rejeitado' ? 'error' : 'default'}
                    />
                    {parte.ajudanteNome && (
                      <Typography variant="caption" color="text.secondary">
                        c/ {parte.ajudanteNome}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {publicador && (
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenHistory(publicador)
                    }}
                  >
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                <Typography>Clique para selecionar</Typography>
              </Box>
            )}
          </Button>
        </Grid>

        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            {parte.duracao > 0 && (
              <Chip 
                label={`${parte.duracao} min`}
                size="small"
                variant="outlined"
                icon={<ScheduleIcon />}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

// Tab de Estatísticas
interface EstatisticasTabProps {
  publicadores: Publicador[]
  designacoes: Designacao[]
  onOpenHistory: (publicador: Publicador) => void
}

function EstatisticasTab({ publicadores, designacoes, onOpenHistory }: EstatisticasTabProps) {
  const ranking = useMemo(() => {
    return publicadores
      .filter(p => p.status === 'ativo')
      .map(p => {
        const minhasDesignacoes = designacoes.filter(d => d.publicadorId === p.id)
        const ultima = minhasDesignacoes
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
        
        return {
          publicador: p,
          total: minhasDesignacoes.length,
          ultimaData: ultima?.data,
          dias: ultima ? getDaysSince(ultima.data) : 999,
        }
      })
      .sort((a, b) => b.dias - a.dias)
  }, [publicadores, designacoes])

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📊 Ranking - Quem faz mais tempo sem designar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pessoas que precisam ser designadas com urgência
        </Typography>

        <List>
          {ranking.slice(0, 20).map((item, idx) => (
            <Box key={item.publicador.id}>
              {idx > 0 && <Divider />}
              <ListItem
                button
                onClick={() => onOpenHistory(item.publicador)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: idx < 5 ? 'error.light' : idx < 10 ? 'warning.light' : 'grey.300'
                  }}>
                    <Typography fontWeight="bold" color={idx < 5 ? 'white' : 'text.primary'}>
                      {idx + 1}
                    </Typography>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.publicador.nomeCompleto}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      <Typography variant="caption">
                        {item.dias === 999 ? '⚠️ Nunca designado' : `⏰ ${item.dias} dias`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.total} designações no total
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {item.dias > 30 && (
                    <Chip label="URGENTE" color="error" size="small" />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
