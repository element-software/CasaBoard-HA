# Custom Hooks

This directory contains custom React hooks for the CasaBoard application.

## useDebounce

A utility hook for debouncing function calls, particularly useful for slider interactions and search inputs.

### Basic Usage

```tsx
import { useDebounce } from '@repo/hooks/useDebounce';

function MyComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebounce((term: string) => {
    // This will only be called 300ms after the user stops typing
    performSearch(term);
  }, 300);
  
  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };
  
  return (
    <input 
      value={searchTerm}
      onChange={(e) => handleInputChange(e.target.value)}
    />
  );
}
```

### useDebouncedSlider

A specialized hook for debouncing slider values, commonly used in Home Assistant entity controls.

```tsx
import { useDebouncedSlider } from '@repo/hooks/useDebounce';

function LightComponent({ entityId, callService }) {
  const setBrightnessImmediate = useCallback((value: number, entityId: string) => {
    callService({
      domain: "light",
      service: "turn_on",
      target: { entity_id: entityId },
      serviceData: { brightness: value }
    });
  }, [callService]);
  
  // Debounce the brightness changes by 150ms
  const setBrightness = useDebouncedSlider(setBrightnessImmediate, 150);
  
  return (
    <Slider
      onChange={(value) => setBrightness(value, entityId)}
      // ... other props
    />
  );
}
```

### Parameters

- `callback`: The function to debounce
- `delay`: The delay in milliseconds (default: 150ms for sliders)

### Features

- **Automatic cleanup**: Timeouts are cleared when the component unmounts
- **Type safety**: Full TypeScript support with proper type inference
- **Flexible parameters**: Supports functions with any number of parameters
- **Performance optimized**: Prevents excessive API calls during rapid user interactions

### Use Cases

- **Slider controls**: Prevent multiple rapid API calls when dragging sliders
- **Search inputs**: Debounce search queries to avoid excessive API requests
- **Form validation**: Delay validation until user stops typing
- **Auto-save**: Save form data after user stops making changes
