import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import useGeolocation from '../hooks/useGeolocation'
import UserPuck from './UserPuck'
import SearchBar from './SearchBar'
import DestinationMarker from './DestinationMarker'
import EtaPanel from './EtaPanel'
import useDirections from '../hooks/useDirections'
import useCurrentArea from '../hooks/useCurrentArea'
import useSpeedZoom from '../hooks/useSpeedZoom'
import useMapBearing from '../hooks/useMapBearing'
import useFavorites from '../hooks/useFavorites'
import AreaPopup from './AreaPopup'
import Speedometer from './Speedometer'
import Compass from './Compass'
import WantedLevel from './WantedLevel'
import { WAYPOINT } from '../constants/gtaColors'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// Sonradan kullanılacak GTA-style accent renkleri:
//   WAYPOINT = '#a44cf2'       (HUD_COLOUR_WAYPOINT — rota, gtaColors.js)
//   BLIP_CYAN = '#4DD0E1'      (mülk/servis blip)
//   BLIP_ORANGE = '#FF9B33'    (sidequest blip)
//   BLIP_GREEN = '#66BB6A'     (keşif/gizli blip)
//   PUCK_PURPLE = '#9D4EDD'   (kullanıcı puck — şu an aktif)
const GTA_PALETTE = {
  background: '#2A2A2C',
  water: '#171F2E',
  motorway: '#F2EFE7',
  trunk: '#F2EFE7',
  primary: '#D6D6D2',
  secondary: '#A8A8A4',
  tertiary: '#777774',
  street: '#555552',
  minor: '#3F3F3C',
  building: '#3A3A40',
  buildingOutline: '#2E2E34',
  parkGreen: '#1F2620',
  labelPrimary: 'rgba(220, 220, 215, 0.9)',
  labelSecondary: 'rgba(150, 150, 145, 0.6)',
}

const roadColorExpression = [
  'match',
  ['get', 'class'],
  'motorway', GTA_PALETTE.motorway,
  'motorway_link', GTA_PALETTE.motorway,
  'trunk', GTA_PALETTE.motorway,
  'trunk_link', GTA_PALETTE.motorway,
  'primary', GTA_PALETTE.primary,
  'primary_link', GTA_PALETTE.primary,
  'secondary', GTA_PALETTE.secondary,
  'secondary_link', GTA_PALETTE.secondary,
  'tertiary', GTA_PALETTE.tertiary,
  'tertiary_link', GTA_PALETTE.tertiary,
  'street', GTA_PALETTE.street,
  'street_limited', GTA_PALETTE.street,
  'minor', GTA_PALETTE.minor,
  'service', GTA_PALETTE.minor,
  'track', GTA_PALETTE.minor,
  GTA_PALETTE.street,
]

const roadWidthExpression = [
  'interpolate',
  ['exponential', 1.5],
  ['zoom'],
  5,
  [
    'match',
    ['get', 'class'],
    'motorway', 0.4,
    'trunk', 0.4,
    0,
  ],
  8,
  [
    'match',
    ['get', 'class'],
    'motorway', 1,
    'trunk', 1,
    'motorway_link', 0.5,
    'trunk_link', 0.5,
    'primary', 0.5,
    0,
  ],
  11,
  [
    'match',
    ['get', 'class'],
    'motorway', 1.8,
    'trunk', 1.8,
    'motorway_link', 1.2,
    'trunk_link', 1.2,
    'primary', 1.3,
    'primary_link', 1.3,
    'secondary', 1,
    'secondary_link', 1,
    'tertiary', 0.6,
    'street', 0.3,
    0.2,
  ],
  14,
  [
    'match',
    ['get', 'class'],
    'motorway', 3,
    'trunk', 3,
    'motorway_link', 2,
    'trunk_link', 2,
    'primary', 2.2,
    'primary_link', 2.2,
    'secondary', 1.8,
    'secondary_link', 1.8,
    'tertiary', 1.5,
    'tertiary_link', 1.5,
    'street', 1.2,
    'street_limited', 1.2,
    'minor', 1,
    'service', 0.8,
    1,
  ],
  18,
  [
    'match',
    ['get', 'class'],
    'motorway', 6,
    'trunk', 6,
    'motorway_link', 4,
    'trunk_link', 4,
    'primary', 4,
    'primary_link', 4,
    'secondary', 3,
    'secondary_link', 3,
    'tertiary', 2.5,
    'tertiary_link', 2.5,
    'street', 2,
    'street_limited', 2,
    'minor', 1.8,
    'service', 1.5,
    2,
  ],
]

const SIMPLE_ROAD_LAYERS = new Set([
  'road-simple',
  'bridge-simple',
  'tunnel-simple',
])

function applyGTAPalette(map) {
  const trySet = (kind, layerId, prop, value) => {
    try {
      if (kind === 'paint') {
        map.setPaintProperty(layerId, prop, value)
      } else {
        map.setLayoutProperty(layerId, prop, value)
      }
    } catch (err) {
      console.warn(
        `[GTA palette] ${kind} ${layerId}.${prop} skipped: ${err.message}`
      )
    }
  }

  const layers = map.getStyle()?.layers ?? []

  console.log(
    '[GTA palette] All layer IDs:',
    layers.map((l) => `${l.id} (${l.type})`)
  )

  const counters = {
    background: 0,
    water: 0,
    parks: 0,
    road: 0,
    bridge: 0,
    tunnel: 0,
    pedestrian: 0,
    building: 0,
    labels: 0,
    poi: 0,
  }

  for (const layer of layers) {
    const id = layer.id.toLowerCase()
    const type = layer.type

    if (type === 'background') {
      trySet('paint', layer.id, 'background-color', GTA_PALETTE.background)
      counters.background++
    }

    if (type === 'fill' && id.includes('water') && !id.includes('shadow')) {
      trySet('paint', layer.id, 'fill-color', GTA_PALETTE.water)
      counters.water++
    }

    if (
      type === 'fill' &&
      (layer.id === 'national-park' || layer.id === 'landuse')
    ) {
      trySet('paint', layer.id, 'fill-color', GTA_PALETTE.parkGreen)
      counters.parks++
    }

    if (type === 'fill' && id.includes('building')) {
      trySet('paint', layer.id, 'fill-color', GTA_PALETTE.building)
      trySet(
        'paint',
        layer.id,
        'fill-outline-color',
        GTA_PALETTE.buildingOutline
      )
      counters.building++
    }
    if (type === 'fill-extrusion' && id.includes('building')) {
      trySet(
        'paint',
        layer.id,
        'fill-extrusion-color',
        GTA_PALETTE.building
      )
      counters.building++
    }

    if (SIMPLE_ROAD_LAYERS.has(layer.id)) {
      trySet('paint', layer.id, 'line-color', roadColorExpression)
      trySet('paint', layer.id, 'line-width', roadWidthExpression)
      if (layer.id === 'road-simple') counters.road++
      else if (layer.id === 'bridge-simple') counters.bridge++
      else counters.tunnel++
    }

    if (layer.id === 'bridge-case-simple') {
      trySet('paint', layer.id, 'line-color', GTA_PALETTE.buildingOutline)
      trySet('paint', layer.id, 'line-width', roadWidthExpression)
    }

    if (
      type === 'line' &&
      (id.includes('pedestrian') ||
        id.includes('path') ||
        id.includes('steps'))
    ) {
      trySet('paint', layer.id, 'line-color', GTA_PALETTE.minor)
      counters.pedestrian++
    }

    if (
      type === 'symbol' &&
      (layer.id === 'settlement-major-label' ||
        layer.id === 'settlement-minor-label' ||
        layer.id === 'settlement-subdivision-label')
    ) {
      const size =
        layer.id === 'settlement-major-label'
          ? 14
          : layer.id === 'settlement-minor-label'
            ? 12
            : 10
      trySet('paint', layer.id, 'text-color', GTA_PALETTE.labelPrimary)
      trySet('layout', layer.id, 'text-letter-spacing', 0.15)
      trySet('layout', layer.id, 'text-transform', 'uppercase')
      trySet('layout', layer.id, 'text-size', size)
      counters.labels++
    }

    if (layer.id === 'road-label-simple') {
      trySet('paint', layer.id, 'text-color', GTA_PALETTE.labelSecondary)
      trySet('layout', layer.id, 'text-size', 9)
      try {
        map.setLayerZoomRange('road-label-simple', 14, 22)
      } catch (err) {
        console.warn(
          `[GTA palette] setLayerZoomRange road-label-simple failed: ${err.message}`
        )
      }
      counters.labels++
    }

    if (id.startsWith('poi') || id.startsWith('airport-label')) {
      trySet('layout', layer.id, 'visibility', 'none')
      counters.poi++
    }
  }

  console.log('[GTA palette] Applied counts:', counters)
}

const ROUTE_GLOW_WIDTH = [
  'interpolate',
  ['exponential', 1.5],
  ['zoom'],
  5, 1.2,
  11, 5.4,
  14, 9,
  18, 18,
]

const ROUTE_MAIN_WIDTH = [
  'interpolate',
  ['exponential', 1.5],
  ['zoom'],
  5, 0.6,
  11, 2.7,
  14, 4.5,
  18, 9,
]

const EMPTY_ROUTE_FEATURE = {
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: [] },
  properties: {},
}

function addRouteLayers(map) {
  try {
    if (map.getSource('route')) return

    map.addSource('route', {
      type: 'geojson',
      data: EMPTY_ROUTE_FEATURE,
    })

    const firstSymbol = map
      .getStyle()
      .layers.find((l) => l.type === 'symbol')?.id

    map.addLayer(
      {
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': WAYPOINT,
          'line-width': ROUTE_GLOW_WIDTH,
          'line-opacity': 0.35,
          'line-blur': 4,
        },
      },
      firstSymbol
    )

    map.addLayer(
      {
        id: 'route-main',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': WAYPOINT,
          'line-width': ROUTE_MAIN_WIDTH,
          'line-opacity': 0.95,
        },
      },
      firstSymbol
    )
  } catch (err) {
    console.warn(`[route] addRouteLayers failed: ${err.message}`)
  }
}

const overlayStyle = {
  position: 'fixed',
  top: 12,
  left: 12,
  padding: 8,
  background: 'rgba(0, 0, 0, 0.6)',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 12,
  borderRadius: 8,
  fontFamily: 'system-ui, sans-serif',
  zIndex: 10,
  pointerEvents: 'none',
}

export default function MapView() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const hasFlownRef = useRef(false)
  const [map, setMap] = useState(null)

  const { position, heading, speed, error } = useGeolocation()
  const [destination, setDestination] = useState(null)
  const userPosition = position ? { ...position, speed, heading } : null
  const currentArea = useCurrentArea(position)
  useSpeedZoom(mapRef.current, userPosition)
  useMapBearing(mapRef.current, userPosition?.heading, {
    speedMs: userPosition?.speed,
    minSpeedMs: 2.0, // 7.2 km/h altında bearing güncellenmez
  })
  const { recents, addRecent } = useFavorites()

  const {
    route,
    duration,
    distance,
    loading: routeLoading,
    error: routeError,
  } = useDirections(position, destination?.coords ?? null)

  useEffect(() => {
    if (!containerRef.current) return

    const m = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [28.9784, 41.0082],
      zoom: 12,
    })
    mapRef.current = m
    setMap(m)

    m.on('style.load', () => {
      applyGTAPalette(m)
      addRouteLayers(m)
    })

    return () => {
      m.remove()
      mapRef.current = null
      setMap(null)
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !position) return
    const center = [position.lng, position.lat]
    if (!hasFlownRef.current) {
      mapRef.current.flyTo({ center, zoom: 16 })
      hasFlownRef.current = true
    } else {
      mapRef.current.setCenter(center)
    }
  }, [position])

  useEffect(() => {
    if (!mapRef.current || !destination) return
    const dest = [destination.coords.lng, destination.coords.lat]
    if (position) {
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([position.lng, position.lat])
      bounds.extend(dest)
      mapRef.current.fitBounds(bounds, { padding: 100, duration: 800 })
    } else {
      mapRef.current.flyTo({ center: dest, zoom: 14 })
    }
    hasFlownRef.current = true
  }, [destination])

  useEffect(() => {
    if (destination && destination.coords) {
      addRecent({
        lng: destination.coords.lng,
        lat: destination.coords.lat,
        label: destination.name,
      })
    }
  }, [destination?.coords?.lng, destination?.coords?.lat])

  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    const source = m.getSource('route')
    if (!source) return
    if (route) {
      source.setData({
        type: 'Feature',
        geometry: route,
        properties: {},
      })
    } else {
      source.setData(EMPTY_ROUTE_FEATURE)
    }
  }, [route])

  let overlayMsg = null
  if (error) {
    overlayMsg =
      error.code === 1 ? 'Konum izni reddedildi' : 'Konum alınıyor...'
  } else if (!position) {
    overlayMsg = 'Konum alınıyor...'
  }

  return (
    <>
      <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
      {map && position && (
        <UserPuck map={map} position={position} heading={heading} />
      )}
      {map && destination && (
        <DestinationMarker map={map} position={destination.coords} />
      )}
      <SearchBar
        userLocation={position}
        onSelectDestination={(coords, name) =>
          setDestination({ coords, name })
        }
        recents={recents}
        onSelectRecent={(recent) =>
          setDestination({
            coords: { lng: recent.lng, lat: recent.lat },
            name: recent.label,
          })
        }
      />
      {destination && (
        <EtaPanel
          duration={duration}
          distance={distance}
          destinationName={destination.name}
          loading={routeLoading}
          error={routeError}
        />
      )}
      {overlayMsg && <div style={overlayStyle}>{overlayMsg}</div>}
      <AreaPopup
        areaName={currentArea.name}
        subName={currentArea.subName}
        changeKey={currentArea.key}
      />
      <Speedometer speedMs={userPosition?.speed} />
      {!destination && <Compass heading={userPosition?.heading} />}
      <WantedLevel speedMs={userPosition?.speed} />
    </>
  )
}
