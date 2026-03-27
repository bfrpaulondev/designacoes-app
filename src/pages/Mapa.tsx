import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material'
import api from '../api'

interface Publicador {
  id: string
  nome: string
  morada?: string
  cidade?: string
  latitude: number
  longitude: number
  grupoCampo?: string
  grupoLimpeza?: string
  etiquetas: { nome: string; cor: string }[]
}

const SETUBAL_CENTER: [number, number] = [38.5244, -8.8882]

export default function Mapa() {
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterGrupo, setFilterGrupo] = useState('todos')
  const [grupos, setGrupos] = useState<string[]>([])
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    // Carregar Leaflet dinamicamente
    import('../components/MapLeaflet').then((mod) => {
      setMapComponent(() => mod.default)
    })
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/publicadores')
      const allPubs = res.data.publicadores || []
      
      // Filtrar apenas os que têm coordenadas
      const comCoords = allPubs.filter((p: Publicador) => p.latitude && p.longitude)
      setPublicadores(comCoords)

      // Extrair grupos únicos
      const gruposUnicos = [...new Set(allPubs.map((p: Publicador) => p.grupoCampo).filter(Boolean))] as string[]
      setGrupos(gruposUnicos.sort())
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const filteredPublicadores = publicadores.filter(p => 
    filterGrupo === 'todos' || p.grupoCampo === filterGrupo
  )

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Mapa de Publicadores
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Grupo</InputLabel>
              <Select
                value={filterGrupo}
                label="Filtrar por Grupo"
                onChange={(e) => setFilterGrupo(e.target.value)}
              >
                <MenuItem value="todos">Todos os Grupos</MenuItem>
                {grupos.map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              {filteredPublicadores.length} publicadores com localização
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ height: 500, position: 'relative' }}>
          {MapComponent ? (
            <MapComponent 
              publicadores={filteredPublicadores}
              center={SETUBAL_CENTER}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Card>

      {publicadores.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum publicador com coordenadas de localização cadastrado.
          Adicione latitude e longitude aos publicadores para visualizá-los no mapa.
        </Alert>
      )}
    </Box>
  )
}
