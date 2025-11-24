#!/bin/bash
set -euo pipefail

# =============================================================================
# Production Deployment Script for LocalSnow
# =============================================================================
# This script handles the complete deployment process:
# 1. Build and push Docker image
# 2. Run database migrations
# 3. Optionally seed data
# 4. Deploy/update the service
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
IMAGE_NAME="ghcr.io/dvemolina/localsnow/localsnow"
IMAGE_TAG="${IMAGE_TAG:-latest}"
COMPOSE_FILE="docker-compose.production.yml"
VPS_HOST="${VPS_HOST:-dvemolina@vmi2543894}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  LocalSnow Production Deployment     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Parse arguments
RUN_MIGRATIONS=true
RUN_SEEDS=false
SKIP_BUILD=false
SKIP_DEPLOY=false

for arg in "$@"; do
  case $arg in
    --skip-build)
      SKIP_BUILD=true
      ;;
    --skip-deploy)
      SKIP_DEPLOY=true
      ;;
    --seed)
      RUN_SEEDS=true
      ;;
    --migrations-only)
      SKIP_BUILD=true
      SKIP_DEPLOY=true
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  (no args)            Full deployment (build, migrate, deploy)"
      echo "  --skip-build         Skip Docker build step"
      echo "  --skip-deploy        Skip service deployment"
      echo "  --seed               Run seeds after migrations"
      echo "  --migrations-only    Only run migrations (no build/deploy)"
      echo "  --help               Show this help message"
      echo ""
      echo "Environment variables:"
      echo "  IMAGE_TAG            Docker image tag (default: latest)"
      echo "  VPS_HOST             SSH host (default: dvemolina@vmi2543894)"
      exit 0
      ;;
  esac
done

# Step 1: Build and push Docker image
if [ "$SKIP_BUILD" = false ]; then
  echo -e "${YELLOW}📦 Step 1: Building Docker image...${NC}"
  echo ""

  cd "$PROJECT_ROOT"

  echo "Building: $IMAGE_NAME:$IMAGE_TAG"
  docker buildx build \
    --platform linux/amd64 \
    -t "$IMAGE_NAME:$IMAGE_TAG" \
    --push \
    .

  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Docker image built and pushed${NC}"
    echo ""
  else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⏭️  Skipping Docker build${NC}"
  echo ""
fi

# Step 2: Run database migrations
if [ "$RUN_MIGRATIONS" = true ]; then
  echo -e "${YELLOW}🗄️  Step 2: Running database migrations on VPS...${NC}"
  echo ""

  # Run migrations inside a temporary container on VPS
  ssh "$VPS_HOST" << 'ENDSSH'
set -euo pipefail

echo "Starting migration container..."

# Run migrations using the latest image
docker run --rm \
  --network localsnow_localsnow_network \
  --secret source=localsnow_database_url,target=/run/secrets/localsnow_database_url \
  -e DATABASE_URL_FILE=/run/secrets/localsnow_database_url \
  ghcr.io/dvemolina/localsnow/localsnow:latest \
  node scripts/migrate.js

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed"
else
  echo "❌ Migrations failed"
  exit 1
fi
ENDSSH

  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Database migrations completed${NC}"
    echo ""
  else
    echo -e "${RED}❌ Migrations failed${NC}"
    exit 1
  fi
fi

# Step 3: Optionally run seeds
if [ "$RUN_SEEDS" = true ]; then
  echo -e "${YELLOW}🌱 Step 3: Running database seeds on VPS...${NC}"
  echo ""

  ssh "$VPS_HOST" << 'ENDSSH'
set -euo pipefail

echo "Starting seed container..."

docker run --rm \
  --network localsnow_localsnow_network \
  --secret source=localsnow_database_url,target=/run/secrets/localsnow_database_url \
  -e DATABASE_URL_FILE=/run/secrets/localsnow_database_url \
  ghcr.io/dvemolina/localsnow/localsnow:latest \
  node scripts/seed-production.js

if [ $? -eq 0 ]; then
  echo "✅ Seeds completed"
else
  echo "❌ Seeds failed"
  exit 1
fi
ENDSSH

  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Database seeds completed${NC}"
    echo ""
  else
    echo -e "${RED}❌ Seeds failed${NC}"
    exit 1
  fi
fi

# Step 4: Deploy/update service
if [ "$SKIP_DEPLOY" = false ]; then
  echo -e "${YELLOW}🚀 Step 4: Deploying service...${NC}"
  echo ""

  # Copy docker-compose file to VPS and deploy
  scp "$PROJECT_ROOT/$COMPOSE_FILE" "$VPS_HOST:~/"

  ssh "$VPS_HOST" << ENDSSH
set -euo pipefail

echo "Deploying stack..."

export IMAGE_TAG=${IMAGE_TAG}
docker stack deploy -c $COMPOSE_FILE localsnow

echo "Waiting for service to be ready..."
sleep 10

echo ""
echo "Service status:"
docker service ls | grep localsnow

echo ""
echo "Recent logs:"
docker service logs localsnow_app --tail 20

ENDSSH

  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Service deployed${NC}"
    echo ""
  else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⏭️  Skipping service deployment${NC}"
  echo ""
fi

# Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Deployment Complete! 🎉               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Your app is now running at: https://localsnow.org"
echo ""
echo "Useful commands:"
echo "  ssh $VPS_HOST 'docker service logs localsnow_app -f'"
echo "  ssh $VPS_HOST 'docker service ps localsnow_app'"
echo "  ssh $VPS_HOST 'docker service ls | grep localsnow'"
echo ""
