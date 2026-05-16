import { useEffect, useRef } from 'react';

export default function useMapBearing(
  map,
  heading,
  { enabled = true, speedMs = null, minSpeedMs = 2.0 } = {}
) {
  const smoothedRef = useRef(null);
  const targetRef = useRef(heading);
  const speedRef = useRef(speedMs);
  const rafRef = useRef(null);
  const userInteractedAt = useRef(0);

  // Manual rotation pause
  useEffect(() => {
    if (!map) return;
    const onRotate = () => { userInteractedAt.current = Date.now(); };
    map.on('rotatestart', onRotate);
    return () => map.off('rotatestart', onRotate);
  }, [map]);

  // Heading & speed ref'ler
  useEffect(() => {
    if (heading != null && Number.isFinite(heading)) {
      targetRef.current = heading;
    }
  }, [heading]);

  useEffect(() => {
    speedRef.current = speedMs;
  }, [speedMs]);

  // rAF loop
  useEffect(() => {
    if (!enabled || !map) return;

    const PAUSE_AFTER_MANUAL_MS = 4000;
    const ALPHA = 0.15; // smoothing factor (artırıldı: 0.10 → 0.15, daha snappy)
    const DEADZONE_DEG = 0.3;

    const tick = () => {
      const stillPaused = Date.now() - userInteractedAt.current < PAUSE_AFTER_MANUAL_MS;
      const target = targetRef.current;
      const speed = speedRef.current;

      // Hareket gate'i: sadece gerçekten hareket halinde bearing güncelle.
      // Desktop'ta speed null → bearing değişmez (noise-bağımlı rastgele dönmeyi öldürür).
      // Mobile'da yavaş/dur durumunda da bearing değişmez (kırmızı ışık jitter'ı yok).
      const isMoving = speed != null && Number.isFinite(speed) && speed >= minSpeedMs;

      if (!stillPaused && isMoving && target != null && Number.isFinite(target)) {
        if (smoothedRef.current == null) {
          smoothedRef.current = target;
          map.setBearing(target);
        } else {
          let diff = target - smoothedRef.current;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;

          if (Math.abs(diff) > DEADZONE_DEG) {
            smoothedRef.current = (smoothedRef.current + ALPHA * diff + 360) % 360;
            map.setBearing(smoothedRef.current);
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [map, enabled, minSpeedMs]);
}
