import { useState, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readWithFallback(key, fallback));

  const setter = (value: SetStateAction<T>) => {
    setValue(() => {
      const previous = readWithFallback(key, fallback);
      const next = value instanceof Function ? value(previous) : value;

      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        console.warn('useLocalStorage: Failed to write value.', e);
      }

      return next;
    });
  };

  return [value, setter] as const;
}

function readWithFallback<T>(key: string, fallback: T) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn('useLocalStorage: Failed to read/deserialize value.', e);
    return fallback;
  }
}
