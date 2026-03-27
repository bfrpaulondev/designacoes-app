import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material'
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  FamilyRestroom as FamilyIcon,
} from '@mui/icons-material'
import api from '../api'

interface Publicador {
  id: string
  nome: string
  nomeCompleto: string
  genero: 'masculino' | 'feminino'
  tipoPublicador: string
  privilegioServico: string
  grupoCampo?: string
  familiaId?: string
  familiaNome?: string
  status: string
}

const COLORS = ['#1976d2', '#dc004e', '#00a97f', '#ff6d00', '#7b1fa2', '#00bcd4', '#ff5722', '#607d8b', '#4caf50', '#e91e63']

const TIPOS_COLORS: Record<string, string> = {
  'estudante': '#9e9e9e',
  'publicador_nao_batizado': '#ff9800',
  'publicador_batizado': '#4caf50',
  'pioneiro_auxiliar': '#2196f3',
  'pioneiro_auxiliar_continuo': '#3f51b5',
  'pioneiro_regular': '#9c27b0',
  'pioneiro_especial': '#e91e63',
  'missionario': '#f44336',
}

const TIPOS_LABELS: Record<string, string> = {
  'estudante': 'Estudante',
  'publicador_nao_batizado': 'Pub. Não Batizado',
  'publicador_batizado': 'Publicador',
  'pioneiro_auxiliar': 'P. Auxiliar',
  'pioneiro_auxiliar_continuo': 'P. Aux. Contínuo',
  'pioneiro_regular': 'P. Regular',
  'pioneiro_especial': 'P. Especial',
  'missionario': 'Missionário',
}

export default function Estatisticas() {
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGrupo, setSelectedGrupo] = useState<string>('todos')
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/publicadores')
      setPublicadores(res.data.publicadores || [])
    } catch (err) {
      console.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar publicadores ativos
  const ativos = publicadores.filter(p => p.status === 'ativo')
  const filtered = selectedGrupo === 'todos' 
    ? ativos 
    : ativos.filter(p => p.grupoCampo === selectedGrupo)

  // Obter lista de grupos
  const grupos = [...new Set(ativos.map(p => p.grupoCampo).filter(Boolean))].sort()

  // Dados para gráfico de gênero
  const generoData = [
    { name: 'Masculino', value: filtered.filter(p => p.genero === 'masculino').length, color: '#1976d2' },
    { name: 'Feminino', value: filtered.filter(p => p.genero === 'feminino').length, color: '#dc004e' },
  ]

  // Dados para gráfico de tipos de publicador
  const tiposData = Object.entries(
    filtered.reduce((acc, p) => {
      const tipo = p.tipoPublicador
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([tipo, count]) => ({
    name: TIPOS_LABELS[tipo] || tipo,
    value: count,
    fill: TIPOS_COLORS[tipo] || '#999',
  })).sort((a, b) => b.value - a.value)

  // Dados para gráfico de grupos
  const gruposData = Object.entries(
    ativos.reduce((acc, p) => {
      const grupo = p.grupoCampo || 'Sem Grupo'
      acc[grupo] = (acc[grupo] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([grupo, count], index) => ({
    name: grupo.replace('G-', 'G').split(' - ')[0],
    fullName: grupo,
    value: count,
    fill: COLORS[index % COLORS.length],
  })).sort((a, b) => {
    const numA = parseInt(a.name.replace('G', '')) || 99
    const numB = parseInt(b.name.replace('G', '')) || 99
    return numA - numB
  })

  // Dados para gráfico de famílias por grupo
  const familiasPorGrupo = gruposData.map(g => {
    const membrosGrupo = ativos.filter(p => 
      (p.grupoCampo || 'Sem Grupo') === g.fullName
    )
    const familias = new Set(membrosGrupo.map(p => p.familiaId).filter(Boolean))
    return {
      grupo: g.name,
      publicadores: g.value,
      familias: familias.size,
    }
  })

  // Resumo geral
  const resumo = {
    total: filtered.length,
    homens: filtered.filter(p => p.genero === 'masculino').length,
    mulheres: filtered.filter(p => p.genero === 'feminino').length,
    pioneiros: filtered.filter(p => ['pioneiro_auxiliar', 'pioneiro_auxiliar_continuo', 'pioneiro_regular', 'pioneiro_especial'].includes(p.tipoPublicador)).length,
    ancioas: filtered.filter(p => p.privilegioServico === 'anciao').length,
    servos: filtered.filter(p => p.privilegioServico === 'servo_ministerial').length,
    unggidos: filtered.filter(p => p.privilegioServico === 'ungido').length,
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
      {/* Filtro de Grupo */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Grupo</InputLabel>
                <Select
                  value={selectedGrupo}
                  label="Filtrar por Grupo"
                  onChange={(e) => setSelectedGrupo(e.target.value)}
                >
                  <MenuItem value="todos">Todos os Grupos</MenuItem>
                  {grupos.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<PeopleIcon />} 
                  label={`Total: ${resumo.total}`} 
                  color="primary" 
                />
                <Chip 
                  icon={<MaleIcon />} 
                  label={`Homens: ${resumo.homens}`} 
                  variant="outlined" 
                />
                <Chip 
                  icon={<FemaleIcon />} 
                  label={`Mulheres: ${resumo.mulheres}`} 
                  variant="outlined" 
                  color="secondary"
                />
                <Chip 
                  icon={<TrendingIcon />} 
                  label={`Pioneiros: ${resumo.pioneiros}`} 
                  color="success"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Visão Geral" />
          <Tab label="Por Grupo" />
          <Tab label="Famílias" />
        </Tabs>
      </Paper>

      {/* Tab 0: Visão Geral */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Cards de Resumo */}
          <Grid item xs={6} md={2}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" color="primary">{resumo.total}</Typography>
              <Typography variant="body2" color="text.secondary">Publicadores</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" color="success.main">{resumo.pioneiros}</Typography>
              <Typography variant="body2" color="text.secondary">Pioneiros</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" color="info.main">{resumo.ancioas}</Typography>
              <Typography variant="body2" color="text.secondary">Anciãos</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" color="warning.main">{resumo.servos}</Typography>
              <Typography variant="body2" color="text.secondary">Servos Min.</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" color="secondary.main">{resumo.homens}</Typography>
              <Typography variant="body2" color="text.secondary">Homens</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" color="secondary.light">{resumo.mulheres}</Typography>
              <Typography variant="body2" color="text.secondary">Mulheres</Typography>
            </Card>
          </Grid>

          {/* Gráficos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Distribuição por Tipo</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tiposData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {tiposData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Distribuição por Gênero</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={generoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {generoData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Tipos de Publicador (Barras)</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tiposData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Quantidade">
                      {tiposData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Por Grupo */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Publicadores por Grupo de Campo</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={gruposData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={60} />
                    <Tooltip 
                      formatter={(value) => [value, 'Publicadores']}
                      labelFormatter={(label) => gruposData.find(g => g.name === label)?.fullName}
                    />
                    <Bar dataKey="value" name="Publicadores">
                      {gruposData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Distribuição por Grupo</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={gruposData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {gruposData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Grupos - Visão Radar</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={gruposData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Publicadores"
                      dataKey="value"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Famílias */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Famílias e Publicadores por Grupo</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={familiasPorGrupo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grupo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="publicadores" fill="#1976d2" name="Publicadores" />
                    <Bar dataKey="familias" fill="#4caf50" name="Famílias" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <FamilyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Resumo de Famílias
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {filtered.filter(p => p.familiaId).length} publicadores agrupados em famílias
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Esta funcionalidade permite visualizar os membros de cada família dentro dos grupos de campo.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
