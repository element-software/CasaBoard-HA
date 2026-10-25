# EntityAutocomplete Component

A generic autocomplete component that integrates with Home Assistant entities through HAKit hooks. This component allows users to search and select entities from their Home Assistant instance with a rich, theme-aware interface.

## Features

- **Generic Entity Support**: Works with any Home Assistant entity type
- **Domain Filtering**: Filter entities by specific domains (light, switch, sensor, etc.)
- **Search & Filter**: Real-time search through entity names and IDs
- **Theme Integration**: Fully integrated with the app's theme system
- **Entity State Display**: Shows current entity state with color-coded chips
- **Entity Icons**: Displays appropriate icons for each entity type
- **Puck Integration**: Ready to use in Puck editor configurations

## Usage

### Basic Usage

```tsx
import { EntityAutocomplete } from '@repo/ui/EntityAutocomplete';

function MyComponent() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  return (
    <EntityAutocomplete
      value={selectedEntity}
      onChange={setSelectedEntity}
      placeholder="Select an entity..."
      label="Entity"
    />
  );
}
```

### Domain-Specific Usage

```tsx
// Only show light entities
<EntityAutocomplete
  value={selectedLight}
  onChange={setSelectedLight}
  domain="light"
  label="Light Entity"
  description="Select a light to control"
/>

// Only show switch entities
<EntityAutocomplete
  value={selectedSwitch}
  onChange={setSelectedSwitch}
  domain="switch"
  label="Switch Entity"
  description="Select a switch to control"
/>
```

### In Puck Editor Configuration

```tsx
// Light.config.tsx
export const LightConfig = {
  label: "Light",
  fields: {
    entityId: {
      type: "custom",
      label: "Light Entity",
      description: "Select a light entity from your Home Assistant",
      render: ({ value, onChange }) => (
        <EntityField
          value={value}
          onChange={onChange}
          domain="light"
          label="Light Entity"
          description="Select a light entity from your Home Assistant"
        />
      ),
    },
  },
  // ... other config
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | - | Currently selected entity ID |
| `onChange` | `(entityId: string \| null) => void` | - | Callback when selection changes |
| `domain` | `string` | - | Filter entities by domain (light, switch, etc.) |
| `placeholder` | `string` | "Select an entity..." | Placeholder text |
| `label` | `string` | - | Field label |
| `description` | `string` | - | Field description |
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Whether the field is disabled |
| `allowClear` | `boolean` | `true` | Whether to show clear button |
| `showEntityState` | `boolean` | `true` | Whether to show entity state chip |
| `showEntityIcon` | `boolean` | `true` | Whether to show entity icon |

## EntityField Component

The `EntityField` component is a simplified wrapper around `EntityAutocomplete` designed specifically for use in Puck editor configurations:

```tsx
import { EntityField } from '@repo/ui/EntityAutocomplete/EntityField';

<EntityField
  value={value}
  onChange={onChange}
  domain="light"
  label="Light Entity"
  description="Select a light entity"
/>
```

## Supported Entity Domains

The component includes icons and styling for the following entity domains:

- `light` - Light entities
- `switch` - Switch entities  
- `sensor` - Sensor entities
- `binary_sensor` - Binary sensor entities
- `alarm_control_panel` - Alarm entities
- `climate` - Climate/thermostat entities
- `fan` - Fan entities
- `camera` - Camera entities
- `lock` - Lock entities
- `cover` - Cover entities (doors, windows, etc.)
- `water_heater` - Water heater entities
- `fire` - Fire detection entities
- `car` - Car entities
- `media_player` - Media player entities
- `tv` - TV entities
- `network` - Network entities
- `battery` - Battery entities
- `automation` - Automation entities
- `script` - Script entities
- `scene` - Scene entities

## Examples

### Creating a Custom Component with Entity Selection

```tsx
// MyComponent.config.tsx
import { EntityField } from '@repo/ui/EntityAutocomplete/EntityField';

export const MyComponentConfig = {
  label: "My Component",
  fields: {
    entityId: {
      type: "custom",
      label: "Entity",
      render: ({ value, onChange }) => (
        <EntityField
          value={value}
          onChange={onChange}
          domain="sensor" // Only show sensor entities
          label="Sensor Entity"
        />
      ),
    },
  },
  // ... rest of config
};
```

### Multi-Domain Selection

```tsx
// Allow selection from multiple domains
<EntityAutocomplete
  value={selectedEntity}
  onChange={setSelectedEntity}
  // No domain specified = shows all entities
  label="Any Entity"
  description="Select any entity from your Home Assistant"
/>
```

## Styling

The component automatically adapts to the current theme and provides:

- Consistent color scheme based on entity state
- Hover effects and transitions
- Responsive design
- Accessible keyboard navigation
- Clear visual hierarchy

## Dependencies

- `@heroui/react` - UI components
- `@mdi/react` - Icons
- Custom theme system
