#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ -f ".venv/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source ".venv/bin/activate"
elif [[ -f "venv/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source "venv/bin/activate"
fi

if ! command -v uvicorn >/dev/null 2>&1; then
  echo "Error: uvicorn not found. Create .venv and run: pip install -r requirements.txt" >&2
  exit 1
fi

echo "Starting backend at http://localhost:8000"
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
