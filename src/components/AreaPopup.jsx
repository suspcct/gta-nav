import { useEffect, useState } from 'react';

export default function AreaPopup({ areaName, subName, changeKey }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!areaName || changeKey === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [changeKey, areaName]);

  if (!areaName || changeKey === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '110px',
        left: '24px',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-24px)',
        transition: visible
          ? 'opacity 0.45s ease-out, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
          : 'opacity 0.7s ease-in, transform 0.7s ease-in',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          fontFamily: '"Pacifico", cursive',
          fontSize: '44px',
          color: 'rgba(240,240,240,0.96)',
          textShadow: '0 3px 12px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,1)',
          lineHeight: 1,
          letterSpacing: '0.5px',
        }}
      >
        {areaName}
      </div>
      {subName && subName !== areaName && (
        <div
          style={{
            fontFamily: '"Pacifico", cursive',
            fontSize: '20px',
            color: 'rgba(220,220,215,0.80)',
            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
            marginTop: '6px',
            letterSpacing: '0.3px',
          }}
        >
          {subName}
        </div>
      )}
    </div>
  );
}
