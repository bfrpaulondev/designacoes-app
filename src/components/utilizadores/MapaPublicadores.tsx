'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getPublicadoresMapa,
  getGruposCampo,
  getGruposLimpeza
} from '@/actions/publicadores'
import { getEtiquetas, type EtiquetaResponse, ICONE_ETIQUETA } from '@/actions/etiquetas'
import { MapPin, Users, Navigation, Filter, RefreshCw } from 'lucide-react'

interface PublicadorMapa {
  id: string
  nome: string
  morada?: string
  cidade?: string
  latitude: number
  longitude: number
  grupoCampo?: string
  grupoLimpeza?: string
  etiquetas: { nome: string; cor: string; icone: string }[]
}

// Default center (Lisboa)
const DEFAULT_CENTER: [number, number] = [38.7223, -9.1393]
const DEFAULT_ZOOM = 12

// Distance calculation helper
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Dynamic import do Mapa - só carrega no client
const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-slate-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>
  )
})

export default function MapaPublicadores() {
  const [publicadores, setPublicadores] = useState<PublicadorMapa[]>([])
  const [etiquetas, setEtiquetas] = useState<EtiquetaResponse[]>([])
  const [gruposCampo, setGruposCampo] = useState<string[]>([])
  const [gruposLimpeza, setGruposLimpeza] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Filters
  const [filterGrupoCampo, setFilterGrupoCampo] = useState('todos')
  const [filterGrupoLimpeza, setFilterGrupoLimpeza] = useState('todos')
  const [filterEtiqueta, setFilterEtiqueta] = useState('todos')

  // Selected publicador
  const [selectedPublicador, setSelectedPublicador] = useState<PublicadorMapa | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [mapaRes, etqRes, gcRes, glRes] = await Promise.all([
        getPublicadoresMapa(),
        getEtiquetas(),
        getGruposCampo(),
        getGruposLimpeza()
      ])

      // Garantir que sempre seja array
      setPublicadores(Array.isArray(mapaRes.data) ? mapaRes.data : [])
      setEtiquetas(Array.isArray(etqRes.data) ? etqRes.data : [])
      setGruposCampo(Array.isArray(gcRes.data) ? gcRes.data : [])
      setGruposLimpeza(Array.isArray(glRes.data) ? glRes.data : [])
      
      if (!mapaRes.success) {
        console.error('Erro mapa:', mapaRes.error)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Garantir arrays vazios em caso de erro
      setPublicadores([])
      setEtiquetas([])
      setGruposCampo([])
      setGruposLimpeza([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [loadData])

  // Filter publicadores
  const filteredPublicadores = useMemo(() => {
    return publicadores.filter(p => {
      const matchGrupoCampo = filterGrupoCampo === 'todos' || p.grupoCampo === filterGrupoCampo
      const matchGrupoLimpeza = filterGrupoLimpeza === 'todos' || p.grupoLimpeza === filterGrupoLimpeza
      const matchEtiqueta = filterEtiqueta === 'todos' || p.etiquetas.some(e => e.nome === filterEtiqueta)
      return matchGrupoCampo && matchGrupoLimpeza && matchEtiqueta
    })
  }, [publicadores, filterGrupoCampo, filterGrupoLimpeza, filterEtiqueta])

  // Calculate distances between members of the same group
  const groupDistances = useMemo(() => {
    const groups: Record<string, { nome: string; membros: PublicadorMapa[] }> = {}
    
    filteredPublicadores.forEach(p => {
      if (p.grupoCampo) {
        if (!groups[p.grupoCampo]) {
          groups[p.grupoCampo] = { nome: p.grupoCampo, membros: [] }
        }
        groups[p.grupoCampo].membros.push(p)
      }
    })

    const distances: { grupo: string; membro1: string; membro2: string; distancia: number }[] = []
    
    Object.values(groups).forEach(group => {
      if (group.membros.length > 1) {
        for (let i = 0; i < group.membros.length; i++) {
          for (let j = i + 1; j < group.membros.length; j++) {
            const dist = calculateDistance(
              group.membros[i].latitude,
              group.membros[i].longitude,
              group.membros[j].latitude,
              group.membros[j].longitude
            )
            distances.push({
              grupo: group.nome,
              membro1: group.membros[i].nome,
              membro2: group.membros[j].nome,
              distancia: Math.round(dist * 10) / 10
            })
          }
        }
      }
    })

    return distances.sort((a, b) => a.grupo.localeCompare(b.grupo))
  }, [filteredPublicadores])

  const handlePublicadorClick = (publicador: PublicadorMapa) => {
    setSelectedPublicador(publicador)
    setMapCenter([publicador.latitude, publicador.longitude])
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mapa de Publicadores</h2>
          <p className="text-slate-500">{filteredPublicadores.length} publicadores com localização</p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              Filtros:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              <Select value={filterGrupoCampo} onValueChange={setFilterGrupoCampo}>
                <SelectTrigger>
                  <SelectValue placeholder="Grupo de Campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Grupos de Campo</SelectItem>
                  {gruposCampo.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterGrupoLimpeza} onValueChange={setFilterGrupoLimpeza}>
                <SelectTrigger>
                  <SelectValue placeholder="Grupo de Limpeza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Grupos de Limpeza</SelectItem>
                  {gruposLimpeza.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterEtiqueta} onValueChange={setFilterEtiqueta}>
                <SelectTrigger>
                  <SelectValue placeholder="Etiqueta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Etiquetas</SelectItem>
                  {etiquetas.map(e => (
                    <SelectItem key={e.id} value={e.nome}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: e.cor }}
                        />
                        {e.nome}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-[500px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : filteredPublicadores.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  <div className="text-center text-slate-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum publicador com localização cadastrada</p>
                    <p className="text-sm mt-2">Adicione coordenadas aos publicadores para visualizá-los no mapa</p>
                  </div>
                </div>
              ) : (
                <MapaLeaflet 
                  publicadores={filteredPublicadores}
                  center={mapCenter}
                  selectedId={selectedPublicador?.id}
                  onPublicadorClick={handlePublicadorClick}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Publicadores List & Distances */}
        <div className="space-y-6">
          {/* Publicadores List */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Publicadores no Mapa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {filteredPublicadores.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nenhum publicador com localização
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredPublicadores.map((publicador) => (
                      <button
                        key={publicador.id}
                        type="button"
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedPublicador?.id === publicador.id
                            ? 'bg-amber-50 border border-amber-200'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => handlePublicadorClick(publicador)}
                      >
                        <p className="font-medium text-slate-800 text-sm">{publicador.nome}</p>
                        {publicador.grupoCampo && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {publicador.grupoCampo}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Distances */}
          {groupDistances.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-500" />
                  Distâncias entre Membros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {groupDistances.slice(0, 20).map((dist, i) => (
                      <div
                        key={i}
                        className="p-2 bg-slate-50 rounded-lg text-xs"
                      >
                        <p className="font-medium text-slate-700">{dist.grupo}</p>
                        <p className="text-slate-500">
                          {dist.membro1} ↔ {dist.membro2}
                        </p>
                        <p className="text-amber-600 font-medium">
                          {dist.distancia} km
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-700">Total no Mapa</p>
            <p className="text-2xl font-bold text-amber-800">{filteredPublicadores.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="pt-4">
            <p className="text-sm text-emerald-700">Grupos de Campo</p>
            <p className="text-2xl font-bold text-emerald-800">
              {new Set(filteredPublicadores.filter(p => p.grupoCampo).map(p => p.grupoCampo)).size}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-700">Grupos de Limpeza</p>
            <p className="text-2xl font-bold text-blue-800">
              {new Set(filteredPublicadores.filter(p => p.grupoLimpeza).map(p => p.grupoLimpeza)).size}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-4">
            <p className="text-sm text-purple-700">Cidades</p>
            <p className="text-2xl font-bold text-purple-800">
              {new Set(filteredPublicadores.filter(p => p.cidade).map(p => p.cidade)).size}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
