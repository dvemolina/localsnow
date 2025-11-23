#!/bin/bash

# =============================================================================
# LocalSnow - Database Backup Script
# =============================================================================
# This script creates automated backups of the PostgreSQL database
# Run on VPS via cron or manually when needed
# =============================================================================

set -e

# Configuration
BACKUP_DIR="/home/dvemolina/localsnow/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="localsnow_db_${DATE}.sql.gz"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🗄️  LocalSnow Database Backup"
echo "============================="
echo "Date: $(date)"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Find the postgres container
POSTGRES_CONTAINER=$(docker ps --filter "name=localsnow_postgres" --format "{{.Names}}" | head -n 1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "${RED}❌ Error: LocalSnow postgres container not found${NC}"
    echo "Make sure the stack is deployed: docker stack ls"
    exit 1
fi

echo "Found container: $POSTGRES_CONTAINER"
echo "Creating backup..."

# Create backup
if docker exec "$POSTGRES_CONTAINER" pg_dump -U localsnow localsnow | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo "   File: ${BACKUP_FILE}"
    echo "   Size: ${BACKUP_SIZE}"
    echo "   Path: ${BACKUP_DIR}/${BACKUP_FILE}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Clean up old backups
echo ""
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "localsnow_db_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Deleted ${DELETED_COUNT} old backup(s)${NC}"
else
    echo "No old backups to delete"
fi

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/localsnow_db_*.sql.gz 2>/dev/null | tail -5 || echo "No backups found"

echo ""
echo -e "${GREEN}✅ Backup complete!${NC}"

# Optional: Upload to remote storage (uncomment and configure as needed)
# echo ""
# echo "Uploading to remote storage..."
# aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" s3://your-backup-bucket/localsnow/ || true
# rclone copy "${BACKUP_DIR}/${BACKUP_FILE}" remote:localsnow-backups/ || true

exit 0
