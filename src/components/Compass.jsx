import { FRIENDLY } from '../constants/gtaColors';

const DIRECTIONS = [
  { angle: 0,   label: 'N',  major: true  },
  { angle: 45,  label: 'NE', major: false },
  { angle: 90,  label: 'E',  major: true  },
  { angle: 135, label: 'SE', major: false },
  { angle: 180, label: 'S',  major: true  },
  { angle: 225, label: 'SW', major: false },
  { angle: 270, label: 'W',  major: true  },
  { angle: 315, label: 'NW', major: false },
];

const STRIP_WIDTH = 280;
const VISIBLE_RANGE_DEG = 120; // ±60° görünür
const PX_PER_DEG = STRIP_WIDTH / VISIBLE_RANGE_DEG;

export default function Compass({ heading = 0 }) {
  const safeHeading = Number.isFinite(heading) ? heading : 0;

  // Wrap-around için 3x duplicate (-360 / 0 / +360)
  const items = [];
  for (const offset of [-360, 0, 360]) {
    for (const d of DIRECTIONS) {
      const pos = ((d.angle + offset) - safeHeading) * PX_PER_DEG + STRIP_WIDTH / 2;
      if (pos > -20 && pos < STRIP_WIDTH + 20) {
        items.push({ ...d, pos });
      }
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '130px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${STRIP_WIDTH}px`,
        height: '28px',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 4,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        }}
      >
        {items.map((d, i) => (
          <div
            key={`${d.label}-${i}`}
            style={{
              position: 'absolute',
              left: `${d.pos}px`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: d.major ? '13px' : '9.5px',
              fontWeight: d.major ? 700 : 500,
              color: d.label === 'N' ? FRIENDLY : 'rgba(240,240,240,0.72)',
              letterSpacing: '1.2px',
              whiteSpace: 'nowrap',
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
      {/* Aşağı dönük center tick */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '-7px',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '6px solid rgba(240,240,240,0.9)',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
        }}
      />
    </div>
  );
}
