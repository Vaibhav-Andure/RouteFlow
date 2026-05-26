import { useEffect, useRef, useState } from "react"
import L from "leaflet"

interface DeliveryMapProps {
  latitude?: number
  longitude?: number
  onLocationSelect: (lat: number, lng: number) => void
  center?: [number, number]
  zoom?: number
  className?: string
}

export function DeliveryMap({
  latitude,
  longitude,
  onLocationSelect,
  center = [40.7128, -74.0060], // Default NYC
  zoom = 13,
  className = "h-[300px] w-full rounded-lg border border-border shadow-inner overflow-hidden",
}: DeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isDark, setIsDark] = useState(false)

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const initialCenter: [number, number] = latitude && longitude 
      ? [latitude, longitude] 
      : center

    const map = L.map(mapContainerRef.current).setView(initialCenter, zoom)
    mapRef.current = map

    // Handle map clicks
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      onLocationSelect(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)))
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update Tiles based on Theme
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map)
  }, [isDark])

  // Update Marker Position
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current)
      markerRef.current = null
    }

    if (latitude && longitude) {
      const latLng = L.latLng(latitude, longitude)

      const pinIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center size-8 rounded-full border-2 border-primary bg-primary text-white font-bold text-xs shadow-lg ring-4 ring-primary/20 animate-bounce">
            📍
          </div>
        `,
        className: "custom-leaflet-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32], // Anchor at bottom of pin
      })

      markerRef.current = L.marker(latLng, { icon: pinIcon }).addTo(map)
      map.panTo(latLng)
    }
  }, [latitude, longitude])

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={className} />
      <div className="absolute bottom-2 left-2 z-[400] bg-background/90 backdrop-blur-sm border border-border text-[10px] text-muted-foreground font-semibold px-2 py-1 rounded shadow-sm pointer-events-none">
        Click anywhere on map to set coordinates
      </div>
    </div>
  )
}
