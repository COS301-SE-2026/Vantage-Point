#!/bin/bash
cd /workspaces/backend
source venv/bin/activate
pip install -r requirements.txt

cd /workspace/frontend
npm install
