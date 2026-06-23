#!/usr/bin/env bash
# Television Controller launcher for macOS and Linux.
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo
  echo "  Node.js is not installed."
  echo "  Please install it from https://nodejs.org/ (version 18 or newer), then run this again."
  echo
  exit 1
fi

if [ ! -d server/node_modules ]; then
  echo "  Installing server dependencies..."
  npm --prefix server install
fi

if [ ! -d web/node_modules ]; then
  echo "  Installing web dependencies..."
  npm --prefix web install
fi

if [ ! -f web/dist/index.html ]; then
  echo "  Building the web interface..."
  npm --prefix web run build
fi

echo
echo "  Starting Television Controller at http://localhost:3000"
echo "  Press Ctrl+C to stop the server."
echo

# Open the browser once the server has had a moment to start.
(
  sleep 3
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:3000
  elif command -v open >/dev/null 2>&1; then
    open http://localhost:3000
  fi
) >/dev/null 2>&1 &

node server/index.js
