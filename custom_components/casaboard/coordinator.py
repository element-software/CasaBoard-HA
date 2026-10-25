"""DataUpdateCoordinator for CasaBoard."""

from __future__ import annotations

from datetime import timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import CasaBoardApiError, CasaBoardStatus, async_fetch_status, normalize_base_url
from .const import CONF_SCAN_INTERVAL, CONF_URL, DEFAULT_SCAN_INTERVAL, DOMAIN

_LOGGER = logging.getLogger(__name__)


class CasaBoardCoordinator(DataUpdateCoordinator[CasaBoardStatus]):
    """Poll CasaBoard `/api/health` on an interval."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        self.entry = entry
        self.base_url = normalize_base_url(entry.data[CONF_URL])
        scan_interval = entry.options.get(
            CONF_SCAN_INTERVAL,
            entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
        )
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            config_entry=entry,
            update_interval=timedelta(seconds=scan_interval),
        )

    async def _async_update_data(self) -> CasaBoardStatus:
        """Fetch latest status from CasaBoard."""
        try:
            return await async_fetch_status(self.hass, self.base_url)
        except CasaBoardApiError as err:
            raise UpdateFailed(str(err)) from err
