#!/bin/bash

echo "Generating all coverage badges..."
echo ""

echo "Backend..."
cd backend
bash scripts/generate-coverage-badge.sh
cd ..

echo ""
echo "Frontend..."
cd frontend
bash scripts/generate-coverage-badge.sh
cd ..

echo ""
echo "All badges generated!"
