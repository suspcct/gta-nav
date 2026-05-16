export default function Speedometer({ speedMs }) {
  const kmh = speedMs == null ? null : Math.max(0, Math.round(speedMs * 3.6));
  // GPS noise floor — 0–2 km/h pratik olarak durağan
  const stationary = kmh != null && kmh < 3;
  const display = kmh == null ? '—' : (stationary ? '0' : String(kmh));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '32px',
        right: '32px',
        background: 'rgba(20, 20, 24, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '14px 22px 12px',
        minWidth: '108px',
        textAlign: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.5)',
        zIndex: 5,
      }}
    >
      <div
        style={{
          fontSize: '42px',
          fontWeight: 600,
          color: kmh == null ? 'rgba(240,240,240,0.40)' : 'rgba(240,240,240,0.96)',
          lineHeight: 1,
          letterSpacing: '-0.5px',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {display}
      </div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'rgba(240,240,240,0.55)',
          marginTop: '4px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        km/s
      </div>
    </div>
  );
}
