#!/usr/bin/env bash
# Shipyard — Database Backup Script
# Usage: ./scripts/backup-db.sh
# Requires: pg_dump, DATABASE_URL env var (or .env file)
set -euo pipefail

# Load .env if present (local dev)
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | grep 'DATABASE_URL' | xargs)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌  DATABASE_URL is not set. Aborting."
  exit 1
fi

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/shipyard_${TIMESTAMP}.sql.gz"

echo "📦  Dumping database to ${FILENAME}…"
pg_dump "$DATABASE_URL" | gzip > "$FILENAME"

SIZE=$(du -sh "$FILENAME" | cut -f1)
echo "✅  Backup complete: ${FILENAME} (${SIZE})"

# Prune backups older than 30 days
find "$BACKUP_DIR" -name "shipyard_*.sql.gz" -mtime +30 -delete
echo "🧹  Old backups pruned (>30 days)"
