#!/bin/bash
set -e  # stop the script immediately if any command fails
 
# Install postgres client tools so we can run pg_isready and psql from inside the container
sudo apt-get update -qq && sudo apt-get install -y postgresql-client
 
# Backend — install Python dependencies
cd /workspaces/backend
pip install -r requirements.txt
pip install -r requirements-dev.txt 
 
# Frontend — install Node dependencies
sudo chown -R 1000:1000 "/home/vscode/.npm" 2>/dev/null || true
rm -rf /workspaces/frontend/node_modules
cd /workspaces/frontend
npm install

# npm run dev
# being run in the postStartCommand in devcontainer.json, so we don't need to run it here. 
# This allows the frontend server to start up after the container is fully ready, which can help avoid issues with the database not being ready yet when the backend tries to start.
 
echo "post-create.sh complete"