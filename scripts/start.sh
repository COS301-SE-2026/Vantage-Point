#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

BACKEND_PID=""
FRONTEND_PID=""

stop_pid() {
  local pid=$1
  [ -z "$pid" ] && return
  kill "$pid" 2>/dev/null || true
  pkill -P "$pid" 2>/dev/null || true
}

cleanup() {
  local status=$?
  trap - EXIT INT TERM
  echo ""
  echo "Stopping services..."
  stop_pid "$BACKEND_PID"
  stop_pid "$FRONTEND_PID"
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  exit "${status:-0}"
}
trap cleanup EXIT INT TERM

echo "=== Vantage Point dev servers ==="
echo ""

"$ROOT/backend/start.sh" &
BACKEND_PID=$!

"$ROOT/frontend/start.sh" &
FRONTEND_PID=$!

echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

wait "$BACKEND_PID" "$FRONTEND_PID"
