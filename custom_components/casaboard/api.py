"""CasaBoard API client and health polling."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession


class CasaBoardApiError(Exception):
    """Raised when the CasaBoard API cannot be reached or returns an error."""


@dataclass(slots=True)
class CasaBoardStatus:
    """Normalized status payload from CasaBoard `/api/health`."""

    ok: bool
    pages: int
    ha_connected: bool
    hass_url: str | None
    raw: dict[str, Any]


def normalize_base_url(url: str) -> str:
    """Strip trailing slash from a CasaBoard base URL."""
    return url.rstrip("/")


async def async_fetch_status(hass: HomeAssistant, base_url: str) -> CasaBoardStatus:
    """Fetch and validate `/api/health` from a CasaBoard instance."""
    session = async_get_clientsession(hass)
    url = f"{normalize_base_url(base_url)}/api/health"

    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
            if response.status != 200:
                raise CasaBoardApiError(f"HTTP {response.status} from {url}")
            data = await response.json(content_type=None)
    except TimeoutError as err:
        raise CasaBoardApiError(f"Timeout contacting {url}") from err
    except aiohttp.ClientError as err:
        raise CasaBoardApiError(f"Connection error contacting {url}: {err}") from err
    except ValueError as err:
        raise CasaBoardApiError(f"Invalid JSON from {url}") from err

    if not isinstance(data, dict) or not data.get("ok"):
        raise CasaBoardApiError(f"CasaBoard health check failed at {url}")

    return CasaBoardStatus(
        ok=True,
        pages=int(data.get("pages") or 0),
        ha_connected=bool(data.get("ha_connected")),
        hass_url=data.get("hass_url") if isinstance(data.get("hass_url"), str) else None,
        raw=data,
    )
