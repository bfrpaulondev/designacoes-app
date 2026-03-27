import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  useTheme,
} from '@mui/material'
import {
  Person as PersonIcon,
  Group as GroupIcon,
  FamilyRestroom as FamilyIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  MenuBook as StudyIcon,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import api from '../api'
import type { Publicador, Familia, RelatorioCampo } from '../types'

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

const COLORS = ['#1976d2', '#dc004e', '#00a97f', '#ff6d00', '#7b1fa2', '#00796b', '#f57c00', '#5d4037', '#455a64']

export default function Atividades() {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  
  // Data states
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [familias, setFamilias] = useState<Familia[]>([])
  const [relatorios, setRelatorios] = useState<RelatorioCampo[]>([])
  
  // Filter states
  const [filterAno, setFilterAno] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pubRes, famRes, relRes] = await Promise.all([
        api.get('/publicadores'),
        api.get('/familias').catch(() => ({ data: { familias: [] } })),
        api.get('/relatorios').catch(() => ({ data: { relatorios: [] } })),
      ])
      setPublicadores(pubRes.data.publicadores || [])
      setFamilias(famRes.data.familias || [])
      setRelatorios(relRes.data.relatorios || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  // Gerar anos para filtro
  const anos = []
  const currentYear = new Date().getFullYear()
  for (let y = currentYear; y >= currentYear - 5; y--) {
    anos.push(y.toString())
  }

  // Calcular estatísticas por pessoa
  const calcularEstatisticasPessoa = () => {
    const stats: Record<string, {
      nome: string
      totalHoras: number
      totalRevisitas: number
      totalEstudos: number
      totalVideos: number
      totalPublicacoes: number
      meses: number
      horasPorMes: { mes: string; horas: number }[]
    }> = {}

    const relatoriosFiltrados = relatorios.filter(r => r.mes.startsWith(filterAno))

    relatoriosFiltrados.forEach(rel => {
      if (!stats[rel.publicadorId]) {
        stats[rel.publicadorId] = {
          nome: rel.publicadorNome,
          totalHoras: 0,
          totalRevisitas: 0,
          totalEstudos: 0,
          totalVideos: 0,
          totalPublicacoes: 0,
          meses: 0,
          horasPorMes: [],
        }
      }
      stats[rel.publicadorId].totalHoras += rel.horas
      stats[rel.publicadorId].totalRevisitas += rel.revisitas
      stats[rel.publicadorId].totalEstudos += rel.estudos
      stats[rel.publicadorId].totalVideos += rel.videos
      stats[rel.publicadorId].totalPublicacoes += rel.publicacoes
      stats[rel.publicadorId].meses += 1
      stats[rel.publicadorId].horasPorMes.push({
        mes: rel.mes,
        horas: rel.horas,
      })
    })

    return Object.values(stats).sort((a, b) => b.totalHoras - a.totalHoras)
  }

  // Calcular estatísticas por grupo
  const calcularEstatisticasGrupo = () => {
    const grupos: Record<string, {
      grupo: string
      publicadores: number
      totalHoras: number
      totalRevisitas: number
      totalEstudos: number
      pioneiros: number
      ancioas: number
    }> = {}

    const gruposDefinidos = [
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

    gruposDefinidos.forEach(g => {
      grupos[g] = {
        grupo: g.split(' - ')[1] || g,
        publicadores: 0,
        totalHoras: 0,
        totalRevisitas: 0,
        totalEstudos: 0,
        pioneiros: 0,
        ancioas: 0,
      }
    })

    // Contar publicadores por grupo
    publicadores.filter(p => p.status === 'ativo').forEach(p => {
      if (p.grupoCampo && grupos[p.grupoCampo]) {
        grupos[p.grupoCampo].publicadores++
        if (['pioneiro_auxiliar', 'pioneiro_auxiliar_continuo', 'pioneiro_regular', 'pioneiro_especial', 'missionario'].includes(p.tipoPublicador)) {
          grupos[p.grupoCampo].pioneiros++
        }
        if (p.privilegioServico === 'anciao') {
          grupos[p.grupoCampo].ancioas++
        }
      }
    })

    // Somar relatórios por grupo
    const relatoriosFiltrados = relatorios.filter(r => r.mes.startsWith(filterAno))
    relatoriosFiltrados.forEach(rel => {
      const pub = publicadores.find(p => p.id === rel.publicadorId)
      if (pub?.grupoCampo && grupos[pub.grupoCampo]) {
        grupos[pub.grupoCampo].totalHoras += rel.horas
        grupos[pub.grupoCampo].totalRevisitas += rel.revisitas
        grupos[pub.grupoCampo].totalEstudos += rel.estudos
      }
    })

    return Object.values(grupos)
  }

  // Calcular estatísticas por família
  const calcularEstatisticasFamilia = () => {
    const statsFamilia: Record<string, {
      nome: string
      membros: number
      totalHoras: number
      publicadores: { nome: string; horas: number }[]
    }> = {}

    familias.forEach(f => {
      statsFamilia[f.id] = {
        nome: f.nome,
        membros: f.membros.length,
        totalHoras: 0,
        publicadores: [],
      }
    })

    const relatoriosFiltrados = relatorios.filter(r => r.mes.startsWith(filterAno))

    relatoriosFiltrados.forEach(rel => {
      const pub = publicadores.find(p => p.id === rel.publicadorId)
      if (pub?.familiaId && statsFamilia[pub.familiaId]) {
        statsFamilia[pub.familiaId].totalHoras += rel.horas
        
        const existing = statsFamilia[pub.familiaId].publicadores.find(p => p.nome === rel.publicadorNome)
        if (existing) {
          existing.horas += rel.horas
        } else {
          statsFamilia[pub.familiaId].publicadores.push({
            nome: rel.publicadorNome,
            horas: rel.horas,
          })
        }
      }
    })

    return Object.values(statsFamilia)
      .filter(f => f.totalHoras > 0)
      .sort((a, b) => b.totalHoras - a.totalHoras)
  }

  // Dados para gráficos
  const statsPessoa = calcularEstatisticasPessoa()
  const statsGrupo = calcularEstatisticasGrupo()
  const statsFamilia = calcularEstatisticasFamilia()

  // Dados para gráfico de evolução mensal
  const evolucaoMensal = () => {
    const meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    return meses.map(mes => {
      const relatoriosMes = relatorios.filter(r => r.mes === `${filterAno}-${mes}`)
      return {
        mes: new Date(parseInt(filterAno), parseInt(mes) - 1).toLocaleDateString('pt-PT', { month: 'short' }),
        horas: relatoriosMes.reduce((sum, r) => sum + r.horas, 0),
        revisitas: relatoriosMes.reduce((sum, r) => sum + r.revisitas, 0),
        estudos: relatoriosMes.reduce((sum, r) => sum + r.estudos, 0),
        publicadores: new Set(relatoriosMes.map(r => r.publicadorId)).size,
      }
    })
  }

  // Top 10 publicadores por horas
  const topPublicadores = statsPessoa.slice(0, 10).map(s => ({
    nome: s.nome.split(' ')[0],
    horas: s.totalHoras,
  }))

  // Dados para gráfico de pizza por tipo de publicador
  const distribuicaoTipo = () => {
    const tipos: Record<string, number> = {}
    publicadores.filter(p => p.status === 'ativo').forEach(p => {
      tipos[p.tipoPublicador] = (tipos[p.tipoPublicador] || 0) + 1
    })
    return Object.entries(tipos).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }))
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Ano"
                value={filterAno}
                onChange={(e) => setFilterAno(e.target.value)}
              >
                {anos.map(ano => (
                  <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Total de Relatórios: <strong>{relatorios.filter(r => r.mes.startsWith(filterAno)).length}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Total de Horas: <strong>{statsPessoa.reduce((sum, s) => sum + s.totalHoras, 0)}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Publicadores Ativos: <strong>{statsPessoa.length}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<PersonIcon />} label="Por Pessoa" iconPosition="start" />
          <Tab icon={<GroupIcon />} label="Por Grupo" iconPosition="start" />
          <Tab icon={<FamilyIcon />} label="Por Família" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 0: Por Pessoa */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Gráfico de Top 10 Publicadores */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top 10 Publicadores por Horas
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topPublicadores} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nome" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="horas" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Pizza */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribuição por Tipo
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={distribuicaoTipo()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {distribuicaoTipo().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Lista detalhada */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ranking Completo de Publicadores
                </Typography>
                <List>
                  {statsPessoa.slice(0, 20).map((stat, index) => (
                    <Box key={index}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: index < 3 ? 'warning.main' : 'primary.main',
                            color: 'white',
                          }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={stat.nome}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Chip size="small" icon={<TimeIcon />} label={`${stat.totalHoras}h`} />
                              <Chip size="small" icon={<PeopleIcon />} label={`${stat.totalRevisitas} revisitas`} />
                              <Chip size="small" icon={<StudyIcon />} label={`${stat.totalEstudos} estudos`} />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="body2" color="text.secondary">
                            {stat.meses} meses ativos
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1: Por Grupo */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Gráfico de barras por grupo */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Horas por Grupo de Campo
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={statsGrupo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grupo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalHoras" name="Horas" fill={theme.palette.primary.main} />
                    <Bar dataKey="totalRevisitas" name="Revisitas" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Radar Chart */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comparativo de Grupos
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={statsGrupo.slice(0, 6).map(g => ({
                    grupo: g.grupo,
                    horas: g.totalHoras / 10,
                    publicadores: g.publicadores * 2,
                    pioneiros: g.pioneiros * 10,
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="grupo" />
                    <PolarRadiusAxis />
                    <Radar name="Horas (÷10)" dataKey="horas" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                    <Radar name="Pioneiros (×10)" dataKey="pioneiros" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Tabela de grupos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detalhes por Grupo
                </Typography>
                <Grid container spacing={2}>
                  {statsGrupo.map((grupo, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            {grupo.grupo}
                          </Typography>
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Publicadores</Typography>
                              <Typography variant="h6">{grupo.publicadores}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Horas</Typography>
                              <Typography variant="h6">{grupo.totalHoras}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Pioneiros</Typography>
                              <Typography variant="h6">{grupo.pioneiros}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Anciãos</Typography>
                              <Typography variant="h6">{grupo.ancioas}</Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Por Família */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {/* Gráfico de barras por família */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Horas por Família
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={statsFamilia.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalHoras" name="Total de Horas" fill={theme.palette.success.main} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Cards por família */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Detalhes por Família
            </Typography>
            <Grid container spacing={2}>
              {statsFamilia.map((familia, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <FamilyIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {familia.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {familia.membros} membros
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="h4" color="success.main" gutterBottom>
                        {familia.totalHoras}h
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <List dense>
                        {familia.publicadores.sort((a, b) => b.horas - a.horas).map((pub, i) => (
                          <ListItem key={i} sx={{ px: 0 }}>
                            <ListItemText
                              primary={pub.nome}
                              secondary={`${pub.horas} horas`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {statsFamilia.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary" align="center">
                    Nenhuma família com relatórios registrados
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Evolução Mensal - Visível em todas as tabs */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Evolução Mensal - {filterAno}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolucaoMensal()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="horas" name="Horas" stackId="1" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} />
              <Area type="monotone" dataKey="revisitas" name="Revisitas" stackId="2" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
