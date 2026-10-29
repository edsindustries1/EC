#!/usr/bin/env bash
# Builds the app and installs it straight onto a connected iPhone: no upload, no TestFlight wait.
#   scripts/install-iphone.sh [--api https://staging-server]   (defaults to the Railway staging app server)
# The phone must be unlocked and on a cable (or the same Wi-Fi as this Mac), with Developer Mode on.
set -euo pipefail
cd "$(dirname "$0")/.."
API=https://app-server-production-cb90.up.railway.app
[ "${1:-}" = "--api" ] && API="$2"
DEVICE=${IPHONE_UDID:-00008150-0011110E3A6A401C}
ASC_DIR=~/.appstoreconnect
KEY_ID=$(python3 -c "import json,glob;print(json.load(open(glob.glob('$ASC_DIR/*.json')[0]))['key_id'])")
ISSUER=$(python3 -c "import json,glob;print(json.load(open(glob.glob('$ASC_DIR/*.json')[0]))['issuer_id'])")

xcrun devicectl list devices 2>/dev/null | grep "$DEVICE" | grep -qv unavailable \
  || { echo "iPhone not reachable: unlock it and plug it into this Mac (or join the same Wi-Fi)."; exit 1; }

echo "== web bundle (API: $API)"
VITE_API_BASE_URL="$API" npm run build >/dev/null
npx cap sync ios >/dev/null

echo "== build (development signing)"
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -destination "id=$DEVICE" \
  -derivedDataPath build/device-dd -allowProvisioningUpdates \
  -authenticationKeyPath "$ASC_DIR/private_keys/AuthKey_$KEY_ID.p8" -authenticationKeyID "$KEY_ID" -authenticationKeyIssuerID "$ISSUER" \
  build -quiet
APP=$(ls -d build/device-dd/Build/Products/Debug-iphoneos/*.app | head -1)

echo "== install + launch"
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" com.everywheretransfers.app >/dev/null && echo "Installed and opened on the iPhone."
