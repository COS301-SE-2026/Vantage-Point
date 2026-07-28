#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"

ASSUME_YES=0
for arg in "$@"; do
  case "$arg" in
    -y|--yes) ASSUME_YES=1 ;;
    -h|--help)
      cat <<'USAGE'
Usage: ./scripts/seed.sh [-y|--yes]

Drops and recreates every table in the database, then loads the dev dataset
(champion catalog, two test users, 8 matches with scoreboards, profile extras).

  -y, --yes   Skip the confirmation prompt.

Reads DATABASE_URL from backend/.env. Log in afterwards as
testuser1@vantagepoint.dev using the SEED_DEV_PASSWORD from that same file.
USAGE
      exit 0
      ;;
    *)
      echo "Error: unknown option '$arg' (try --help)" >&2
      exit 2
      ;;
  esac
done

cd "$BACKEND"

if [[ -f ".venv/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source ".venv/bin/activate"
elif [[ -f "venv/bin/activate" ]]; then
  # shellcheck source=/dev/null
  source "venv/bin/activate"
fi

if ! command -v python >/dev/null 2>&1; then
  echo "Error: python not found. Create .venv and run: pip install -r requirements.txt" >&2
  exit 1
fi

if [[ ! -f ".env" && -z "${DATABASE_URL:-}" ]]; then
  echo "Error: backend/.env not found. Copy it from backend/.env.example first." >&2
  exit 1
fi

# seed.py load_dotenv()s these itself; we only peek so we can warn early.
env_value() {
  [[ -f ".env" ]] || return 0
  sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*//p" .env | tail -n 1
}

DB_TARGET="${DATABASE_URL:-$(env_value DATABASE_URL)}"
if [[ -z "$DB_TARGET" ]]; then
  echo "Error: DATABASE_URL is not set in backend/.env or the environment." >&2
  exit 1
fi

# Strip credentials so we can show which database is about to be wiped.
DB_DISPLAY="$(printf '%s' "$DB_TARGET" | sed -E 's#://[^@/]*@#://#')"

echo "=== Vantage Point database seed ==="
echo ""
echo "Target: $DB_DISPLAY"
echo ""
echo "This DROPS and recreates every table. All existing data is lost."
echo ""

if [[ "$ASSUME_YES" -eq 0 ]]; then
  if [[ ! -t 0 ]]; then
    echo "Error: not a terminal, so the prompt cannot be answered. Re-run with --yes." >&2
    exit 1
  fi
  read -r -p "Continue? [y/N] " reply
  if [[ ! "$reply" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
  echo ""
fi

python -m app.database.seed

if [[ -z "${SEED_DEV_PASSWORD:-}$(env_value SEED_DEV_PASSWORD)" ]]; then
  echo ""
  echo "Warning: SEED_DEV_PASSWORD is not set in backend/.env." >&2
  echo "         Dev login will be rejected until you add it." >&2
fi

echo ""
echo "Dev login: testuser1@vantagepoint.dev (password from SEED_DEV_PASSWORD)"
echo "Start the app with: ./scripts/start.sh"
