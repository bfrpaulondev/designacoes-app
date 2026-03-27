import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import api from '../api'

interface Publicador {
  id: string
  nome: string
  nomeCompleto: string
  nomePrimeiro: string
  nomeUltimo: string
  email?: string
  telemovel?: string
  genero: 'masculino' | 'feminino'
  tipoPublicador: string
  privilegioServico: string
  grupoCampo?: string
  grupoLimpeza?: string
  morada?: string
  cidade?: string
  latitude?: number
  longitude?: number
  status: string
}

interface Grupo {
  nome: string
  lider: string
  limpeza?: string
  publicadores: Publicador[]
  temCoordenadas: boolean
}

const SETUBAL_CENTER: [number, number] = [38.5284, -8.8856]
const DEFAULT_ZOOM = 14

export default function MapaGrupos() {
  const [publicadores, setPublicadores] = useState<Publicador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPublicador, setEditingPublicador] = useState<Publicador | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    import('../components/MapLeaflet').then((mod) => {
      setMapComponent(() => mod.default)
    })
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/publicadores')
      setPublicadores(res.data.publicadores || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  // Agrupar publicadores por grupo de campo
  const grupos: Grupo[] = (() => {
    const grupoMap = new Map<string, Publicador[]>()
    const semGrupo: Publicador[] = []

    publicadores.forEach(pub => {
      if (pub.grupoCampo) {
        const grupoNome = pub.grupoCampo.split(' | ')[0] // Pega só "G-X - Nome"
        if (!grupoMap.has(grupoNome)) {
          grupoMap.set(grupoNome, [])
        }
        grupoMap.get(grupoNome)!.push(pub)
      } else {
        semGrupo.push(pub)
      }
    })

    const result: Grupo[] = []
    
    // Grupos organizados
    grupoMap.forEach((pubs, nome) => {
      const liderMatch = nome.match(/G-(\d+) - (.+)/)
      result.push({
        nome,
        lider: liderMatch ? liderMatch[2] : nome,
        limpeza: pubs[0]?.grupoLimpeza ? `Grupo Limpeza ${pubs[0].grupoLimpeza}` : undefined,
        publicadores: pubs,
        temCoordenadas: pubs.some(p => p.latitude && p.longitude)
      })
    })

    // Ordenar por número do grupo
    result.sort((a, b) => {
      const numA = parseInt(a.nome.match(/G-(\d+)/)?.[1] || '99')
      const numB = parseInt(b.nome.match(/G-(\d+)/)?.[1] || '99')
      return numA - numB
    })

    // Sem grupo
    if (semGrupo.length > 0) {
      result.push({
        nome: 'Não num grupo',
        lider: 'Sem grupo',
        publicadores: semGrupo,
        temCoordenadas: semGrupo.some(p => p.latitude && p.longitude)
      })
    }

    return result
  })()

  // Obter publicadores do grupo selecionado ou todos com coordenadas para o mapa
  const publicadoresNoMapa = selectedGrupo
    ? grupos.find(g => g.nome === selectedGrupo)?.publicadores.filter(p => p.latitude && p.longitude) || []
    : publicadores.filter(p => p.latitude && p.longitude)

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedPosition({ lat, lng })
    setDialogOpen(true)
  }, [])

  const handleMarkerClick = useCallback((publicador: Publicador) => {
    setEditingPublicador(publicador)
    setSelectedPosition({ lat: publicador.latitude!, lng: publicador.longitude! })
    setDialogOpen(true)
  }, [])

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingPublicador(null)
    setSelectedPosition(null)
  }

  const handleSavePosition = async (publicadorId: string) => {
    if (!selectedPosition) return
    
    try {
      setSaving(true)
      await api.put(`/publicadores/${publicadorId}`, {
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng
      })
      loadData()
      handleCloseDialog()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleClearPosition = async (publicadorId: string) => {
    try {
      setSaving(true)
      await api.put(`/publicadores/${publicadorId}`, {
        latitude: null,
        longitude: null
      })
      loadData()
      handleCloseDialog()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao limpar')
    } finally {
      setSaving(false)
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
    <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 130px)' }}>
      {/* Lista de Grupos */}
      <Card sx={{ width: 320, flexShrink: 0, overflow: 'auto' }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ px: 1, py: 1 }}>
            Grupos de Campo
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1, display: 'block', mb: 1 }}>
            Clique num grupo para filtrar no mapa
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <List dense sx={{ py: 0 }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedGrupo === null}
                onClick={() => setSelectedGrupo(null)}
              >
                <ListItemIcon>
                  <LocationIcon color={publicadoresNoMapa.length > 0 ? 'primary' : 'disabled'} />
                </ListItemIcon>
                <ListItemText 
                  primary="Todos os Grupos" 
                  secondary={`${publicadoresNoMapa.length} localizações`}
                />
              </ListItemButton>
            </ListItem>
            <Divider />
            {grupos.map((grupo) => (
              <ListItem key={grupo.nome} disablePadding>
                <ListItemButton
                  selected={selectedGrupo === grupo.nome}
                  onClick={() => setSelectedGrupo(grupo.nome)}
                >
                  <ListItemIcon>
                    <LocationIcon color={grupo.temCoordenadas ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {grupo.nome}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {grupo.publicadores.length} publicador(es)
                        </Typography>
                        {grupo.limpeza && (
                          <Chip 
                            label={grupo.limpeza} 
                            size="small" 
                            sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Mapa */}
      <Card sx={{ flex: 1, position: 'relative' }}>
        {error && (
          <Alert severity="error" sx={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ height: '100%', position: 'relative' }}>
          {MapComponent ? (
            <MapComponent
              publicadores={publicadoresNoMapa}
              center={SETUBAL_CENTER}
              zoom={DEFAULT_ZOOM}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              interactive={true}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
        
        {/* Instrução */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            bgcolor: 'background.paper',
            p: 1.5,
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            💡 Clique no mapa para definir a posição de um publicador
          </Typography>
        </Box>
      </Card>

      {/* Dialog para selecionar/criar publicador na posição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingPublicador ? 'Editar Localização' : 'Definir Localização'}
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPosition && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Posição selecionada: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
            </Alert>
          )}
          
          {editingPublicador ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Publicador: <strong>{editingPublicador.nomeCompleto}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {editingPublicador.morada}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Grupo: {editingPublicador.grupoCampo || 'Sem grupo'}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleSavePosition(editingPublicador.id)}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Posição'}
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => handleClearPosition(editingPublicador.id)}
                  disabled={saving}
                >
                  Limpar Localização
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selecione um publicador para esta posição:
              </Typography>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {publicadores
                  .filter(p => !p.latitude || !p.longitude)
                  .map((pub) => (
                    <ListItem 
                      key={pub.id} 
                      disablePadding
                      secondaryAction={
                        pub.latitude && (
                          <Chip label="Já tem localização" size="small" />
                        )
                      }
                    >
                      <ListItemButton onClick={() => handleSavePosition(pub.id)}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                            {pub.nome.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={pub.nomeCompleto}
                          secondary={pub.grupoCampo || 'Sem grupo'}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </List>
              {publicadores.filter(p => !p.latitude || !p.longitude).length === 0 && (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  Todos os publicadores já têm localização definida.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
