#!/bin/bash

set -e

echo "Generating frontend coverage badge..."

# Check if coverage-final.json exists
if [[ ! -f "coverage/coverage-final.json" ]]; then
    echo "coverage/coverage-final.json not found. Running tests first..."
    npm run test:coverage -- --run
fi

# Extract coverage percentage from JSON (actual Vitest format)
COVERAGE=$(python3 << 'EOF'
import json

with open('coverage/coverage-final.json') as f:
    data = json.load(f)

total_lines = 0
covered_lines = 0

for file_path, file_data in data.items():
    if isinstance(file_data, dict) and 's' in file_data:
        statements = file_data['s']
        if isinstance(statements, dict):
            total_lines += len(statements)
            covered_lines += sum(1 for count in statements.values() if count > 0)

if total_lines > 0:
    coverage = (covered_lines / total_lines) * 100
else:
    coverage = 0

print(f'{coverage:.1f}')
EOF
)

echo "Coverage: ${COVERAGE}%"

# Determine color based on coverage (using bash arithmetic)
COVERAGE_INT=${COVERAGE%.*}
if [[ "$COVERAGE_INT" -ge 80 ]]; then
    COLOR="green"
elif [[ "$COVERAGE_INT" -ge 70 ]]; then
    COLOR="yellow"
else
    COLOR="red"
fi

# Generate badge using shields.io
curl -s "https://img.shields.io/badge/coverage-${COVERAGE}%25-${COLOR}" -o coverage-badge.svg

if [[ -f "coverage-badge.svg" ]]; then
    echo "Badge saved: coverage-badge.svg"
    echo "Coverage: ${COVERAGE}% (${COLOR})"
    ls -lh coverage-badge.svg
else
    echo "Failed to generate badge"
    exit 1
fi
