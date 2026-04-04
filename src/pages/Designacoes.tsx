import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Weekend as WeekendIcon,
  WbSunny as WeekdayIcon,
  Mic as MicIcon,
  CleanHands as CleaningIcon,
  Campaign as WitnessingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  SwapHoriz as SwapIcon,
  CalendarMonth as CalendarIcon,
  AutoFixHigh as AutoIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptBR from 'date-fns/locale/pt-BR'
import { useTipos } from '../contexts/TiposContext'
import { Ausencia, Publicador } from '../types/index'
import { Designacao, TipoDesignacao, CategoriaDesignacao } from '../types/designacoes'
import {
  gerarSugestoes,
  verificarDisponibilidade,
  gerarEscalaSemanal,
} from '../utils/designacoes'
import { CONFIGURACOES_PADRAO, ConfiguracoesSistema } from '../types/configuracoes'
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Designacoes() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Obter tipos dinâmicos do contexto
  const { tiposDesignacao, getTipoLabel: getTipoLabelFromContext, getStatusLabel: getStatusLabelFromContext, getStatusColor: getStatusColorFromContext } = useTipos()

  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dados
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [ausencias, setAusencias] = useState<Ausencia[]>([])
  const [config, setConfig] = useState<ConfiguracoesSistema>(CONFIGURACOES_PADRAO)
  const [designacoes, setDesignacoes] = useState<any[]>([])

  // Filtros
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date())
  const [semanaInicio, setSemanaInicio] = useState<string>('')

  // Dialogs
  const [dialogDesignacao, setDialogDesignacao] = useState(false)
  const [dialogSugestoes, setDialogSugestoes] = useState(false)
  const [tipoDesignacaoAtual, setTipoDesignacaoAtual] = useState<string | null>(null)
  const [sugestoesAtuais, setSugestoesAtuais] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Calcula o início da semana (segunda-feira)
    const data = new Date(dataSelecionada)
    const dia = data.getDay()
    const diff = data.getDate() - dia + (dia === 0 ? -6 : 1)
    const segunda = new Date(data.setDate(diff))
    setSemanaInicio(segunda.toISOString().split('T')[0])
  }, [dataSelecionada])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pubRes, ausRes, configRes, desRes] = await Promise.all([
        api.get('/publicadores'),
        api.get('/ausencias'),
        api.get('/config-programacao').catch(() => ({ data: { config: null } })),
        api.get('/designacoes').catch(() => ({ data: { designacoes: [] } })),
      ])

      setPublicadores(pubRes.data.publicadores || [])
      setAusencias(ausRes.data.ausencias || [])
      if (configRes.data.config) {
        setConfig({ ...CONFIGURACOES_PADRAO, ...configRes.data.config })
      }
      setDesignacoes(desRes.data.designacoes || [])
    } catch (err: any) {
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Filtra designações por data
  const designacoesFiltradas = useMemo(() => {
    if (!semanaInicio) return []
    
    const dataFim = new Date(semanaInicio)
    dataFim.setDate(dataFim.getDate() + 6)
    const dataFimStr = dataFim.toISOString().split('T')[0]

    return designacoes.filter(d => 
      d.data >= semanaInicio && d.data <= dataFimStr
    )
  }, [designacoes, semanaInicio])

  // Designações por categoria
  const designacoesPorCategoria = useMemo(() => {
    return {
      fim_semana: designacoesFiltradas.filter(d => d.categoria === 'fim_semana'),
      meio_semana: designacoesFiltradas.filter(d => d.categoria === 'meio_semana'),
      av_indicadores: designacoesFiltradas.filter(d => d.categoria === 'av_indicadores'),
      limpeza: designacoesFiltradas.filter(d => d.categoria === 'limpeza'),
      testemunho_publico: designacoesFiltradas.filter(d => d.categoria === 'testemunho_publico'),
    }
  }, [designacoesFiltradas])

  // Gera escala automática para a semana
  const gerarEscalaAutomatica = async () => {
    try {
      setSaving(true)
      setError('')

      const novaEscala = gerarEscalaSemanal(
        semanaInicio,
        publicadores,
        ausencias,
        config,
        designacoes
      )

      // Combina todas as designações
      const novasDesignacoes: Designacao[] = [
        ...novaEscala.fimSemana,
        ...novaEscala.meioSemana,
        ...novaEscala.avIndicadores,
        ...novaEscala.limpeza,
        ...novaEscala.testemunhoPublico,
      ]

      // Salva no backend
      await api.post('/designacoes/batch', { designacoes: novasDesignacoes })

      // Atualiza estado local
      setDesignacoes(prev => {
        // Remove designações antigas da semana
        const outras = prev.filter(d => {
          const data = new Date(d.data)
          const inicio = new Date(semanaInicio)
          const fim = new Date(semanaInicio)
          fim.setDate(fim.getDate() + 6)
          return data < inicio || data > fim
        })
        return [...outras, ...novasDesignacoes]
      })

      setSuccess('Escala gerada com sucesso!')
    } catch (err: any) {
      setError('Erro ao gerar escala')
    } finally {
      setSaving(false)
    }
  }

  // Abre dialog de sugestões
  const abrirSugestoes = (tipo: string, categoria: string, data: string) => {
    const sugestoes = gerarSugestoes(
      publicadores,
      data,
      tipo as TipoDesignacao,
      categoria as CategoriaDesignacao,
      ausencias,
      designacoes,
      config
    )
    setSugestoesAtuais(sugestoes)
    setTipoDesignacaoAtual(tipo)
    setDialogSugestoes(true)
  }

  // Seleciona publicador da sugestão
  const selecionarPublicador = async (sugestao: any) => {
    if (!tipoDesignacaoAtual || !semanaInicio) return

    try {
      // Determina a data baseada na categoria
      const tabCategoria = tabValue === 0 ? 'fim_semana' : 
                          tabValue === 1 ? 'meio_semana' : 
                          tabValue === 2 ? 'av_indicadores' : 'limpeza'
      const data = tabValue === 0 
        ? getDataFimSemana(semanaInicio, config)
        : getDataMeioSemana(semanaInicio, config)

      const novaDesignacao: any = {
        id: `${data}_${tipoDesignacaoAtual}_${Date.now()}`,
        publicadorId: sugestao.publicadorId,
        publicadorNome: sugestao.publicadorNome,
        tipo: tipoDesignacaoAtual,
        categoria: tabCategoria,
        data,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      }

      const response = await api.post('/designacoes', novaDesignacao)
      const savedDesignacao = response.data.designacao || response.data || novaDesignacao
      setDesignacoes(prev => [...prev, savedDesignacao])
      setDialogSugestoes(false)
      setSuccess('Designação adicionada!')
    } catch (err: any) {
      setError('Erro ao salvar designação')
    }
  }

  // Remove designação
  const removerDesignacao = async (id: string) => {
    try {
      await api.delete(`/designacoes/${id}`)
      setDesignacoes(prev => prev.filter(d => d.id !== id))
      setSuccess('Designação removida!')
    } catch (err: any) {
      setError('Erro ao remover designação')
    }
  }

  // Funções auxiliares
  const getDataFimSemana = (semanaInicio: string, config: ConfiguracoesSistema): string => {
    const data = new Date(semanaInicio)
    if (config.horarios.diaFimSemana === 'sabado') {
      data.setDate(data.getDate() + 5)
    } else {
      data.setDate(data.getDate() + 6)
    }
    return data.toISOString().split('T')[0]
  }

  const getDataMeioSemana = (semanaInicio: string, config: ConfiguracoesSistema): string => {
    const data = new Date(semanaInicio)
    const diaMap: Record<string, number> = {
      segunda: 0, terca: 1, quarta: 2, quinta: 3, sexta: 4
    }
    data.setDate(data.getDate() + diaMap[config.horarios.diaMeioSemana])
    return data.toISOString().split('T')[0]
  }

  const getStatusColor = (status: string) => {
    return getStatusColorFromContext(status)
  }

  const getStatusLabel = (status: string) => {
    return getStatusLabelFromContext(status)
  }

  const getTipoLabel = (tipo: string, categoria: string) => {
    return getTipoLabelFromContext(tipo, categoria)
  }

  const formatDate = (data: string) => {
    if (!data) return ''
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  // Renderiza lista de designações
  const renderDesignacaoItem = (designacao: any) => {
    const { disponivel, motivo } = verificarDisponibilidade(
      designacao.publicadorId,
      designacao.data,
      designacao.tipo,
      designacao.categoria,
      ausencias
    )

    return (
      <ListItem
        key={designacao.id}
        sx={{
          bgcolor: 'background.paper',
          mb: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          opacity: !disponivel && designacao.status === 'pendente' ? 0.6 : 1,
        }}
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Ver sugestões">
              <IconButton size="small" onClick={() => abrirSugestoes(designacao.tipo, designacao.categoria, designacao.data)}>
                <SwapIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover">
              <IconButton size="small" color="error" onClick={() => removerDesignacao(designacao.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: getStatusColor(designacao.status) }}>
            {designacao.status === 'confirmado' ? <CheckIcon /> : 
             designacao.status === 'ausente' ? <BlockIcon /> : <PersonIcon />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2">
                {designacao.publicadorNome}
              </Typography>
              {!disponivel && (
                <Tooltip title={motivo}>
                  <WarningIcon color="warning" fontSize="small" />
                </Tooltip>
              )}
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={getTipoLabel(designacao.tipo, designacao.categoria)}
                size="small"
                variant="outlined"
              />
              <Chip
                label={getStatusLabel(designacao.status)}
                size="small"
                sx={{ bgcolor: getStatusColor(designacao.status), color: 'white' }}
              />
              {!disponivel && (
                <Typography variant="caption" color="warning.main">
                  {motivo}
                </Typography>
              )}
            </Box>
          }
        />
      </ListItem>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5">
            Designações
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              label="Semana"
              value={dataSelecionada}
              onChange={(novaData) => novaData && setDataSelecionada(novaData)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button
              variant="contained"
              startIcon={<AutoIcon />}
              onClick={gerarEscalaAutomatica}
              disabled={saving}
            >
              Gerar Escala
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Info da semana */}
        <Alert severity="info" sx={{ mb: 2 }} icon={<CalendarIcon />}>
          Exibindo designações da semana: {formatDate(semanaInicio)} a {
            (() => {
              const fim = new Date(semanaInicio)
              fim.setDate(fim.getDate() + 6)
              return formatDate(fim.toISOString().split('T')[0])
            })()
          }
        </Alert>

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<WeekendIcon />} 
              label={isMobile ? '' : 'Fim de Semana'} 
              iconPosition="start"
            />
            <Tab 
              icon={<WeekdayIcon />} 
              label={isMobile ? '' : 'Meio de Semana'} 
              iconPosition="start"
            />
            <Tab 
              icon={<MicIcon />} 
              label={isMobile ? '' : 'A/V e Indicadores'} 
              iconPosition="start"
            />
            <Tab 
              icon={<CleaningIcon />} 
              label={isMobile ? '' : 'Limpeza'} 
              iconPosition="start"
            />
            <Tab 
              icon={<WitnessingIcon />} 
              label={isMobile ? '' : 'Test. Público'} 
              iconPosition="start"
            />
          </Tabs>

          {/* Tab 0: Fim de Semana */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Reunião de Fim de Semana - {formatDate(getDataFimSemana(semanaInicio, config))}
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setTipoDesignacaoAtual('presidente')
                  setDialogDesignacao(true)
                }}
              >
                Adicionar
              </Button>
            </Box>

            {designacoesPorCategoria.fim_semana.length === 0 ? (
              <Alert severity="warning">Nenhuma designação para esta semana. Clique em "Gerar Escala" para criar automaticamente.</Alert>
            ) : (
              <List disablePadding>
                {designacoesPorCategoria.fim_semana
                  .sort((a, b) => {
                    const ordem: Record<string, number> = {
                      presidente: 1, oracao_inicial: 2, dirigente_sentinela: 3,
                      leitor_sentinela: 4, interprete: 5, orador: 6, hospitalidade: 7, oracao_final: 8
                    }
                    return (ordem[a.tipo] || 99) - (ordem[b.tipo] || 99)
                  })
                  .map(renderDesignacaoItem)}
              </List>
            )}
          </TabPanel>

          {/* Tab 1: Meio de Semana */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Reunião de Meio de Semana - {formatDate(getDataMeioSemana(semanaInicio, config))}
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setTipoDesignacaoAtual('presidente')
                  setDialogDesignacao(true)
                }}
              >
                Adicionar
              </Button>
            </Box>

            {designacoesPorCategoria.meio_semana.length === 0 ? (
              <Alert severity="warning">Nenhuma designação para esta semana. Clique em "Gerar Escala" para criar automaticamente.</Alert>
            ) : (
              <List disablePadding>
                {designacoesPorCategoria.meio_semana
                  .sort((a, b) => {
                    const ordem: Record<string, number> = {
                      presidente: 1, oracao_inicial: 2, tesouros: 3, perolas_espirituais: 4,
                      leitura_biblia: 5, ministerio_iniciar: 6, ministerio_cultivar: 7,
                      ministerio_discipulos: 8, estudo_biblico: 9, leitor_ebc: 10, orador_servico: 11, oracao_final: 12
                    }
                    return (ordem[a.tipo] || 99) - (ordem[b.tipo] || 99)
                  })
                  .map(renderDesignacaoItem)}
              </List>
            )}
          </TabPanel>

          {/* Tab 2: A/V e Indicadores */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                A/V e Indicadores
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setTipoDesignacaoAtual('som')
                  setDialogDesignacao(true)
                }}
              >
                Adicionar
              </Button>
            </Box>

            {designacoesPorCategoria.av_indicadores.length === 0 ? (
              <Alert severity="warning">Nenhuma designação para esta semana. Clique em "Gerar Escala" para criar automaticamente.</Alert>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Meio de Semana
                  </Typography>
                  <List disablePadding>
                    {designacoesPorCategoria.av_indicadores
                      .filter(d => d.data === getDataMeioSemana(semanaInicio, config))
                      .map(renderDesignacaoItem)}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Fim de Semana
                  </Typography>
                  <List disablePadding>
                    {designacoesPorCategoria.av_indicadores
                      .filter(d => d.data === getDataFimSemana(semanaInicio, config))
                      .map(renderDesignacaoItem)}
                  </List>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* Tab 3: Limpeza */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Grupos de Limpeza
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setTipoDesignacaoAtual('grupo_limpeza_a')
                  setDialogDesignacao(true)
                }}
              >
                Adicionar
              </Button>
            </Box>

            {designacoesPorCategoria.limpeza.length === 0 ? (
              <Alert severity="warning">Nenhuma designação para esta semana. Clique em "Gerar Escala" para criar automaticamente.</Alert>
            ) : (
              <List disablePadding>
                {designacoesPorCategoria.limpeza.map(renderDesignacaoItem)}
              </List>
            )}
          </TabPanel>

          {/* Tab 4: Testemunho Público */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Testemunho Público
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
              >
                Adicionar
              </Button>
            </Box>

            {designacoesPorCategoria.testemunho_publico.length === 0 ? (
              <Alert severity="info">
                Configure os horários de testemunho público nas Configurações para gerar designações automáticas.
              </Alert>
            ) : (
              <List disablePadding>
                {designacoesPorCategoria.testemunho_publico.map(renderDesignacaoItem)}
              </List>
            )}
          </TabPanel>
        </Paper>

        {/* Dialog de Sugestões */}
        <Dialog
          open={dialogSugestoes}
          onClose={() => setDialogSugestoes(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Sugestões de Publicadores
          </DialogTitle>
          <DialogContent dividers>
            <Alert severity="info" sx={{ mb: 2 }}>
              Lista ordenada por prioridade. Publicadores com mais tempo sem designação aparecem primeiro.
            </Alert>
            <List>
              {sugestoesAtuais.map((sugestao, index) => (
                <ListItem
                  key={sugestao.publicadorId}
                  sx={{
                    bgcolor: index === 0 ? 'action.selected' : 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: sugestao.disponivel ? 'divider' : 'error.main',
                    opacity: sugestao.disponivel ? 1 : 0.6,
                  }}
                  secondaryAction={
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!sugestao.disponivel || !sugestao.adequado}
                      onClick={() => selecionarPublicador(sugestao)}
                    >
                      Selecionar
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Badge badgeContent={index + 1} color={index === 0 ? 'success' : 'default'}>
                      <Avatar sx={{ bgcolor: sugestao.disponivel ? 'primary.main' : 'error.main' }}>
                        {sugestao.publicadorNome.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {sugestao.publicadorNome}
                        </Typography>
                        <Chip label={sugestao.privilegio} size="small" variant="outlined" />
                        {sugestao.tipoPublicador.includes('pioneiro') && (
                          <Chip label="Pioneiro" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {sugestao.diasSemDesignar === 999 
                            ? 'Nunca designado' 
                            : `${sugestao.diasSemDesignar} dias sem designar`}
                        </Typography>
                        {!sugestao.disponivel && (
                          <Typography variant="body2" color="error.main">
                            {sugestao.motivoIndisponibilidade}
                          </Typography>
                        )}
                        {!sugestao.adequado && (
                          <Typography variant="body2" color="error.main">
                            {sugestao.motivoInadequacao}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          <Chip 
                            label={`Score: ${Math.round(sugestao.score)}`} 
                            size="small" 
                            color={sugestao.score > 70 ? 'success' : sugestao.score > 40 ? 'warning' : 'error'}
                          />
                          <Chip 
                            label={sugestao.prioridade} 
                            size="small"
                            color={sugestao.prioridade === 'alta' ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogSugestoes(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Nova Designação */}
        <Dialog
          open={dialogDesignacao}
          onClose={() => setDialogDesignacao(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Adicionar Designação
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Designação</InputLabel>
                  <Select
                    value={tipoDesignacaoAtual || ''}
                    label="Tipo de Designação"
                    onChange={(e) => setTipoDesignacaoAtual(e.target.value)}
                  >
                    {tabValue === 0 && tiposDesignacao.fimSemana.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
                    ))}
                    {tabValue === 1 && tiposDesignacao.meioSemana.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
                    ))}
                    {tabValue === 2 && tiposDesignacao.avIndicadores.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
                    ))}
                    {tabValue === 3 && tiposDesignacao.limpeza.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    if (tipoDesignacaoAtual) {
                      const categoria = tabValue === 0 ? 'fim_semana' : 
                                       tabValue === 1 ? 'meio_semana' : 
                                       tabValue === 2 ? 'av_indicadores' : 'limpeza'
                      const data = tabValue === 0 ? getDataFimSemana(semanaInicio, config) : 
                                  tabValue === 1 ? getDataMeioSemana(semanaInicio, config) : 
                                  getDataFimSemana(semanaInicio, config)
                      abrirSugestoes(tipoDesignacaoAtual, categoria, data)
                      setDialogDesignacao(false)
                    }
                  }}
                  disabled={!tipoDesignacaoAtual}
                >
                  Ver Sugestões de Publicadores
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogDesignacao(false)}>Cancelar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}
