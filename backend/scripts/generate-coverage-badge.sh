#!/bin/bash

set -e

echo "Generating backend coverage badge..."

# Check if coverage.xml exists
if [ ! -f "coverage.xml" ]; then
    echo "coverage.xml not found. Running tests first..."
    pytest --cov=app --cov-report=xml --cov-report=html --cov-report=term
fi

# Extract coverage percentage from XML
COVERAGE=$(python -c "
import xml.etree.ElementTree as ET
root = ET.parse('coverage.xml').getroot()
coverage = float(root.attrib['line-rate']) * 100
print(f'{coverage:.1f}')
")

echo "Coverage: ${COVERAGE}%"

# Determine color based on coverage (using bash arithmetic)
COVERAGE_INT=${COVERAGE%.*}
if [ "$COVERAGE_INT" -ge 80 ]; then
    COLOR="green"
elif [ "$COVERAGE_INT" -ge 70 ]; then
    COLOR="yellow"
else
    COLOR="red"
fi

# Generate badge using shields.io
curl -s "https://img.shields.io/badge/coverage-${COVERAGE}%25-${COLOR}" -o coverage-badge.svg

if [ -f "coverage-badge.svg" ]; then
    echo "Badge saved: coverage-badge.svg"
    echo "Coverage: ${COVERAGE}% (${COLOR})"
    ls -lh coverage-badge.svg
else
    echo "Failed to generate badge"
    exit 1
fi
