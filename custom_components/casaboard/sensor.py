"""Sensor platform for CasaBoard."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.sensor import (
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .api import CasaBoardStatus
from .const import DOMAIN
from .coordinator import CasaBoardCoordinator


@dataclass(frozen=True, kw_only=True)
class CasaBoardSensorEntityDescription(SensorEntityDescription):
    """Describes a CasaBoard sensor."""

    value_fn: Callable[[CasaBoardStatus], StateType]


SENSORS: tuple[CasaBoardSensorEntityDescription, ...] = (
    CasaBoardSensorEntityDescription(
        key="pages",
        translation_key="pages",
        icon="mdi:file-document-multiple",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda status: status.pages,
    ),
    CasaBoardSensorEntityDescription(
        key="ha_connection",
        translation_key="ha_connection",
        icon="mdi:home-assistant",
        value_fn=lambda status: "connected" if status.ha_connected else "disconnected",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up CasaBoard sensors."""
    coordinator: CasaBoardCoordinator = entry.runtime_data
    async_add_entities(
        CasaBoardSensor(coordinator, entry.entry_id, description)
        for description in SENSORS
    )


class CasaBoardSensor(CoordinatorEntity[CasaBoardCoordinator], SensorEntity):
    """Sensor backed by CasaBoard health data."""

    entity_description: CasaBoardSensorEntityDescription
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: CasaBoardCoordinator,
        entry_id: str,
        description: CasaBoardSensorEntityDescription,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{entry_id}_{description.key}"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry_id)},
            "name": "CasaBoard",
            "manufacturer": "CasaBoard",
            "model": "Self-hosted dashboard",
            "configuration_url": coordinator.base_url,
        }

    @property
    def native_value(self) -> StateType:
        """Return the sensor value."""
        if not self.coordinator.data:
            return None
        return self.entity_description.value_fn(self.coordinator.data)
