#!/bin/bash
# Double-click: builds the app and installs it directly on your plugged-in iPhone (about 1 minute).
cd "$(dirname "$0")"
bash scripts/install-iphone.sh
echo
read -n 1 -s -r -p "Press any key to close."
