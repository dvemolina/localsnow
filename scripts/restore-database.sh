#!/bin/bash

# =============================================================================
# LocalSnow - Database Restore Script
# =============================================================================
# This script restores the PostgreSQL database from a backup
# ⚠️  WARNING: This will OVERWRITE the current database!
# =============================================================================

set -e

# Configuration
BACKUP_DIR="/home/dvemolina/localsnow/backups"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}⚠️  LocalSnow Database Restore${NC}"
echo "============================="
echo ""
echo -e "${YELLOW}WARNING: This will OVERWRITE the current database!${NC}"
echo ""

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: ./restore-database.sh <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/localsnow_db_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try with backup directory
    if [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
        BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
    else
        echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi
fi

echo "Backup file: $BACKUP_FILE"
echo ""

# Confirm restore
read -p "Are you sure you want to restore from this backup? (yes/no): " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Find the postgres container
POSTGRES_CONTAINER=$(docker ps --filter "name=localsnow_postgres" --format "{{.Names}}" | head -n 1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "${RED}❌ Error: LocalSnow postgres container not found${NC}"
    exit 1
fi

echo "Found container: $POSTGRES_CONTAINER"
echo ""

# Create a backup before restoring (safety measure)
echo "Creating safety backup before restore..."
SAFETY_BACKUP="localsnow_db_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
docker exec "$POSTGRES_CONTAINER" pg_dump -U localsnow localsnow | gzip > "${BACKUP_DIR}/${SAFETY_BACKUP}"
echo -e "${GREEN}✓ Safety backup created: ${SAFETY_BACKUP}${NC}"
echo ""

# Restore database
echo "Restoring database..."
if gunzip -c "$BACKUP_FILE" | docker exec -i "$POSTGRES_CONTAINER" psql -U localsnow -d localsnow; then
    echo ""
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
    echo ""
    echo "Safety backup saved at: ${BACKUP_DIR}/${SAFETY_BACKUP}"
else
    echo ""
    echo -e "${RED}❌ Restore failed${NC}"
    echo "You can restore from the safety backup if needed:"
    echo "  ./restore-database.sh ${SAFETY_BACKUP}"
    exit 1
fi

exit 0
