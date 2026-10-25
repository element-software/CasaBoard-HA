# CasaBoard

![Version][version-shield]
![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Ingress][ingress-shield]
![Kiosk port][kiosk-shield]
![License][license-shield]

Open-source, self-hosted dashboard builder for Home Assistant. Drag-and-drop editing, local-only storage, no cloud account.

## Features

- **Ingress UI**: open CasaBoard from the Home Assistant sidebar (Open Web UI). Home Assistant handles sign-in.
- **Drag-and-drop editor**: pages, sidebars and themes, stored in the App's `/data` volume.
- **Kiosk port (optional)**: full-screen `/dashboard/<page>` URLs for wall tablets such as Fully Kiosk Browser.
- **Updates**: new versions appear under **Settings → System → Updates**.

## Kiosk / wall tablets

Under **Settings → Apps → CasaBoard → Configuration → Network**, set a host port, save, and restart the App. On the tablet open `http://<ha-ip>:<port>/dashboard/<page-slug>`. The port has no login — only enable it on a trusted network. Compose installs use `http://<host-ip>:3000/dashboard/<page-slug>` directly. See the **Documentation** tab for details.

Full documentation: [DOCS.md](./DOCS.md) · Website: [casaboard.dev/docs](https://casaboard.dev/docs) · Project: [github.com/element-software/CasaBoard-HA](https://github.com/element-software/CasaBoard-HA)

[version-shield]: https://img.shields.io/github/v/release/element-software/CasaBoard-HA?include_prereleases&label=version
[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[ingress-shield]: https://img.shields.io/badge/ingress-yes-41BDF5.svg?logo=home-assistant&logoColor=white
[kiosk-shield]: https://img.shields.io/badge/kiosk%20port-optional-8B5CF6.svg
[license-shield]: https://img.shields.io/github/license/element-software/CasaBoard-HA.svg
