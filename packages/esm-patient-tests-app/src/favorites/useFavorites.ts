import { useCallback, useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'openmrs.favorites';

function getSnapshot(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let cachedSnapshot = getSnapshot();
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emitChange() {
  cachedSnapshot = getSnapshot();
  listeners.forEach((l) => l());
}

function setFavorites(next: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitChange();
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, () => cachedSnapshot);

  const addFavorite = useCallback((uuid: string) => {
    const current = getSnapshot();
    if (!current.includes(uuid)) {
      setFavorites([...current, uuid]);
    }
  }, []);

  const removeFavorite = useCallback((uuid: string) => {
    setFavorites(getSnapshot().filter((id) => id !== uuid));
  }, []);

  const isFavorite = useCallback((uuid: string) => favorites.includes(uuid), [favorites]);

  return useMemo(
    () => ({ favorites, addFavorite, removeFavorite, isFavorite }),
    [favorites, addFavorite, removeFavorite, isFavorite],
  );
}
