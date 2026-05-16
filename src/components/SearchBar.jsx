import { useRef, useState } from 'react'
import useGeocoding from '../hooks/useGeocoding'
import { WAYPOINT } from '../constants/gtaColors'

const containerStyle = {
  position: 'fixed',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90vw',
  maxWidth: 480,
  zIndex: 20,
  fontFamily: 'system-ui, sans-serif',
}

const inputBaseStyle = {
  width: '100%',
  background: 'rgba(20, 20, 25, 0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  color: 'rgba(240, 240, 235, 0.95)',
  padding: '12px 44px 12px 16px',
  borderRadius: 12,
  fontFamily: 'system-ui, sans-serif',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const iconStyle = {
  position: 'absolute',
  right: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  opacity: 0.6,
  pointerEvents: 'none',
}

const dropdownStyle = {
  marginTop: 4,
  background: 'rgba(20, 20, 25, 0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 12,
  border: `1px solid ${WAYPOINT}33`,
  overflow: 'hidden',
}

const rowPrimaryStyle = {
  color: 'rgba(240, 240, 235, 0.95)',
  fontSize: 14,
  lineHeight: 1.3,
}

const rowDetailStyle = {
  color: 'rgba(150, 150, 145, 0.6)',
  fontSize: 12,
  marginTop: 2,
  lineHeight: 1.3,
}

function ResultRow({ feature, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const [primary, ...rest] = (feature.place_name || '').split(',')
  const detail = rest.join(',').trim()
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(feature)}
      style={{
        padding: '10px 16px',
        cursor: 'pointer',
        background: hovered ? `${WAYPOINT}1A` : 'transparent',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={rowPrimaryStyle}>{primary}</div>
      {detail && <div style={rowDetailStyle}>{detail}</div>}
    </div>
  )
}

export default function SearchBar({ userLocation, onSelectDestination, recents = [], onSelectRecent }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const blurTimerRef = useRef(null)

  const { results } = useGeocoding(query, userLocation)

  const handleSelect = (feature) => {
    const [lng, lat] = feature.center
    setQuery(feature.place_name)
    setFocused(false)
    onSelectDestination({ lng, lat }, feature.place_name)
  }

  const handleFocus = () => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current)
      blurTimerRef.current = null
    }
    setFocused(true)
  }

  const handleBlur = () => {
    blurTimerRef.current = setTimeout(() => {
      setFocused(false)
      blurTimerRef.current = null
    }, 200)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setFocused(false)
      e.target.blur()
    }
  }

  const inputStyle = {
    ...inputBaseStyle,
    border: focused
      ? `2px solid ${WAYPOINT}`
      : `1px solid ${WAYPOINT}66`,
  }

  const trimmedQuery = query.trim()
  const showSuggestions = focused && trimmedQuery.length > 0 && results.length > 0
  const showRecents = focused && trimmedQuery.length === 0 && recents.length > 0
  const showDropdown = showSuggestions || showRecents

  return (
    <div style={containerStyle}>
      <div style={{ position: 'relative' }}>
        <input
          id="gta-search-input"
          name="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Nereye gidiyoruz?"
          style={inputStyle}
          autoComplete="off"
          spellCheck={false}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          style={iconStyle}
          aria-hidden="true"
        >
          <path
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            fill="none"
            stroke="rgba(240, 240, 235, 0.95)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showDropdown && (
        <div style={dropdownStyle}>
          {showRecents ? (
            <>
              <div
                style={{
                  padding: '8px 14px 6px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(240,240,240,0.45)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                Son Hedefler
              </div>
              {recents.map((recent, i) => (
                <div
                  key={`recent-${i}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setFocused(false)
                    onSelectRecent?.(recent)
                  }}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: 'rgba(240,240,240,0.92)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 76, 242, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ opacity: 0.55, fontSize: '11px' }}>↻</span>
                  <span
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {recent.label}
                  </span>
                </div>
              ))}
            </>
          ) : (
            results.map((feature) => (
              <ResultRow
                key={feature.id}
                feature={feature}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
