import { useEffect, useState, useRef } from 'react';

export default function useCurrentArea(position) {
  const [area, setArea] = useState({ name: '', subName: '', key: 0 });
  const lastFetchPos = useRef(null);
  const lastAreaName = useRef('');
  const inflightRef = useRef(false);

  useEffect(() => {
    if (!position || inflightRef.current) return;

    // Throttle: only fetch when moved > 150m since last fetch
    if (lastFetchPos.current) {
      const d = haversineKm(
        lastFetchPos.current.lat, lastFetchPos.current.lng,
        position.lat, position.lng
      );
      if (d < 0.15) return;
    }

    const fetchArea = async () => {
      inflightRef.current = true;
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.lng},${position.lat}.json?access_token=${token}&language=tr&types=neighborhood,locality`;
        const res = await fetch(url);
        const data = await res.json();

        const neighborhood = data.features?.find(f => f.place_type?.includes('neighborhood'));
        const locality = data.features?.find(f => f.place_type?.includes('locality'));

        const name = neighborhood?.text || locality?.text || '';
        const subName = (neighborhood && locality) ? locality.text : '';

        if (name && name !== lastAreaName.current) {
          lastAreaName.current = name;
          setArea(prev => ({ name, subName, key: prev.key + 1 }));
        }
        lastFetchPos.current = position;
      } catch (err) {
        console.error('[useCurrentArea] geocoding failed', err);
      } finally {
        inflightRef.current = false;
      }
    };

    fetchArea();
  }, [position?.lng, position?.lat]);

  return area;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
