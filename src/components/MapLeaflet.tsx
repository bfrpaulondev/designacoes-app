import { useEffect, useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Publicador {
  id: string
  nome: string
  nomeCompleto?: string
  morada?: string
  cidade?: string
  latitude: number
  longitude: number
  grupoCampo?: string
  etiquetas?: { nome: string; cor: string }[]
}

interface MapLeafletProps {
  publicadores: Publicador[]
  center: [number, number]
  zoom?: number
  interactive?: boolean
  onMapClick?: (lat: number, lng: number) => void
  onMarkerClick?: (publicador: Publicador) => void
}

export default function MapLeaflet({ 
  publicadores, 
  center, 
  zoom = 14,
  interactive = false,
  onMapClick,
  onMarkerClick
}: MapLeafletProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [L, setL] = useState<typeof import('leaflet') | null>(null)

  // Load Leaflet
  useEffect(() => {
    if (typeof window === 'undefined') return
    import('leaflet').then(leaflet => {
      // Fix for default marker icon
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setL(leaflet)
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return

    const mapInstance = L.map(containerRef.current).setView(center, zoom)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapInstance)

    // Add click handler if interactive
    if (interactive && onMapClick) {
      mapInstance.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng)
      })
    }

    mapRef.current = mapInstance

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [L, center, zoom, interactive, onMapClick])

  // Update markers when publicadores change
  useEffect(() => {
    if (!L || !mapRef.current) return

    const map = mapRef.current

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    const newMarkers: L.Marker[] = []

    // Add new markers
    publicadores.forEach(pub => {
      if (!pub.latitude || !pub.longitude) return

      // Determine marker color based on group
      const grupoMatch = pub.grupoCampo?.match(/G-(\d+)/)
      const grupoNum = grupoMatch ? parseInt(grupoMatch[1]) : 0
      
      const colors = [
        '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
        '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#6B7280'
      ]
      const color = colors[grupoNum % colors.length]

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">${grupoNum || '?'}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      })

      const marker = L.marker([pub.latitude, pub.longitude], { icon: customIcon })
        .addTo(map)

      // Create popup content
      let popupContent = `
        <div style="min-width: 200px">
          <strong style="font-size: 14px">${pub.nomeCompleto || pub.nome}</strong><br/>
      `
      if (pub.morada) popupContent += `<span style="font-size: 12px">${pub.morada}</span><br/>`
      if (pub.cidade) popupContent += `<span style="font-size: 12px; color: #666">${pub.cidade}</span><br/>`
      if (pub.grupoCampo) popupContent += `<span style="font-size: 12px"><strong>Grupo:</strong> ${pub.grupoCampo}</span><br/>`
      
      if (pub.etiquetas && pub.etiquetas.length > 0) {
        popupContent += '<div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">'
        pub.etiquetas.forEach(et => {
          popupContent += `<span style="background: ${et.cor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px">${et.nome}</span>`
        })
        popupContent += '</div>'
      }
      popupContent += '</div>'

      marker.bindPopup(popupContent)

      // Add click handler if interactive
      if (interactive && onMarkerClick) {
        marker.on('click', () => {
          onMarkerClick(pub)
        })
      }

      newMarkers.push(marker)
    })

    markersRef.current = newMarkers

    // Fit bounds if there are markers
    if (newMarkers.length > 0) {
      const group = L.featureGroup(newMarkers)
      const bounds = group.getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [L, publicadores, interactive, onMarkerClick])

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  return (
    <div 
      ref={containerRef}
      style={{ height: '100%', width: '100%', borderRadius: 4, cursor: interactive ? 'crosshair' : 'grab' }}
    />
  )
}
