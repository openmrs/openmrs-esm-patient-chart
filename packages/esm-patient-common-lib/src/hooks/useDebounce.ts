import { useEffect, useRef, useState } from 'react';

/**
 * React hook that debounces a value by a specified delay.
 *
 * Why use this instead of lodash debounce directly?
 * - Works naturally with React state and re-renders
 * - Cleans up the timeout on unmount to prevent memory leaks
 * - Avoids the useMemo(() => debounce(...), []) anti-pattern, which
 *   leaks the debounced function if the component unmounts mid-debounce
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value, updated only after `delay` ms of inactivity
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // Only fires after 300ms of no typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
}
