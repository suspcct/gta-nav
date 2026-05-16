import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gta-nav-favorites-v1';
const MAX_RECENTS = 6;

const DEFAULT_STATE = { favorites: [], recents: [] };

function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recents: Array.isArray(parsed.recents) ? parsed.recents : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function safeSave(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('[useFavorites] save failed', err);
  }
}

export default function useFavorites() {
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    setState(safeLoad());
  }, []);

  const addRecent = useCallback((destination) => {
    if (!destination || destination.lng == null || destination.lat == null) return;
    setState((prev) => {
      // Aynı konum varsa kaldır (dedup, ~10m tolerans)
      const filtered = prev.recents.filter((r) => {
        const dLng = Math.abs(r.lng - destination.lng);
        const dLat = Math.abs(r.lat - destination.lat);
        return dLng > 0.0001 || dLat > 0.0001;
      });
      const entry = {
        lng: destination.lng,
        lat: destination.lat,
        label: destination.label || destination.address || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`,
        timestamp: Date.now(),
      };
      const next = {
        ...prev,
        recents: [entry, ...filtered].slice(0, MAX_RECENTS),
      };
      safeSave(next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, recents: [] };
      safeSave(next);
      return next;
    });
  }, []);

  return {
    favorites: state.favorites,
    recents: state.recents,
    addRecent,
    clearRecents,
  };
}
