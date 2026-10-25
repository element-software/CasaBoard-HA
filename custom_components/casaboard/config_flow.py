"""Config flow for CasaBoard."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_URL
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.network import get_url

from .api import CasaBoardApiError, async_fetch_status, normalize_base_url
from .const import (
    CONF_SCAN_INTERVAL,
    DEFAULT_CASABOARD_PORT,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_URL,
    DOMAIN,
    MAX_SCAN_INTERVAL,
    MIN_SCAN_INTERVAL,
)


def default_casaboard_url(hass: HomeAssistant) -> str:
    """Suggest CasaBoard on the same host as Home Assistant (port 3000)."""
    try:
        ha_url = get_url(hass, prefer_external=False, allow_cloud=False)
    except HomeAssistantError:
        return DEFAULT_URL

    hostname = urlparse(ha_url).hostname
    if not hostname:
        return DEFAULT_URL

    if ":" in hostname:
        hostname = f"[{hostname}]"

    return f"http://{hostname}:{DEFAULT_CASABOARD_PORT}"


def _user_schema(defaults: dict[str, Any]) -> vol.Schema:
    """Schema for the user step, prefilled with defaults."""
    return vol.Schema(
        {
            vol.Required(CONF_URL, default=defaults[CONF_URL]): str,
            vol.Optional(
                CONF_SCAN_INTERVAL, default=defaults[CONF_SCAN_INTERVAL]
            ): vol.All(
                vol.Coerce(int),
                vol.Range(min=MIN_SCAN_INTERVAL, max=MAX_SCAN_INTERVAL),
            ),
        }
    )


class CasaBoardConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for CasaBoard."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            url = normalize_base_url(user_input[CONF_URL].strip())
            await self.async_set_unique_id(url.lower())
            self._abort_if_unique_id_configured()

            try:
                await async_fetch_status(self.hass, url)
            except CasaBoardApiError:
                errors["base"] = "cannot_connect"
            else:
                return self.async_create_entry(
                    title="CasaBoard",
                    data={
                        CONF_URL: url,
                        CONF_SCAN_INTERVAL: user_input.get(
                            CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
                        ),
                    },
                )

        defaults: dict[str, Any] = {
            CONF_URL: default_casaboard_url(self.hass),
            CONF_SCAN_INTERVAL: DEFAULT_SCAN_INTERVAL,
        }
        if user_input is not None:
            defaults.update(user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=_user_schema(defaults),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow handler."""
        return CasaBoardOptionsFlow()


class CasaBoardOptionsFlow(OptionsFlow):
    """Handle CasaBoard options."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage CasaBoard options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        entry = self.config_entry
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_SCAN_INTERVAL,
                        default=entry.options.get(
                            CONF_SCAN_INTERVAL,
                            entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                        ),
                    ): vol.All(
                        vol.Coerce(int),
                        vol.Range(min=MIN_SCAN_INTERVAL, max=MAX_SCAN_INTERVAL),
                    ),
                }
            ),
        )
