import { useState, useEffect } from 'react';

const STAR_PATH = "M12 2 L14.5 8.5 L21 9 L16 13.5 L17.5 20 L12 16.5 L6.5 20 L8 13.5 L3 9 L9.5 8.5 Z";

// Türkiye KTK Madde 51 hız aşımı ceza sistemine göre eşikler.
// Şehir içi 50 km/h temel limit baz alınarak hesaplandı.
// Hysteresis için her tier'da 3 km/h pay bırakıldı (zangırdamayı önler).
const THRESHOLDS = [
  { up: 55, down: 52 }, // %10 aşım — tolerans bitti, ceza başlıyor
  { up: 60, down: 57 }, // %20 aşım
  { up: 65, down: 62 }, // %30 aşım — orta ceza tier'ı
  { up: 70, down: 67 }, // %40 aşım
  { up: 75, down: 72 }, // %50+ aşım — ağır ceza + ehliyet riski
];

function computeStars(kmh, current) {
  let next = current;
  while (next < 5 && kmh >= THRESHOLDS[next].up) next++;
  while (next > 0 && kmh < THRESHOLDS[next - 1].down) next--;
  return next;
}

export default function WantedLevel({ speedMs }) {
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const kmh = speedMs == null ? 0 : speedMs * 3.6;
    setStars((prev) => computeStars(kmh, prev));
  }, [speedMs]);

  if (stars === 0) return null;

  return (
    <>
      <style>{`
        @keyframes gtaWantedFlicker {
          0%   { opacity: 0;   transform: scale(1.6); }
          12%  { opacity: 1;   transform: scale(1);   }
          22%  { opacity: 0.3;                        }
          32%  { opacity: 1;                          }
          44%  { opacity: 0.5;                        }
          56%  { opacity: 1;                          }
          70%  { opacity: 0.8;                        }
          100% { opacity: 1;   transform: scale(1);   }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: '14px',
          right: '24px',
          display: 'flex',
          gap: '4px',
          zIndex: 6,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i < stars;
          return (
            <svg
              key={`${i}-${active}`}
              viewBox="0 0 24 24"
              width="26"
              height="26"
              style={{
                animation: active ? 'gtaWantedFlicker 1.3s ease-out' : 'none',
                filter: active
                  ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5)) drop-shadow(0 1px 2px rgba(0,0,0,0.9))'
                  : 'none',
                transition: 'filter 0.3s ease',
              }}
            >
              <path
                d={STAR_PATH}
                fill={active ? '#ffffff' : 'rgba(255,255,255,0.12)'}
                stroke={active ? 'rgba(0,0,0,0.55)' : 'none'}
                strokeWidth="0.5"
              />
            </svg>
          );
        })}
      </div>
    </>
  );
}
