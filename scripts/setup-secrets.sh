#!/bin/bash

# =============================================================================
# LocalSnow - Production Secrets Setup Script
# =============================================================================
# This script helps you generate secure secrets for production deployment
# Run this on your local machine, then transfer values to .env.production
# =============================================================================

set -e

echo "🔐 LocalSnow Production Secrets Generator"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ Error: openssl is not installed${NC}"
    echo "Please install openssl first:"
    echo "  - macOS: brew install openssl"
    echo "  - Ubuntu/Debian: sudo apt-get install openssl"
    exit 1
fi

echo "Generating secure secrets..."
echo ""

# Generate PostgreSQL password
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo -e "${GREEN}✓ PostgreSQL Password:${NC}"
echo "  POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo ""

# Generate Cron secret
CRON_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✓ Cron Secret:${NC}"
echo "  CRON_SECRET=$CRON_SECRET"
echo ""

# Generate session secret (optional, if needed)
SESSION_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✓ Session Secret:${NC}"
echo "  SESSION_SECRET=$SESSION_SECRET"
echo ""

echo "=========================================="
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}"
echo ""
echo "1. Copy these secrets to your .env.production file"
echo "2. NEVER commit these secrets to git"
echo "3. Store them securely (password manager recommended)"
echo "4. These secrets should be used ONLY in production"
echo ""
echo "=========================================="
echo -e "${GREEN}📋 Next Steps:${NC}"
echo ""
echo "1. Copy .env.production.template to .env.production:"
echo "   cp .env.production.template .env.production"
echo ""
echo "2. Edit .env.production and paste the secrets above"
echo ""
echo "3. Fill in remaining environment variables:"
echo "   - Stripe live keys (from dashboard.stripe.com)"
echo "   - Google OAuth credentials (from console.cloud.google.com)"
echo "   - Cloudflare R2 credentials (from dash.cloudflare.com)"
echo "   - n8n webhook URL"
echo ""
echo "4. Upload .env.production to VPS:"
echo "   scp -P 99 .env.production dvemolina@YOUR_VPS_IP:/home/dvemolina/localsnow/"
echo ""
echo "=========================================="

# Optionally save to a file
read -p "Save secrets to secrets.txt? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat > secrets.txt << EOF
# LocalSnow Production Secrets
# Generated on: $(date)
# ⚠️  DO NOT COMMIT THIS FILE TO GIT

POSTGRES_PASSWORD=$POSTGRES_PASSWORD
CRON_SECRET=$CRON_SECRET
SESSION_SECRET=$SESSION_SECRET
EOF
    echo -e "${GREEN}✓ Secrets saved to secrets.txt${NC}"
    echo -e "${RED}⚠️  Remember to delete this file after copying to .env.production!${NC}"
fi

echo ""
echo -e "${GREEN}✅ Secrets generation complete!${NC}"
