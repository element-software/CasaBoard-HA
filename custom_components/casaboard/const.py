"""Constants for the CasaBoard integration."""

from __future__ import annotations

from datetime import timedelta
from typing import Final

DOMAIN: Final = "casaboard"

CONF_URL: Final = "url"
CONF_SCAN_INTERVAL: Final = "scan_interval"

DEFAULT_SCAN_INTERVAL: Final = 60
DEFAULT_CASABOARD_PORT: Final = 3000
DEFAULT_URL: Final = f"http://homeassistant.local:{DEFAULT_CASABOARD_PORT}"

MIN_SCAN_INTERVAL: Final = 15
MAX_SCAN_INTERVAL: Final = 3600

ATTR_PAGES: Final = "pages"
ATTR_HA_CONNECTED: Final = "ha_connected"
ATTR_HASS_URL: Final = "hass_url"
ATTR_URL: Final = "url"

SERVICE_REFRESH: Final = "refresh"

UPDATE_INTERVAL = timedelta(seconds=DEFAULT_SCAN_INTERVAL)
