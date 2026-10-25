import { 
  mdiLightbulb, 
  mdiGauge, 
  mdiThermometer,
  mdiMotionSensor,
  mdiMotionSensorOff,
  mdiDoor,
  mdiDoorOpen,
  mdiDoorClosed,
  mdiShieldHome,
  mdiShieldAlert,
  mdiThermostat,
  mdiPropaneTank,
  mdiLightSwitch,
  mdiToggleSwitch,
  mdiWindowOpen,
  mdiWindowClosed,
  mdiSmokeDetector,
  mdiSecurity,
  mdiCarBattery,
  mdiWaterPercent,
  mdiEye,
  mdiLock,
  mdiLockOpen,
  mdiVibrate,
  mdiHeartPulse,
  mdiLightRecessed,
  mdiTrackLight,
  mdiLedStripVariant,
  mdiCeilingLight,
  mdiFloorLamp,
  mdiDeskLamp,
  mdiLightbulbOutline,
  mdiPower,
  mdiElectricSwitch,
  mdiAirConditioner,
  mdiRadiator,
  mdiHvac,
  mdiHomeAssistant,
  mdiDevices,
  mdiCog,
  mdiStove,
  mdiFileCabinet,
  mdiDiamondStone,
  mdiTableFurniture,
  mdiWashingMachine,
  mdiTumbleDryer,
  mdiToasterOven,
  mdiMicrowave
} from '@mdi/js';

export interface EntityIconConfig {
  path: string;
  name: string;
}

// State-based styling utility
const getStateClassName = (entity: any) => {
  if (!entity || !entity.state) return "text-gray-400";
  
  switch (entity.state) {
    case "on":
    case "open":
    case "unlocked":
    case "home":
    case "detected":
      return "text-theme-primary";
    case "off":
    case "closed":
    case "locked":
    case "away":
    case "clear":
      return "text-theme-secondary";
    case "unavailable":
    case "unknown":
      return "text-theme-error";
    default:
      return "text-theme-primary";
  }
};

// Enhanced entity type to icon mapping
const ENTITY_TYPE_ICONS: Record<string, EntityIconConfig> = {
  // Lights
  light: { path: mdiLightbulb, name: 'mdiLightbulb' },
  
  // Sensors
  sensor: { path: mdiGauge, name: 'mdiGauge' },
  
  // Binary sensors (will be refined by device_class)
  binary_sensor: { path: mdiMotionSensor, name: 'mdiMotionSensor' },
  
  // Alarms
  alarm_control_panel: { path: mdiShieldHome, name: 'mdiShieldHome' },
  
  // Climate
  climate: { path: mdiThermostat, name: 'mdiThermostat' },
  
  // Switches
  switch: { path: mdiLightSwitch, name: 'mdiLightSwitch' },
  
  // Input boolean
  input_boolean: { path: mdiToggleSwitch, name: 'mdiToggleSwitch' },
  
  // Locks
  lock: { path: mdiLock, name: 'mdiLock' },
  
  // Covers
  cover: { path: mdiWindowClosed, name: 'mdiWindowClosed' },
  
  // Default
  default: { path: mdiHomeAssistant, name: 'mdiHomeAssistant' },
};

// Device class specific icons for binary sensors
const BINARY_SENSOR_DEVICE_CLASS_ICONS: Record<string, EntityIconConfig> = {
  // Motion/occupancy
  motion: { path: mdiMotionSensor, name: 'mdiMotionSensor' },
  occupancy: { path: mdiMotionSensor, name: 'mdiMotionSensor' },
  
  // Doors and windows
  door: { path: mdiDoor, name: 'mdiDoor' },
  window: { path: mdiWindowClosed, name: 'mdiWindowClosed' },
  opening: { path: mdiDoorOpen, name: 'mdiDoorOpen' },
  
  // Safety sensors
  smoke: { path: mdiSmokeDetector, name: 'mdiSmokeDetector' },
  gas: { path: mdiPropaneTank, name: 'mdiPropaneTank' },
  safety: { path: mdiSecurity, name: 'mdiSecurity' },
  
  // Moisture and water
  moisture: { path: mdiWaterPercent, name: 'mdiWaterPercent' },
  
  // Connectivity and power
  connectivity: { path: mdiHeartPulse, name: 'mdiHeartPulse' },
  battery: { path: mdiCarBattery, name: 'mdiCarBattery' },
  power: { path: mdiPower, name: 'mdiPower' },
  
  // Other
  vibration: { path: mdiVibrate, name: 'mdiVibrate' },
  presence: { path: mdiEye, name: 'mdiEye' },
  running: { path: mdiCog, name: 'mdiCog' },
};

// Sensor device class specific icons
const SENSOR_DEVICE_CLASS_ICONS: Record<string, EntityIconConfig> = {
  temperature: { path: mdiThermometer, name: 'mdiThermometer' },
  humidity: { path: mdiWaterPercent, name: 'mdiWaterPercent' },
  battery: { path: mdiCarBattery, name: 'mdiCarBattery' },
  power: { path: mdiPower, name: 'mdiPower' },
  energy: { path: mdiElectricSwitch, name: 'mdiElectricSwitch' },
};

// Light entity specific icon mapping based on friendly name or entity ID
const LIGHT_SPECIFIC_ICONS: Record<string, EntityIconConfig> = {
  // Look for keywords in friendly name or entity ID
  track: { path: mdiTrackLight, name: 'mdiTrackLight' },
  recessed: { path: mdiLightRecessed, name: 'mdiLightRecessed' },
  ceiling: { path: mdiCeilingLight, name: 'mdiCeilingLight' },
  floor: { path: mdiFloorLamp, name: 'mdiFloorLamp' },
  desk: { path: mdiDeskLamp, name: 'mdiDeskLamp' },
  strip: { path: mdiLedStripVariant, name: 'mdiLedStripVariant' },
  led: { path: mdiLedStripVariant, name: 'mdiLedStripVariant' },
  spot: { path: mdiLightRecessed, name: 'mdiLightRecessed' },
  pendant: { path: mdiLightbulbOutline, name: 'mdiLightbulbOutline' },
};

// Climate entity specific icon mapping
const CLIMATE_SPECIFIC_ICONS: Record<string, EntityIconConfig> = {
  heat: { path: mdiRadiator, name: 'mdiRadiator' },
  cool: { path: mdiAirConditioner, name: 'mdiAirConditioner' },
  ac: { path: mdiAirConditioner, name: 'mdiAirConditioner' },
  hvac: { path: mdiHvac, name: 'mdiHvac' },
};

/**
 * Map Home Assistant icon names (e.g., "lightbulb", "motion-sensor") to MDI paths
 * This provides comprehensive mapping for common HA icons
 */
function findMdiIconByName(iconName: string): string | null {
  // Convert kebab-case to underscore and normalize
  const normalizedName = iconName.toLowerCase().replace(/-/g, '_');
  
  // Common icon mappings from HA format to MDI paths
  const iconMappings: Record<string, string> = {
    // Lights
    'lightbulb': mdiLightbulb,
    'lightbulb_outline': mdiLightbulbOutline,
    'track_light': mdiTrackLight,
    'light_recessed': mdiLightRecessed,
    'ceiling_light': mdiCeilingLight,
    'floor_lamp': mdiFloorLamp,
    'desk_lamp': mdiDeskLamp,
    'led_strip': mdiLedStripVariant,
    'led_strip_variant': mdiLedStripVariant,
    
    // Sensors  
    'gauge': mdiGauge,
    'thermometer': mdiThermometer,
    'water_percent': mdiWaterPercent,
    'car_battery': mdiCarBattery,
    'power': mdiPower,
    'electric_switch': mdiElectricSwitch,
    
    // Binary sensors
    'motion_sensor': mdiMotionSensor,
    'motion_sensor_off': mdiMotionSensorOff,
    'door': mdiDoor,
    'door_open': mdiDoorOpen,
    'door_closed': mdiDoorClosed,
    'window_open': mdiWindowOpen,
    'window_closed': mdiWindowClosed,
    'smoke_detector': mdiSmokeDetector,
    'security': mdiSecurity,
    'propane_tank': mdiPropaneTank,
    'vibrate': mdiVibrate,
    'eye': mdiEye,
    'heart_pulse': mdiHeartPulse,
    
    // Locks
    'lock': mdiLock,
    'lock_open': mdiLockOpen,
    
    // Alarms
    'shield_home': mdiShieldHome,
    'shield_alert': mdiShieldAlert,
    
    // Climate
    'thermostat': mdiThermostat,
    'air_conditioner': mdiAirConditioner,
    'radiator': mdiRadiator,
    'hvac': mdiHvac,
    
    // Switches
    'light_switch': mdiLightSwitch,
    'toggle_switch': mdiToggleSwitch,
    
    // General
    'cog': mdiCog,
    'home_assistant': mdiHomeAssistant,
    'devices': mdiDevices,
    'stove': mdiStove,
    'diamond_stone': mdiDiamondStone,
    'file_cabinet': mdiFileCabinet,
    'table_furniture': mdiTableFurniture,
    'washing_machine': mdiWashingMachine,
    'tumble_dryer': mdiTumbleDryer,
    'toaster_oven': mdiToasterOven,
  };
  
  return iconMappings[normalizedName] || null;
}

/**
 * Get the appropriate icon configuration for an entity based on its type, device class, and entity attributes
 */
export function getEntityIcon(entity: any): { path: string; className: string } {
  const defaultClassName = getStateClassName(entity);
  
  if (!entity || !entity.entity_id) {
    return {
      path: mdiHomeAssistant,
      className: defaultClassName
    };
  }

  // Extract entity type from entity_id
  const entityType = entity.entity_id.split('.')[0];
  const entityId = entity.entity_id.toLowerCase();
  const friendlyName = entity.attributes?.friendly_name?.toLowerCase() || '';
  const deviceClass = entity.attributes?.device_class?.toLowerCase();

  let iconPath = mdiHomeAssistant; // default

  // PRIORITY 1: Check if entity has a custom icon attribute from Home Assistant
  if (entity.attributes?.icon) {
    // Try to map Home Assistant icon format (mdi:icon-name) to MDI paths
    const iconMatch = entity.attributes.icon.match(/mdi:(.+)/);
    if (iconMatch) {
      const iconName = iconMatch[1];
      // Try to find a matching MDI icon in our predefined mappings
      const mappedIcon = findMdiIconByName(iconName);
      if (mappedIcon) {
        return {
          path: mappedIcon,
          className: defaultClassName
        };
      }
      // If we can't map it, fall through to auto-detection
    }
  }

  // PRIORITY 2: Auto-detect icon based on entity type, device class, and attributes
  // Handle specific entity types with special logic
  switch (entityType) {
    case 'binary_sensor':
      // Check device class first
      if (deviceClass) {
        switch (deviceClass) {
          case 'motion':
          case 'occupancy':
            iconPath = entity.state === 'on' ? mdiMotionSensor : mdiMotionSensorOff;
            break;
          case 'door':
            iconPath = entity.state === 'on' ? mdiDoorOpen : mdiDoorClosed;
            break;
          case 'window':
            iconPath = entity.state === 'on' ? mdiWindowOpen : mdiWindowClosed;
            break;
          case 'opening':
            iconPath = mdiDoorOpen;
            break;
          case 'smoke':
            iconPath = mdiSmokeDetector;
            break;
          case 'gas':
            iconPath = mdiPropaneTank;
            break;
          case 'safety':
            iconPath = mdiSecurity;
            break;
          case 'moisture':
            iconPath = mdiWaterPercent;
            break;
          case 'connectivity':
            iconPath = mdiHeartPulse;
            break;
          case 'battery':
            iconPath = mdiCarBattery;
            break;
          case 'power':
            iconPath = mdiPower;
            break;
          case 'vibration':
            iconPath = mdiVibrate;
            break;
          case 'presence':
            iconPath = mdiEye;
            break;
          case 'running':
            iconPath = mdiCog;
            break;
          default:
            iconPath = mdiMotionSensor;
        }
      } else {
        // Fall back to keyword matching in entity ID or friendly name
        if (entityId.includes('door') || friendlyName.includes('door')) {
          iconPath = entity.state === 'on' ? mdiDoorOpen : mdiDoorClosed;
        } else if (entityId.includes('window') || friendlyName.includes('window')) {
          iconPath = entity.state === 'on' ? mdiWindowOpen : mdiWindowClosed;
        } else if (entityId.includes('motion') || friendlyName.includes('motion')) {
          iconPath = entity.state === 'on' ? mdiMotionSensor : mdiMotionSensorOff;
        } else {
          iconPath = mdiMotionSensor;
        }
      }
      break;

    case 'sensor':
      // Check device class first
      if (deviceClass) {
        switch (deviceClass) {
          case 'temperature':
            iconPath = mdiThermometer;
            break;
          case 'humidity':
            iconPath = mdiWaterPercent;
            break;
          case 'battery':
            iconPath = mdiCarBattery;
            break;
          case 'power':
            iconPath = mdiPower;
            break;
          case 'energy':
            iconPath = mdiElectricSwitch;
            break;
          default:
            iconPath = mdiGauge;
        }
      } else {
        iconPath = mdiGauge;
      }
      break;

    case 'light':
      // Check for specific light types in entity ID or friendly name
      if (entityId.includes('track') || friendlyName.includes('track')) {
        iconPath = mdiTrackLight;
      } else if (entityId.includes('recessed') || friendlyName.includes('recessed')) {
        iconPath = mdiLightRecessed;
      } else if (entityId.includes('ceiling') || friendlyName.includes('ceiling')) {
        iconPath = mdiCeilingLight;
      } else if (entityId.includes('floor') || friendlyName.includes('floor')) {
        iconPath = mdiFloorLamp;
      } else if (entityId.includes('desk') || friendlyName.includes('desk')) {
        iconPath = mdiDeskLamp;
      } else if (entityId.includes('strip') || entityId.includes('led') || friendlyName.includes('strip') || friendlyName.includes('led')) {
        iconPath = mdiLedStripVariant;
      } else if (entityId.includes('spot') || friendlyName.includes('spot')) {
        iconPath = mdiLightRecessed;
      } else if (entityId.includes('pendant') || friendlyName.includes('pendant')) {
        iconPath = mdiLightbulbOutline;
      } else {
        iconPath = mdiLightbulb;
      }
      break;

    case 'climate':
      // Check for specific climate types
      if (entityId.includes('heat') || friendlyName.includes('heat')) {
        iconPath = mdiRadiator;
      } else if (entityId.includes('cool') || entityId.includes('ac') || friendlyName.includes('cool') || friendlyName.includes('ac')) {
        iconPath = mdiAirConditioner;
      } else if (entityId.includes('hvac') || friendlyName.includes('hvac')) {
        iconPath = mdiHvac;
      } else {
        iconPath = mdiThermostat;
      }
      break;

    case 'lock':
      iconPath = entity.state === 'unlocked' ? mdiLockOpen : mdiLock;
      break;

    case 'cover':
      if (deviceClass === 'window' || entityId.includes('window') || friendlyName.includes('window')) {
        iconPath = entity.state === 'open' ? mdiWindowOpen : mdiWindowClosed;
      } else {
        iconPath = mdiWindowClosed; // Generic cover
      }
      break;

    case 'alarm_control_panel':
      iconPath = entity.state === 'disarmed' ? mdiShieldHome : mdiShieldAlert;
      break;

    case 'switch':
      iconPath = mdiLightSwitch;
      break;

    case 'input_boolean':
      iconPath = mdiToggleSwitch;
      break;

    default:
      iconPath = mdiHomeAssistant;
  }

  return {
    path: iconPath,
    className: defaultClassName
  };
}

/**
 * Get icon name string for an entity (for use in config) - DEPRECATED
 * Use getEntityIcon() instead for consistent rendering
 */
export function getEntityIconName(entity: any): string {
  // This is kept for backward compatibility but should be phased out
  const iconConfig = getEntityIconConfig(entity);
  return iconConfig.name;
}

/**
 * Get icon path for an entity (for use in Icon component) - DEPRECATED  
 * Use getEntityIcon() instead for consistent rendering
 */
export function getEntityIconPath(entity: any): string {
  // This is kept for backward compatibility but should be phased out
  const iconConfig = getEntityIconConfig(entity);
  return iconConfig.path;
}

/**
 * Internal function to get icon config (for backward compatibility)
 */
function getEntityIconConfig(entity: any): EntityIconConfig {
  if (!entity || !entity.entity_id) {
    return ENTITY_TYPE_ICONS.default;
  }

  // Extract entity type from entity_id
  const entityType = entity.entity_id.split('.')[0];
  const entityId = entity.entity_id.toLowerCase();
  const friendlyName = entity.attributes?.friendly_name?.toLowerCase() || '';
  const deviceClass = entity.attributes?.device_class?.toLowerCase();

  // Check if entity has a custom icon class
  if (entity.attributes?.icon) {
    // Convert Home Assistant icon format (mdi:icon-name) to MDI format
    const iconMatch = entity.attributes.icon.match(/mdi:(.+)/);
    if (iconMatch) {
      // Convert kebab-case to camelCase and add mdi prefix
      const iconName = iconMatch[1].replace(/-([a-z])/g, (_: string, g: string) => g.toUpperCase());
      return { 
        path: '', // This would need to be mapped to actual MDI paths
        name: `mdi${iconName.charAt(0).toUpperCase() + iconName.slice(1)}` 
      };
    }
  }

  // Handle specific entity types with special logic
  switch (entityType) {
    case 'binary_sensor':
      // Check device class first
      if (deviceClass && BINARY_SENSOR_DEVICE_CLASS_ICONS[deviceClass]) {
        return BINARY_SENSOR_DEVICE_CLASS_ICONS[deviceClass];
      }
      
      // Fall back to keyword matching in entity ID or friendly name
      const binaryKeywords = Object.keys(BINARY_SENSOR_DEVICE_CLASS_ICONS);
      for (const keyword of binaryKeywords) {
        if (entityId.includes(keyword) || friendlyName.includes(keyword)) {
          return BINARY_SENSOR_DEVICE_CLASS_ICONS[keyword];
        }
      }
      
      return ENTITY_TYPE_ICONS.binary_sensor;

    case 'sensor':
      // Check device class first
      if (deviceClass && SENSOR_DEVICE_CLASS_ICONS[deviceClass]) {
        return SENSOR_DEVICE_CLASS_ICONS[deviceClass];
      }
      
      return ENTITY_TYPE_ICONS.sensor;

    case 'light':
      // Check for specific light types in entity ID or friendly name
      const lightKeywords = Object.keys(LIGHT_SPECIFIC_ICONS);
      for (const keyword of lightKeywords) {
        if (entityId.includes(keyword) || friendlyName.includes(keyword)) {
          return LIGHT_SPECIFIC_ICONS[keyword];
        }
      }
      
      return ENTITY_TYPE_ICONS.light;

    case 'climate':
      // Check for specific climate types
      const climateKeywords = Object.keys(CLIMATE_SPECIFIC_ICONS);
      for (const keyword of climateKeywords) {
        if (entityId.includes(keyword) || friendlyName.includes(keyword)) {
          return CLIMATE_SPECIFIC_ICONS[keyword];
        }
      }
      
      return ENTITY_TYPE_ICONS.climate;

    case 'lock':
      // Could check state to show locked/unlocked icons
      return ENTITY_TYPE_ICONS.lock;

    case 'cover':
      // Could check state and device_class for window/door/garage/curtain
      if (deviceClass === 'window' || entityId.includes('window') || friendlyName.includes('window')) {
        return { path: mdiWindowClosed, name: 'mdiWindowClosed' };
      }
      return ENTITY_TYPE_ICONS.cover;

    default:
      // Check if we have a mapping for this entity type
      if (ENTITY_TYPE_ICONS[entityType]) {
        return ENTITY_TYPE_ICONS[entityType];
      }
      
      return ENTITY_TYPE_ICONS.default;
  }
}


