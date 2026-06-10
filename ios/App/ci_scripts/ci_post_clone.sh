#!/bin/sh

# Xcode Cloud ci_post_clone.sh
# Runs after Xcode Cloud clones the repo, before xcodebuild starts.
# Installs Node, JS deps, builds the web bundle, syncs Capacitor.

set -e

# ─── Repo root ───────────────────────────────────────────────────────────
# Xcode Cloud puts the checkout at $CI_WORKSPACE. If for some reason
# that env var isn't set, derive the root from this script's location
# (ios/App/ci_scripts/ → three up).
REPO_ROOT="${CI_WORKSPACE:-$(cd "$(dirname "$0")/../../.." && pwd)}"
cd "$REPO_ROOT"

echo "──── Repo root: $REPO_ROOT ────"
echo "──── Contents: ────"
ls -la | head -10

# ─── Node ────────────────────────────────────────────────────────────────
# Try existing node first — Xcode Cloud sometimes ships with one.
if command -v node >/dev/null 2>&1; then
  echo "──── node already installed: $(node -v) at $(which node) ────"
else
  echo "──── Installing node via Homebrew ────"
  brew install node || (echo "brew install node failed — trying nvm fallback" && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 20)
fi

echo "node:  $(which node 2>&1)  $(node -v 2>&1)"
echo "npm:   $(which npm 2>&1)   $(npm -v 2>&1)"

# ─── Install JS deps ────────────────────────────────────────────────────
echo "──── npm install ────"
# Use plain `install` not `ci` — more forgiving if lockfile has drifted
# slightly. CI doesn't need devDependency parity with local.
npm install --no-audit --no-fund --legacy-peer-deps

# ─── Build web bundle ────────────────────────────────────────────────────
echo "──── npm run build ────"
npm run build

# ─── Sync Capacitor → ios/App/App/public/ + SPM packages ─────────────────
echo "──── npx cap sync ios ────"
npx cap sync ios

echo "──── ✅ ci_post_clone complete ────"
