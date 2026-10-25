"""The CasaBoard Home Assistant integration."""

from __future__ import annotations

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, SERVICE_REFRESH
from .coordinator import CasaBoardCoordinator

PLATFORMS: list[Platform] = [Platform.BINARY_SENSOR, Platform.SENSOR]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

SERVICE_REFRESH_SCHEMA = vol.Schema({vol.Optional("entry_id"): cv.string})

type CasaBoardConfigEntry = ConfigEntry[CasaBoardCoordinator]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the CasaBoard integration (YAML not supported)."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: CasaBoardConfigEntry) -> bool:
    """Set up CasaBoard from a config entry."""
    coordinator = CasaBoardCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    if not hass.services.has_service(DOMAIN, SERVICE_REFRESH):

        async def async_handle_refresh(call: ServiceCall) -> None:
            """Refresh CasaBoard status for matching config entries."""
            entry_id = call.data.get("entry_id")
            for config_entry in hass.config_entries.async_entries(DOMAIN):
                if entry_id and config_entry.entry_id != entry_id:
                    continue
                if not hasattr(config_entry, "runtime_data"):
                    continue
                coord: CasaBoardCoordinator = config_entry.runtime_data
                await coord.async_request_refresh()

        hass.services.async_register(
            DOMAIN,
            SERVICE_REFRESH,
            async_handle_refresh,
            schema=SERVICE_REFRESH_SCHEMA,
        )

    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: CasaBoardConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    remaining = [
        e
        for e in hass.config_entries.async_entries(DOMAIN)
        if e.entry_id != entry.entry_id and e.state.loaded
    ]
    if not remaining and hass.services.has_service(DOMAIN, SERVICE_REFRESH):
        hass.services.async_remove(DOMAIN, SERVICE_REFRESH)

    return unload_ok
