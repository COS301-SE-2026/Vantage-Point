# #!/bin/bash

# # Start frontend
# cd /workspaces/frontend
# nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 &

# # Start backend
# cd /workspaces/backend
# nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/uvicorn.log 2>&1 &

# echo "Frontend and backend started."
#!/bin/bash
set -e

echo "=== Starting dev services ==="

# --- Frontend (Vite) ---
cd /workspaces/frontend
echo "Starting frontend..."
nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 &
VITE_PID=$!
echo "Vite PID: $VITE_PID"

# --- Backend (FastAPI) ---
cd /workspaces/backend
echo "Starting backend..."
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/uvicorn.log 2>&1 &
UVICORN_PID=$!
echo "Uvicorn PID: $UVICORN_PID"

echo "=== Both services launched ==="
echo "Frontend log: /tmp/vite.log"
echo "Backend log:  /tmp/uvicorn.log"