#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="$ROOT/frontend"

MODE="run"
PASSTHROUGH=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ui) MODE="ui"; shift ;;
    --report) MODE="report"; shift ;;
    --install) MODE="install"; shift ;;
    --dev) export E2E_DEV=1; shift ;;
    -h|--help)
      cat <<'USAGE'
Usage: ./scripts/e2e.sh [options] [-- <playwright args>]

Runs the Playwright end-to-end suite against the frontend in Chromium. Every
backend call is answered from fixtures in frontend/e2e/fixtures, so no backend,
database or Riot API key is needed — and nothing you run here touches your dev
database.

  --ui        Open the interactive Playwright runner instead of a headless run.
  --report    Open the HTML report from the last run and exit.
  --install   Download the Chromium binary and exit.
  --dev       Serve with `vite dev` rather than a preview build. Faster to
              re-run, but the dev server's first-load dependency re-optimise can
              abort in-flight fetches and make error-path assertions flaky.
  -h, --help  Show this message.

Anything after `--` goes straight to Playwright:

  ./scripts/e2e.sh -- profile            # only specs matching "profile"
  ./scripts/e2e.sh -- --headed           # watch it drive a real window
  ./scripts/e2e.sh -- --repeat-each 3    # chase a flake

Environment variables (see frontend/e2e/README.md):

  E2E_PORT       Port for the local server (default 4173, or 5173 with --dev)
  E2E_BASE_URL   Run against an already-running server; none is started
USAGE
      exit 0
      ;;
    --) shift; PASSTHROUGH+=("$@"); break ;;
    *) PASSTHROUGH+=("$1"); shift ;;
  esac
done

cd "$FRONTEND"

if [[ ! -d node_modules ]]; then
  echo "Installing frontend dependencies..."
  # The repo's peer tree needs this flag; package.json pins the peers it relies
  # on directly so nothing is dropped.
  npm ci --legacy-peer-deps
fi

# Playwright refuses to start without a matching browser build, and the version
# moves with the package, so check on every run rather than only on first use.
if ! npx playwright install --dry-run chromium >/dev/null 2>&1; then
  npx playwright install chromium
fi

case "$MODE" in
  install)
    npx playwright install chromium
    ;;
  report)
    npx playwright show-report
    ;;
  ui)
    npx playwright test --ui "${PASSTHROUGH[@]+"${PASSTHROUGH[@]}"}"
    ;;
  run)
    npx playwright test "${PASSTHROUGH[@]+"${PASSTHROUGH[@]}"}"
    ;;
esac
