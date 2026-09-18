#!/bin/bash
# Rebuilds current app state in a local scratch Postgres by replaying:
#   prisma/backfill.ts  ->  every file in prisma/updates/*.sql, in filename order
#
# This exists because this Claude Code session can't reach the real Supabase
# database directly (network egress restriction) -- so there's no way to just
# "read the current data." Since every real write this project has ever made
# is captured as a file (the original backfill script, plus one dated SQL
# file per logged update), replaying them in order reconstructs the exact
# same state deterministically. Re-run this any time you need to see or
# query current data (e.g. before building a pipeline-snapshot artifact).
#
# Prints the local DATABASE_URL to use for the rest of the session. Does NOT
# touch .env -- export the printed URL yourself for one-off commands so you
# never risk leaving the repo's .env pointed at the local scratch DB.
#
# Run cleanup-local-db.sh when done.

set -e
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
DB_URL="postgresql://postgres:localdev@localhost:5432/career_tracker?schema=public"

pg_ctlcluster 16 main start 2>&1 || true
sleep 1

sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'localdev';" >/dev/null 2>&1 || true
sudo -u postgres psql -c "DROP DATABASE IF EXISTS career_tracker;" >/dev/null 2>&1
sudo -u postgres psql -c "CREATE DATABASE career_tracker;" >/dev/null 2>&1

cd "$REPO_DIR"
export DATABASE_URL="$DB_URL"

npx prisma migrate deploy
npx tsx prisma/backfill.ts

for f in prisma/updates/*.sql; do
  [ -e "$f" ] || continue
  echo "Applying $f"
  PGPASSWORD=localdev psql -h localhost -U postgres -d career_tracker -f "$f" >/dev/null
done

echo ""
echo "Local DB reconstructed. Use this for the rest of your work:"
echo "export DATABASE_URL=\"$DB_URL\""
