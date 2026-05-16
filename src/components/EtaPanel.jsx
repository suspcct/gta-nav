import { WAYPOINT } from '../constants/gtaColors'

function formatDuration(seconds) {
  const totalMin = Math.max(1, Math.round(seconds / 60))
  if (totalMin < 60) return `${totalMin} dk`
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  return mins === 0 ? `${hours} sa` : `${hours} sa ${mins} dk`
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

const panelStyle = {
  position: 'fixed',
  top: '76px',
  right: 16,
  background: 'rgba(20, 20, 25, 0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${WAYPOINT}66`,
  borderRadius: 12,
  padding: '12px 16px',
  minWidth: 160,
  maxWidth: 240,
  zIndex: 20,
  fontFamily: 'system-ui, sans-serif',
  boxSizing: 'border-box',
}

const durationStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: 'rgba(240, 240, 235, 0.95)',
  lineHeight: 1.2,
}

const distanceStyle = {
  fontSize: 13,
  color: 'rgba(150, 150, 145, 0.8)',
  marginTop: 2,
  lineHeight: 1.2,
}

const nameStyle = {
  fontSize: 12,
  color: `${WAYPOINT}CC`,
  fontStyle: 'italic',
  marginTop: 8,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const statusStyle = {
  fontSize: 13,
  color: 'rgba(150, 150, 145, 0.8)',
  lineHeight: 1.2,
}

const errorStyle = {
  ...statusStyle,
  color: 'rgba(255, 110, 110, 0.85)',
}

export default function EtaPanel({
  duration,
  distance,
  destinationName,
  loading,
  error,
}) {
  if (loading) {
    return (
      <div style={panelStyle}>
        <div style={statusStyle}>Rota hesaplanıyor...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div style={panelStyle}>
        <div style={errorStyle}>Rota bulunamadı</div>
      </div>
    )
  }
  if (duration == null || distance == null) return null

  return (
    <div style={panelStyle}>
      <div style={durationStyle}>{formatDuration(duration)}</div>
      <div style={distanceStyle}>{formatDistance(distance)}</div>
      {destinationName && <div style={nameStyle}>{destinationName}</div>}
    </div>
  )
}
