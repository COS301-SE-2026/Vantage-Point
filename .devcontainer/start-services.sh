#!/bin/bash
set -e

# --- Load nvm so npm and node are in the PATH ---
export NVM_DIR="/usr/local/share/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Also ensure user-installed Python packages (uvicorn) are available
export PATH="/home/vscode/.local/bin:$PATH"

export CI=true

echo "=== Starting dev services ==="

# --- Frontend (Vite) ---
cd /workspaces/frontend
echo "Starting frontend..."
setsid npm run dev -- --host 0.0.0.0 </dev/null > /tmp/vite.log 2>&1 &
VITE_PID=$!
echo "Vite PID: $VITE_PID"

# --- Backend (FastAPI) ---
cd /workspaces/backend
echo "Starting backend..."
setsid uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload </dev/null > /tmp/uvicorn.log 2>&1 &
UVICORN_PID=$!
echo "Uvicorn PID: $UVICORN_PID"

echo "=== Both services launched ==="
sleep 2
echo "Frontend log: /tmp/vite.log"
echo "Backend log:  /tmp/uvicorn.log"
head -5 /tmp/vite.log