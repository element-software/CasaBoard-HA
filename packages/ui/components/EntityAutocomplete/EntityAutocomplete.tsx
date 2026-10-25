"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useEntities } from "@casaboard/ha";
import { Autocomplete, AutocompleteItem, Chip, Button } from "@heroui/react";
import Icon from "@mdi/react";
import {
  mdiMagnify,
  mdiClose,
  mdiLightbulb,
  mdiGauge,
  mdiMotionSensor,
  mdiShieldHome,
  mdiThermostat,
  mdiPower,
  mdiFan,
  mdiCamera,
  mdiLock,
  mdiDoor,
  mdiWindowOpen,
  mdiWater,
  mdiFire,
  mdiCar,
  mdiMusic,
  mdiTelevision,
  mdiWifi,
  mdiBattery,
  mdiCog,
  mdiAlert,
} from "@mdi/js";
import EntityIcon from "../Shared/util/EntityIcon";

export interface EntityOption {
  id: string;
  friendly_name: string;
  domain: string;
  state: string;
  icon: string;
  entity: any;
}

interface EntityAutocompleteProps {
  value?: string;
  onChange: (entityId: string | null) => void;
  domain?: string; // Filter by specific domain (light, switch, etc.)
  placeholder?: string;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showEntityState?: boolean;
  showEntityIcon?: boolean;
}

const DOMAIN_ICONS: Record<string, string> = {
  light: mdiLightbulb,
  switch: mdiPower,
  sensor: mdiGauge,
  binary_sensor: mdiMotionSensor,
  alarm_control_panel: mdiShieldHome,
  climate: mdiThermostat,
  fan: mdiFan,
  camera: mdiCamera,
  lock: mdiLock,
  cover: mdiDoor,
  window: mdiWindowOpen,
  water_heater: mdiWater,
  fire: mdiFire,
  car: mdiCar,
  media_player: mdiMusic,
  tv: mdiTelevision,
  network: mdiWifi,
  battery: mdiBattery,
  automation: mdiCog,
  script: mdiCog,
  scene: mdiCog,
  default: mdiAlert,
};

export const EntityAutocomplete: React.FC<EntityAutocompleteProps> = ({
  value,
  onChange,
  domain,
  placeholder = "Select an entity...",
  label,
  description,
  className,
  disabled = false,
  allowClear = true,
  showEntityState = true,
  showEntityIcon = true,
}) => {
  const entitiesList = useEntities(domain);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get all entities and filter by domain if specified
  const entityOptions = useMemo(() => {
    if (!entitiesList) return [];

    const entityArray = entitiesList.map(({ id, domain, entity }) => ({
      id,
      friendly_name: entity.attributes?.friendly_name || id,
      domain,
      state: entity.state,
      icon:
        entity.attributes?.icon || DOMAIN_ICONS[domain] || DOMAIN_ICONS.default,
      entity,
    }));

    return entityArray;
  }, [entitiesList]);

  // Keep the visible input text in sync when value comes from outside (e.g., initial load)
  useEffect(() => {
    if (value) {
      const selected = entityOptions.find((e) => e.id === value);
      if (selected) {
        setInputValue(selected.friendly_name);
      }
    }
    // Don't automatically clear input when value becomes null - let user interaction handle it
  }, [value, entityOptions]);

  // Filter entities based on search input
  const filteredEntities = useMemo(() => {
    if (!inputValue.trim()) return entityOptions;

    const searchTerm = inputValue.toLowerCase();
    return entityOptions.filter(
      (entity) =>
        entity.id.toLowerCase().includes(searchTerm) ||
        entity.friendly_name.toLowerCase().includes(searchTerm) ||
        entity.domain.toLowerCase().includes(searchTerm)
    );
  }, [entityOptions, inputValue]);

  const handleSelectionChange = useCallback(
    (key: React.Key | null) => {
      const entityId = key as string | null;
      onChange(entityId);
      setIsOpen(false);
      if (entityId) {
        const selected = entityOptions.find((e) => e.id === entityId);
        if (selected) setInputValue(selected.friendly_name);
      }
    },
    [onChange, entityOptions]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange(null);
    setIsOpen(false);
  }, [onChange]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open && !value) {
      // Only clear input when closing and no value is selected
      setInputValue("");
    }
  }, [value]);

  return (
    <div className={`w-full ${className || ""}`}>
      <Autocomplete
        label={label}
        placeholder={placeholder}
        description={description}
        selectedKey={value ?? null}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSelectionChange={handleSelectionChange}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        allowsCustomValue={false}
        startContent={
          <Icon
            path={mdiMagnify}
            className="h-4 w-4 text-default-400"
          />
        }
        endContent={
          allowClear &&
          value && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleClear}
              className="h-6 w-6 min-w-6"
            >
              <Icon
                path={mdiClose}
                className="h-3 w-3"
              />
            </Button>
          )
        }
        classNames={{
          base: "w-full",
          listbox: "max-h-60",
        }}
        listboxProps={{
          emptyContent: inputValue
            ? "No entities found"
            : "Start typing to search...",
        }}
        itemHeight={64}
      >
        {filteredEntities.map((entity) => (
          <AutocompleteItem
            key={entity.id}
            textValue={entity.friendly_name}
            className="flex items-center gap-3 py-2"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {showEntityIcon && (
                <div className="flex-shrink-0">
                  <EntityIcon
                    entity={entity.entity}
                    className="h-5 w-5"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-medium truncate"
                  >
                    {entity.friendly_name}
                  </span>
                  {showEntityState && (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="flex-shrink-0"
                    >
                      {entity.state}
                    </Chip>
                  )}
                </div>
                <div
                  className="text-xs truncate"
                >
                  {entity.id}
                </div>
              </div>
            </div>
          </AutocompleteItem>
        ))}
      </Autocomplete>
    </div>
  );
};

export default EntityAutocomplete;
