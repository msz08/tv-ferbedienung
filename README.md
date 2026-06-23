# Television Controller

Turn your computer into a remote for your TV. Television Controller runs a small app in your browser that detects your Android TV on the same network and lets you control it — navigation, volume, playback, power and more — without reaching for the physical remote or installing anything on the TV.

> Work in progress. Active development is ongoing.

## Overview

Lost the remote? Tired of switching devices? Television Controller gives you a full, on-screen remote right in your browser. Everything happens locally on your own network — there is no cloud account, no pairing app on your phone, and nothing extra to install on the television itself.

It speaks Google's official Android TV Remote protocol, the same one the Google Home app uses, so you don't need developer mode, ADB, or any cables.

## How it works

1. **Start it.** Run the launcher. It boots a small local server and opens the interface in your browser at `http://localhost:3000`.
2. **It finds your TV.** The app scans your local network and lists the Android TVs it discovers. You can also type the TV's IP address directly.
3. **Pair once.** Pick your TV and a 6-digit code appears on the screen. Enter it in the browser. The pairing is remembered, so you only do this the first time.
4. **Control it.** Use the on-screen remote — directional pad, OK, volume, mute, channels, media playback, home, back and power. Every press travels straight to your TV over your local network, instantly.

## Getting started

You only need [Node.js](https://nodejs.org/) 18 or newer installed.

**Windows** — double-click `start.bat`

**macOS / Linux** — run `./start.sh`

The first launch installs what it needs and builds the interface, then opens it in your browser automatically. Later launches start in seconds.

## Requirements

- A computer and an Android TV / Google TV on the **same local network**
- [Node.js](https://nodejs.org/) 18 or newer

## Supported TVs

Any Android TV or Google TV based television or device, including Grundig, Sony, Philips, TCL, Nvidia Shield and Chromecast with Google TV.

Very old Grundig models that are not Android-based (Linux/Zeasn) are not supported, since they don't speak the same remote protocol.

## Privacy

Nothing leaves your network. The connection is made directly to the TV, and the pairing certificate is stored locally on your machine and never shared.

## Screenshot

_Coming soon._

<!-- ![Television Controller](docs/screenshot.png) -->

## License

MIT
