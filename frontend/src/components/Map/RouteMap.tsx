import { useEffect, useRef } from "react"
import L from "leaflet"
import { useTheme } from "next-themes"

interface RouteStop {
  id: string
  latitude: number
  longitude: number
  customerName: string
  address?: string
  order: number // 1-indexed stop number
  status?: string
}

interface RouteMapProps {
  warehouse: { latitude: number; longitude: number; name?: string }
  stops: RouteStop[]
  className?: string
  color?: string
}

export function RouteMap({
  warehouse,
  stops,
  className = "h-[500px] w-full rounded-xl overflow-hidden shadow-inner border border-border/80",
  color = "#0ea5e9", // Sky blue default
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerGroupRef = useRef<L.FeatureGroup | null>(null)
  const pathGroupRef = useRef<L.FeatureGroup | null>(null)
  const { resolvedTheme } = useTheme()

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current).setView(
      [warehouse.latitude, warehouse.longitude],
      11
    )

    mapRef.current = map
    markerGroupRef.current = L.featureGroup().addTo(map)
    pathGroupRef.current = L.featureGroup().addTo(map)

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

    const isDark = resolvedTheme === "dark"
    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map)
  }, [resolvedTheme])

  // Update Route path and markers
  useEffect(() => {
    const map = mapRef.current
    const markerGroup = markerGroupRef.current
    const pathGroup = pathGroupRef.current
    if (!map || !markerGroup || !pathGroup) return

    markerGroup.clearLayers()
    pathGroup.clearLayers()

    const bounds = L.latLngBounds([])

    // 1. Warehouse Marker
    const warehouseLatLng = L.latLng(warehouse.latitude, warehouse.longitude)
    bounds.extend(warehouseLatLng)

    const warehouseIcon = L.divIcon({
      html: `
        <div class="flex items-center justify-center size-10 rounded-lg border-2 border-amber-500/60 bg-amber-500 text-white font-extrabold text-xs shadow-lg ring-4 ring-amber-500/20">
          🏢
        </div>
      `,
      className: "custom-leaflet-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    })

    L.marker(warehouseLatLng, { icon: warehouseIcon })
      .bindPopup(
        `<div class="p-2 font-sans"><div class="font-bold text-sm text-foreground">Depot / Warehouse</div><div class="text-xs text-muted-foreground mt-0.5">${warehouse.name || "Main Logistics Center"}</div></div>`,
        { closeButton: false }
      )
      .addTo(markerGroup)

    // Sort stops by order
    const sortedStops = [...stops].sort((a, b) => a.order - b.order)
    const polylineCoords: L.LatLng[] = [warehouseLatLng]

    // 2. Stops Markers
    sortedStops.forEach((stop) => {
      const stopLatLng = L.latLng(stop.latitude, stop.longitude)
      bounds.extend(stopLatLng)
      polylineCoords.push(stopLatLng)

      const stopIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center size-8 rounded-full border-2 border-sky-500 bg-sky-500 text-white font-bold text-xs shadow-md ring-4 ring-sky-500/20 transform transition hover:scale-115">
            ${stop.order}
          </div>
        `,
        className: "custom-leaflet-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      })

      L.marker(stopLatLng, { icon: stopIcon })
        .bindPopup(
          `<div class="p-2 font-sans">
            <div class="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span class="size-5 rounded bg-primary text-white flex items-center justify-center text-[10px]">#${stop.order}</span>
              ${stop.customerName}
            </div>
            ${stop.address ? `<div class="text-xs text-muted-foreground mt-1">${stop.address}</div>` : ""}
            ${stop.status ? `<div class="mt-2"><span class="text-[9px] font-extrabold bg-accent text-accent-foreground px-1.5 py-0.5 rounded">${stop.status}</span></div>` : ""}
          </div>`,
          { closeButton: false }
        )
        .addTo(markerGroup)
    })

    // Return to warehouse
    if (sortedStops.length > 0) {
      polylineCoords.push(warehouseLatLng)
    }

    // 3. Draw Polyline route path
    if (polylineCoords.length > 1) {
      L.polyline(polylineCoords, {
        color: color,
        weight: 4,
        opacity: 0.8,
        lineJoin: "round",
        dashArray: "1, 10", // Dotted/dashed active effect
      }).addTo(pathGroup)

      // Solid underlying line for smoothness
      L.polyline(polylineCoords, {
        color: color,
        weight: 4,
        opacity: 0.3,
        lineJoin: "round",
      }).addTo(pathGroup)

      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [warehouse, stops, color])

  return <div ref={mapContainerRef} className={className} />
}
