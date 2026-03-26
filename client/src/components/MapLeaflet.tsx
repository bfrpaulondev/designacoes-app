import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'

interface Publicador {
  id: string
  nome: string
  morada?: string
  cidade?: string
  latitude: number
  longitude: number
  grupoCampo?: string
  etiquetas: { nome: string; cor: string }[]
}

interface MapLeafletProps {
  publicadores: Publicador[]
  center: [number, number]
}

export default function MapLeaflet({ publicadores, center }: MapLeafletProps) {
  const [map, setMap] = useState<L.Map | null>(null)
  const [markers, setMarkers] = useState<L.Marker[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
      const L = await import('leaflet')

      // Fix for default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Create map if not exists
      if (!map) {
        const mapInstance = L.map('map-container').setView(center, 12)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstance)

        setMap(mapInstance)
      }
    }

    initMap()
  }, [center])

  useEffect(() => {
    if (!map || typeof window === 'undefined') return

    const updateMarkers = async () => {
      const L = await import('leaflet')

      // Clear existing markers
      markers.forEach(m => m.remove())
      const newMarkers: L.Marker[] = []

      // Add new markers
      publicadores.forEach(pub => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${pub.etiquetas[0]?.cor || '#F59E0B'};
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

        const marker = L.marker([pub.latitude, pub.longitude], { icon: customIcon })
          .addTo(map)

        // Create popup content
        let popupContent = `
          <div style="min-width: 200px">
            <strong style="font-size: 14px">${pub.nome}</strong><br/>
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
        newMarkers.push(marker)
      })

      setMarkers(newMarkers)
    }

    updateMarkers()
  }, [map, publicadores])

  return (
    <div 
      id="map-container" 
      style={{ height: '100%', width: '100%', borderRadius: 4 }}
    />
  )
}
