import { useCallback, useRef, useState, useEffect } from "react";
import classNames from "classnames";

type Props = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  id?: string;
};

export function Slider({
  className,
  value,
  onChange,
  min = 0,
  max = 240,
  step = 20,
  disabled = false,
  id,
}: Props) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle input change with debounce
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      setLocalValue(newValue); // Update local state immediately for smooth UI
      
      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      // Set new timeout for debounced onChange call
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, 500);
    },
    [onChange]
  );

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      step={step}
      value={localValue}
      disabled={disabled}
      className={classNames(
        "w-full accent-theme-primary bg-theme-primary rounded-lg cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      onChange={handleChange}
    />
  );
}
