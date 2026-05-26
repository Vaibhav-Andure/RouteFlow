import { useEffect, useRef } from "react"
import L from "leaflet"
import { useTheme } from "next-themes"

interface MapMarker {
  id: string
  latitude: number
  longitude: number
  title: string
  subtitle?: string
  status?: string
  type: "delivery" | "driver" | "warehouse"
}

interface MapViewProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  className?: string
  interactive?: boolean
}

export function MapView({
  markers,
  center = [40.7128, -74.0060], // Default NYC
  zoom = 12,
  className = "h-[450px] w-full rounded-xl overflow-hidden shadow-inner border border-border/80",
  interactive = true,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerGroupRef = useRef<L.FeatureGroup | null>(null)
  const { resolvedTheme } = useTheme()

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Create map
    const map = L.map(mapContainerRef.current, {
      zoomControl: interactive,
      doubleClickZoom: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      touchZoom: interactive,
    }).setView(center, zoom)

    mapRef.current = map
    markerGroupRef.current = L.featureGroup().addTo(map)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update Tile Layer based on theme
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Premium CartoDB Tile Layers (sleek, minimalistic, dark/light modes)
    const isDark = resolvedTheme === "dark"
    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

    const attribution = isDark
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

    L.tileLayer(tileUrl, { attribution }).addTo(map)
  }, [resolvedTheme])

  // Update Markers
  useEffect(() => {
    const map = mapRef.current
    const markerGroup = markerGroupRef.current
    if (!map || !markerGroup) return

    // Clear existing markers
    markerGroup.clearLayers()

    if (markers.length === 0) return

    const bounds = L.latLngBounds([])

    markers.forEach((marker) => {
      const { latitude, longitude, title, subtitle, status, type } = marker
      if (!latitude || !longitude) return

      const latLng = L.latLng(latitude, longitude)
      bounds.extend(latLng)

      // Create beautiful custom HTML DivIcon to match design system
      let colorClass = "bg-primary text-white"
      let borderClass = "border-primary/40 ring-primary/20"
      let iconInner = ""

      if (type === "warehouse") {
        colorClass = "bg-amber-500 text-white font-bold"
        borderClass = "border-amber-500/40 ring-amber-500/20"
        iconInner = "W"
      } else if (type === "driver") {
        colorClass = "bg-blue-600 text-white"
        borderClass = "border-blue-600/40 ring-blue-600/20"
        iconInner = "🚚"
      } else {
        // Delivery statuses
        switch (status?.toUpperCase()) {
          case "PENDING":
            colorClass = "bg-amber-500 text-white"
            borderClass = "border-amber-500/40 ring-amber-500/20"
            iconInner = "P"
            break
          case "IN_TRANSIT":
            colorClass = "bg-blue-500 text-white animate-pulse"
            borderClass = "border-blue-500/40 ring-blue-500/20"
            iconInner = "T"
            break
          case "DELIVERED":
            colorClass = "bg-emerald-500 text-white"
            borderClass = "border-emerald-500/40 ring-emerald-500/20"
            iconInner = "✓"
            break
          case "CANCELLED":
            colorClass = "bg-rose-500 text-white"
            borderClass = "border-rose-500/40 ring-rose-500/20"
            iconInner = "✕"
            break
          default:
            colorClass = "bg-slate-500 text-white"
            borderClass = "border-slate-500/40 ring-slate-500/20"
            iconInner = "•"
        }
      }

      const iconHtml = `
        <div class="flex items-center justify-center size-8 rounded-full border-2 ${borderClass} ring-4 ${colorClass} font-bold text-xs shadow-md transition-all duration-300 transform hover:scale-110">
          ${iconInner}
        </div>
      `

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      })

      const popupContent = `
        <div class="p-3 max-w-[200px] font-sans">
          <div class="text-sm font-bold text-foreground mb-1">${title}</div>
          ${subtitle ? `<div class="text-xs text-muted-foreground leading-relaxed">${subtitle}</div>` : ""}
          ${status ? `<div class="mt-2"><span class="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">${status}</span></div>` : ""}
        </div>
      `

      L.marker(latLng, { icon: customIcon })
        .bindPopup(popupContent, { closeButton: false, minWidth: 150 })
        .addTo(markerGroup)
    })

    // Fit bounds automatically
    if (markers.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] })
    } else if (markers.length === 1) {
      map.setView([markers[0].latitude, markers[0].longitude], zoom)
    }
  }, [markers])

  return (
    <div className="relative group/map">
      <div ref={mapContainerRef} className={className} />
    </div>
  )
}
