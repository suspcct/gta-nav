import { useEffect, useRef, useState } from 'react'

const toRad = (deg) => (deg * Math.PI) / 180
const toDeg = (rad) => (rad * 180) / Math.PI

function computeBearing(prev, curr) {
  const φ1 = toRad(prev.lat)
  const φ2 = toRad(curr.lat)
  const Δλ = toRad(curr.lng - prev.lng)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export default function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [heading, setHeading] = useState(null)
  const [speed, setSpeed] = useState(null)
  const [error, setError] = useState(null)
  const prevRef = useRef(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError({ code: -1, message: 'Tarayıcı geolocation desteklemiyor' })
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const curr = {
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        }
        setPosition(curr)
        setSpeed(pos.coords.speed)
        setError(null)

        const gpsHeading = pos.coords.heading
        if (gpsHeading != null && !Number.isNaN(gpsHeading)) {
          setHeading(gpsHeading)
        } else if (prevRef.current) {
          const dLng = curr.lng - prevRef.current.lng
          const dLat = curr.lat - prevRef.current.lat
          if (dLng !== 0 || dLat !== 0) {
            setHeading(computeBearing(prevRef.current, curr))
          }
        }
        prevRef.current = curr
      },
      (err) => {
        setError(err)
      },
      { enableHighAccuracy: true }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { position, heading, speed, error }
}
