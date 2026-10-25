"""Binary sensor platform for CasaBoard."""

from __future__ import annotations

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTR_HASS_URL, ATTR_URL, DOMAIN
from .coordinator import CasaBoardCoordinator

ENTITY_DESCRIPTION = BinarySensorEntityDescription(
    key="online",
    translation_key="online",
    device_class=BinarySensorDeviceClass.CONNECTIVITY,
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up CasaBoard binary sensors."""
    coordinator: CasaBoardCoordinator = entry.runtime_data
    async_add_entities([CasaBoardOnlineBinarySensor(coordinator, entry.entry_id)])


class CasaBoardOnlineBinarySensor(
    CoordinatorEntity[CasaBoardCoordinator], BinarySensorEntity
):
    """Connectivity binary sensor for a CasaBoard instance."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: CasaBoardCoordinator, entry_id: str) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.entity_description = ENTITY_DESCRIPTION
        self._attr_unique_id = f"{entry_id}_online"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry_id)},
            "name": "CasaBoard",
            "manufacturer": "CasaBoard",
            "model": "Self-hosted dashboard",
            "configuration_url": coordinator.base_url,
        }

    @property
    def available(self) -> bool:
        """Keep the connectivity entity available so offline shows as off."""
        return True

    @property
    def is_on(self) -> bool:
        """Return True when CasaBoard is reachable."""
        return self.coordinator.last_update_success and bool(
            self.coordinator.data and self.coordinator.data.ok
        )

    @property
    def extra_state_attributes(self) -> dict[str, str | None]:
        """Expose CasaBoard and linked HA URLs."""
        data = self.coordinator.data
        return {
            ATTR_URL: self.coordinator.base_url,
            ATTR_HASS_URL: data.hass_url if data else None,
        }
