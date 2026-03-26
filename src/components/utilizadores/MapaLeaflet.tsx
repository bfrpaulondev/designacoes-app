'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users } from 'lucide-react'
import { ICONE_ETIQUETA } from '@/actions/etiquetas'

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

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom marker icon creator
const createCustomIcon = (color: string = '#F59E0B') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
}

// Component to update map view when center changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

interface MapaLeafletProps {
  publicadores: PublicadorMapa[]
  center: [number, number]
  selectedId?: string
  onPublicadorClick: (publicador: PublicadorMapa) => void
}

export default function MapaLeaflet({ publicadores, center, selectedId, onPublicadorClick }: MapaLeafletProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      
      {publicadores.map((publicador) => (
        <Marker
          key={publicador.id}
          position={[publicador.latitude, publicador.longitude]}
          icon={createCustomIcon(publicador.etiquetas[0]?.cor || '#F59E0B')}
          eventHandlers={{
            click: () => onPublicadorClick(publicador)
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-slate-800 mb-1">{publicador.nome}</h3>
              {publicador.morada && (
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {publicador.morada}
                </p>
              )}
              {publicador.cidade && (
                <p className="text-sm text-slate-500">{publicador.cidade}</p>
              )}
              
              {(publicador.grupoCampo || publicador.grupoLimpeza) && (
                <div className="mt-2 space-y-1">
                  {publicador.grupoCampo && (
                    <p className="text-xs flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-500" />
                      Grupo Campo: {publicador.grupoCampo}
                    </p>
                  )}
                  {publicador.grupoLimpeza && (
                    <p className="text-xs text-slate-500">
                      Grupo Limpeza: {publicador.grupoLimpeza}
                    </p>
                  )}
                </div>
              )}

              {publicador.etiquetas.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {publicador.etiquetas.map((e, i) => {
                    const iconInfo = ICONE_ETIQUETA.find(icon => icon.valor === e.icone)
                    return (
                      <Badge
                        key={i}
                        className="text-white text-xs"
                        style={{ backgroundColor: e.cor }}
                      >
                        {iconInfo?.preview} {e.nome}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
