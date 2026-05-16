import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { WAYPOINT, WAYPOINT_LIGHT } from '../constants/gtaColors';

const MARKER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-24 -24 48 48" overflow="visible">
  <circle r="16" fill="${WAYPOINT}" opacity="0.20">
    <animate attributeName="r" values="14;20;14" dur="2.5s" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.30;0.10;0.30" dur="2.5s" repeatCount="indefinite" />
  </circle>
  <circle r="11" fill="none" stroke="${WAYPOINT}" stroke-width="2" opacity="0.85" />
  <rect x="-5" y="-5" width="10" height="10" fill="#ffffff" stroke="#000000" stroke-width="1" transform="rotate(45)" />
</svg>
`;

export default function DestinationMarker({ map, position }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = MARKER_SVG;
      el.style.cssText = 'width:48px;height:48px;';

      markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([position.lng, position.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([position.lng, position.lat]);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, position]);

  return null;
}
