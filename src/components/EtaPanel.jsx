import React from 'react';

export default function EtaPanel({ duration, distance, destinationName }) {
  if (duration == null || distance == null) return null;

  const minutes = Math.round(duration / 60);
  const km = (distance / 1000).toFixed(1);

  return (
    <div
      style={{
        position: 'absolute',
        top: '76px',
        left: '24px',
        right: '24px',
        background: 'rgba(20, 20, 24, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(164, 76, 242, 0.35)',
        borderRadius: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        zIndex: 5,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        fontFamily: 'Inter, system-ui, sans-serif',
        pointerEvents: 'none',
      }}
    >
      {/* Sol: Time + Distance */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexShrink: 0 }}>
        <span
          style={{
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.5px',
          }}
        >
          {minutes} dk
        </span>
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.55)',
            fontSize: '12px',
            fontWeight: 500,
            marginTop: '3px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {km} km
        </span>
      </div>

      {/* Dikey ayırıcı */}
      <div
        style={{
          width: '1px',
          height: '32px',
          background: 'rgba(255, 255, 255, 0.15)',
          flexShrink: 0,
        }}
      />

      {/* Sağ: Destination name */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          color: '#a44cf2',
          fontSize: '14px',
          fontStyle: 'italic',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {destinationName}
      </div>
    </div>
  );
}
