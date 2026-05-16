import { useEffect, useRef } from 'react';

const ZOOM_TABLE = [
  { maxKmh: 5,        zoom: 17.5 }, // yaya
  { maxKmh: 30,       zoom: 16.5 }, // şehir trafiği
  { maxKmh: 60,       zoom: 15.5 }, // ana yol
  { maxKmh: 100,      zoom: 14.5 }, // şehir otobanı
  { maxKmh: Infinity, zoom: 13.5 }, // yüksek hız
];

function speedToZoom(kmh) {
  for (const row of ZOOM_TABLE) {
    if (kmh <= row.maxKmh) return row.zoom;
  }
  return 13.5;
}

export default function useSpeedZoom(map, position, { enabled = true } = {}) {
  const userInteractedAt = useRef(0);
  const lastAppliedZoom = useRef(null);

  // Track manual interaction → pause auto-zoom briefly so we don't yank user
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();

    const markInteraction = () => { userInteractedAt.current = Date.now(); };

    container.addEventListener('mousedown', markInteraction);
    container.addEventListener('wheel', markInteraction, { passive: true });
    container.addEventListener('touchstart', markInteraction, { passive: true });

    return () => {
      container.removeEventListener('mousedown', markInteraction);
      container.removeEventListener('wheel', markInteraction);
      container.removeEventListener('touchstart', markInteraction);
    };
  }, [map]);

  // Apply zoom based on speed bracket changes
  useEffect(() => {
    if (!enabled || !map) return;
    if (position == null || position.speed == null) return;

    const PAUSE_MS = 5000;
    if (Date.now() - userInteractedAt.current < PAUSE_MS) return;

    const kmh = position.speed * 3.6;
    const targetZoom = speedToZoom(kmh);

    if (lastAppliedZoom.current !== targetZoom) {
      lastAppliedZoom.current = targetZoom;
      map.easeTo({ zoom: targetZoom, duration: 1500, essential: true });
    }
  }, [map, position?.speed, enabled]);
}
