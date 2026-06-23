# Television Controller

Control your Android TV / Google TV (Grundig, Sony, Philips, TCL, Nvidia Shield, Chromecast with Google TV, and more) from your computer through a clean web interface — all over your local network.

No developer mode, no ADB, no cables. Run it, pair with a code shown on your TV, and you have a full remote in the browser.

> Work in progress. This project is under active development.

## Features

- Auto-discovery of Android TVs on your network via mDNS
- Secure pairing using Google's official Android TV Remote Protocol v2 (6-digit on-screen code)
- Full remote: D-pad, OK, power, volume, mute, media keys, home and back
- Launch apps on the TV
- Clean, minimal interface with light and dark themes
- One-click start on Windows with `baslat.bat`

## Tech Stack

- Backend: Node.js, Express, [`androidtv-remote`](https://www.npmjs.com/package/androidtv-remote)
- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion

## Getting Started

Detailed instructions will be added once the launcher is ready.

```bash
# 1. Install dependencies
npm run install:all

# 2. Build the web UI
npm run build

# 3. Start the server
npm start
```

Then open http://localhost:3000 in your browser.

On Windows you will be able to simply double-click `baslat.bat`.

## Requirements

- A computer and an Android TV / Google TV on the same local network
- [Node.js](https://nodejs.org/) 18 or newer

## Notes

- Very old Linux/Zeasn-based Grundig models (non-Android) are not supported by this protocol.
- Powering the TV on while it is fully off may require Wake-on-LAN (planned as a future enhancement).

## License

MIT
