import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for debouncing function calls
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns Debounced version of the callback
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Custom hook for debouncing slider values with multiple parameters
 * @param callback The function to call with the debounced values
 * @param delay The delay in milliseconds (default: 150ms)
 * @returns Debounced callback function
 */
export function useDebouncedSlider<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 150
): T {
  return useDebounce(callback, delay);
}
