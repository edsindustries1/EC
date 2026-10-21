#!/bin/sh
# Local demo of the dispatch integration: the app (API + built web app) on
# http://localhost:3001 and the mock dispatch trip log on http://localhost:4100.
#   npm run demo:dispatch            start (builds the web app if needed)
#   npm run demo:dispatch -- --reset start with empty demo data
set -e
cd "$(dirname "$0")/.."

if [ "$1" = "--reset" ]; then
  rm -f server/data/db.json dev/mock-dispatch/data.json
  echo "Demo data cleared."
fi
[ -f dist/index.html ] || npm run build

export DISPATCH_ENABLED=true
export DISPATCH_BRIDGE_URL=http://localhost:4100
export DISPATCH_BRIDGE_KEY=ec-app
export DISPATCH_BRIDGE_SECRET=dev-bridge-secret
export DISPATCH_POLL_SECONDS=20
unset DATABASE_URL

node dev/mock-dispatch/server.js &
MOCK=$!
trap 'kill $MOCK 2>/dev/null' EXIT INT TERM

echo ""
echo "  Customer app   http://localhost:3001      (customer@test.com / customer123)"
echo "  Operator view  http://localhost:3001/operator/dispatch   (operator@everywheretransfers.com / operator123)"
echo "  Trip log mock  http://localhost:4100"
echo ""
PORT=3001 node server/index.js
