import { useState, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      console.warn('Unhandled error in useLocalStorage. Failed to read persisted value.', e);
      return initialValue;
    }
  });

  const setter = (value: SetStateAction<T>) => {
    try {
      setValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Unhandled error in useLocalStorage. Value most likely not persisted.', e);
    }
  };

  return [value, setter] as const;
}
