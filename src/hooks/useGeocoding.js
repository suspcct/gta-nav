import { useEffect, useState } from 'react'

export default function useGeocoding(query, userLocation) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const lng = userLocation?.lng
  const lat = userLocation?.lat

  useEffect(() => {
    if (!query || !query.trim()) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          access_token: import.meta.env.VITE_MAPBOX_TOKEN,
          country: 'tr',
          limit: '5',
          language: 'tr',
        })
        if (lng != null && lat != null) {
          params.set('proximity', `${lng},${lat}`)
        }
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?${params.toString()}`

        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`Geocoding ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        setResults(data.features ?? [])
        setError(null)
      } catch (err) {
        if (err.name === 'AbortError') return
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [query, lng, lat])

  return { results, loading, error }
}
