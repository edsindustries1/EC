#!/bin/sh

# Xcode Cloud ci_post_clone.sh
#
# Runs after Xcode Cloud clones the repo, BEFORE xcodebuild starts.
# Sets up Node, installs npm deps at the repo root, builds the web
# bundle, and runs `cap sync ios` so the SPM-based Capacitor packages
# (referenced from /node_modules) actually exist when Xcode resolves
# the package graph.
#
# Without this, every Xcode Cloud build fails at "Could not resolve
# package dependencies: ...node_modules/@capacitor/* doesn't exist".

set -ex

# Xcode Cloud runs scripts from ios/App/ci_scripts/, so the repo root
# is two levels up.
REPO_ROOT="${CI_WORKSPACE:-$(cd "$(dirname "$0")/../../.." && pwd)}"
cd "$REPO_ROOT"

echo "──── Repo root: $REPO_ROOT ────"
ls -la | head -10

# 1. Install Node (Homebrew is preinstalled on Xcode Cloud)
echo "──── Installing Node ────"
brew install node@20
brew link --overwrite node@20

echo "node:  $(which node)  $(node -v)"
echo "npm:   $(which npm)   $(npm -v)"

# 2. Install JS deps (CI mode — uses package-lock.json verbatim)
echo "──── npm ci ────"
npm ci --no-audit --no-fund

# 3. Build the web bundle Vite → /dist
echo "──── npm run build ────"
npm run build

# 4. Sync Capacitor → copies dist/ into ios/App/App/public/ and
#    ensures the SPM package references resolve
echo "──── npx cap sync ios ────"
npx cap sync ios

echo "──── ci_post_clone complete ────"
