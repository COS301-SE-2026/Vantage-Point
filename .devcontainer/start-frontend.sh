#!/bin/bash
cd /workspaces/frontend
nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 &
echo "Frontend started"