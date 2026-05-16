import { useEffect, useRef, useState } from 'react'

export default function useDirections(origin, destination) {
  const originRef = useRef(origin)
  originRef.current = origin

  const [route, setRoute] = useState(null)
  const [duration, setDuration] = useState(null)
  const [distance, setDistance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!destination) {
      setRoute(null)
      setDuration(null)
      setDistance(null)
      setError(null)
      setLoading(false)
      return
    }

    const currentOrigin = originRef.current
    if (!currentOrigin) return

    const controller = new AbortController()
    let cancelled = false

    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      access_token: import.meta.env.VITE_MAPBOX_TOKEN,
      geometries: 'geojson',
      overview: 'full',
      language: 'tr',
      alternatives: 'false',
    })
    const coords = `${currentOrigin.lng},${currentOrigin.lat};${destination.lng},${destination.lat}`
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?${params.toString()}`

    ;(async () => {
      try {
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`Directions ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        const first = data.routes?.[0]
        if (!first) throw new Error('Rota bulunamadı')
        setRoute(first.geometry)
        setDuration(first.duration)
        setDistance(first.distance)
      } catch (err) {
        if (err.name === 'AbortError') return
        if (!cancelled) {
          setError(err)
          setRoute(null)
          setDuration(null)
          setDistance(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [destination])

  return { route, duration, distance, loading, error }
}
