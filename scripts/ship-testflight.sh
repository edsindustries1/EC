#!/usr/bin/env bash
# Builds the iOS app and uploads it to TestFlight.
#   scripts/ship-testflight.sh --api https://staging.example.com --build 30        build + upload
#   scripts/ship-testflight.sh --dry                                              archive only, no bump, no upload
# The web bundle is built with VITE_API_BASE_URL so the native app talks to the given server.
set -euo pipefail
cd "$(dirname "$0")/.."
API=""; BUILD=""; DRY=0
while [ $# -gt 0 ]; do case "$1" in
  --api) API="$2"; shift 2;; --build) BUILD="$2"; shift 2;; --dry) DRY=1; shift;; *) echo "unknown arg $1"; exit 1;; esac; done
[ "$DRY" = 1 ] || { [ -n "$API" ] && [ -n "$BUILD" ] || { echo "need --api URL and --build N"; exit 1; }; }

ASC_DIR=~/.appstoreconnect
KEY_ID=$(python3 -c "import json,glob;print(json.load(open(glob.glob('$ASC_DIR/*.json')[0]))['key_id'])")
ISSUER=$(python3 -c "import json,glob;print(json.load(open(glob.glob('$ASC_DIR/*.json')[0]))['issuer_id'])")
AUTH=(-allowProvisioningUpdates -authenticationKeyPath "$ASC_DIR/private_keys/AuthKey_$KEY_ID.p8" -authenticationKeyID "$KEY_ID" -authenticationKeyIssuerID "$ISSUER")
PBX=ios/App/App.xcodeproj/project.pbxproj

echo "== web bundle (API: ${API:-production default})"
if [ -n "$API" ]; then VITE_API_BASE_URL="$API" npm run build; else npm run build; fi
npx cap sync ios

if [ -n "$BUILD" ]; then
  sed -i '' -E "s/CURRENT_PROJECT_VERSION = [0-9]+;/CURRENT_PROJECT_VERSION = $BUILD;/g" "$PBX"
  echo "== build number set to $BUILD"
fi

rm -rf build/App.xcarchive build/export
echo "== archive"
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' \
  -archivePath build/App.xcarchive archive "${AUTH[@]}" -quiet
echo "== archived: build/App.xcarchive"
[ "$DRY" = 1 ] && { echo "dry run: not uploading"; exit 0; }

echo "== upload to App Store Connect"
xcodebuild -exportArchive -archivePath build/App.xcarchive -exportOptionsPlist scripts/ExportOptions.plist \
  -exportPath build/export "${AUTH[@]}"
echo "== uploaded build $BUILD. It appears in TestFlight after Apple processes it (5-15 min)."
