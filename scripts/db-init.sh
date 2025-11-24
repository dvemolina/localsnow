#!/bin/bash
set -euo pipefail

# =============================================================================
# Database Initialization Script for Production
# =============================================================================
# This script runs database migrations and optionally seeds data
# Usage:
#   ./scripts/db-init.sh              # Run migrations only
#   ./scripts/db-init.sh --seed       # Run migrations + seeds
#   ./scripts/db-init.sh --seed-only  # Run seeds only (migrations already done)
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Database Initialization${NC}"
echo "================================"
echo ""

# Parse arguments
RUN_MIGRATIONS=true
RUN_SEEDS=false

for arg in "$@"; do
  case $arg in
    --seed)
      RUN_SEEDS=true
      ;;
    --seed-only)
      RUN_MIGRATIONS=false
      RUN_SEEDS=true
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  (no args)      Run migrations only (default)"
      echo "  --seed         Run migrations + seeds"
      echo "  --seed-only    Run seeds only"
      echo "  --help         Show this help message"
      exit 0
      ;;
  esac
done

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ] && [ -z "${DATABASE_URL_FILE:-}" ]; then
  echo -e "${RED}❌ Error: DATABASE_URL or DATABASE_URL_FILE must be set${NC}"
  echo ""
  echo "Set it with:"
  echo "  export DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
  exit 1
fi

echo -e "${GREEN}✓${NC} Database URL configured"
echo ""

# Run migrations
if [ "$RUN_MIGRATIONS" = true ]; then
  echo -e "${YELLOW}▶️  Running migrations...${NC}"
  echo ""

  cd "$PROJECT_ROOT"
  node scripts/migrate.js

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
    echo ""
  else
    echo -e "${RED}❌ Migrations failed${NC}"
    exit 1
  fi
fi

# Run seeds
if [ "$RUN_SEEDS" = true ]; then
  echo -e "${YELLOW}▶️  Running seeds...${NC}"
  echo ""

  cd "$PROJECT_ROOT"
  node scripts/seed-production.js

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Seeds completed successfully${NC}"
    echo ""
  else
    echo -e "${RED}❌ Seeds failed${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}🎉 Database initialization complete!${NC}"
echo ""
