import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { WAYPOINT } from '../constants/gtaColors';

const PUCK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-20 -20 40 40" overflow="visible">
  <circle r="16" fill="${WAYPOINT}" opacity="0.15" />
  <circle r="10" fill="${WAYPOINT}" opacity="0.25" />
  <polygon points="0,-9 6,6 0,4 -6,6" fill="#000000" />
  <polygon points="0,-7 4.5,4.5 0,2.5 -4.5,4.5" fill="#ffffff" stroke="#000000" stroke-width="0.5" />
</svg>
`;

export default function UserPuck({ map, position, heading }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = PUCK_SVG;
      el.style.cssText = 'width:40px;height:40px;';

      markerRef.current = new mapboxgl.Marker({
        element: el,
        rotation: heading ?? 0,
        rotationAlignment: 'map',
        pitchAlignment: 'map',
      })
        .setLngLat([position.lng, position.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([position.lng, position.lat]);
      if (heading != null) {
        markerRef.current.setRotation(heading);
      }
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, position, heading]);

  return null;
}
