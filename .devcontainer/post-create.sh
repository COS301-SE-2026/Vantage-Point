#!/bin/bash
set -e  # stop the script immediately if any command fails
 
# Install postgres client tools so we can run pg_isready and psql from inside the container
sudo apt-get update -qq && sudo apt-get install -y postgresql-client
 
# Backend — install Python dependencies
cd /workspaces/backend
pip install -r requirements.txt
 
# Frontend — install Node dependencies
cd /workspaces/frontend
npm install
 
echo "post-create.sh complete"