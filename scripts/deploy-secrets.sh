#!/bin/bash
set -euo pipefail

# =============================================================================
# Deploy Docker Secrets to VPS
# =============================================================================
# This script:
# 1. Loads secrets from .env.production.secrets on your Mac
# 2. SSH to VPS and creates Docker Secrets
# 3. Secrets are encrypted at rest in Docker Swarm
# 4. Never stores secrets in plain text on VPS
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SECRETS_FILE="$PROJECT_ROOT/.env.production.secrets"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔐 LocalSnow Docker Secrets Deployment"
echo "========================================"
echo ""

# Check if secrets file exists
if [ ! -f "$SECRETS_FILE" ]; then
    echo -e "${RED}❌ Error: $SECRETS_FILE not found${NC}"
    echo ""
    echo "Please create this file with your production secrets."
    echo "See README for template."
    exit 1
fi

# Load secrets from file
echo "📖 Loading secrets from $SECRETS_FILE..."
set -a  # Automatically export all variables
source "$SECRETS_FILE"
set +a

# Validate required secrets
echo "✅ Validating required secrets..."
REQUIRED_SECRETS=(
    "POSTGRES_PASSWORD"
    "POSTGRES_USER"
    "POSTGRES_DB"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "R2_ACCOUNT_ID"
    "R2_ACCESS_KEY_ID"
    "R2_SECRET_ACCESS_KEY"
    "R2_BUCKET_NAME"
    "R2_PUBLIC_URL"
    "CALENDAR_TOKEN_ENCRYPTION_KEY"
    "EMAIL_HEADER_SECRET"
)

MISSING=()
for secret in "${REQUIRED_SECRETS[@]}"; do
    if [ -z "${!secret:-}" ]; then
        MISSING+=("$secret")
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required secrets:${NC}"
    printf '%s\n' "${MISSING[@]}"
    exit 1
fi

echo "✅ All required secrets present"
echo ""

# Build DATABASE_URL
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

# Generate random CRON_SECRET if not provided
if [ -z "${CRON_SECRET:-}" ]; then
    echo "🎲 Generating random CRON_SECRET..."
    CRON_SECRET=$(openssl rand -hex 32)
fi

echo "🚀 Deploying secrets to VPS via SSH..."
echo ""

# Deploy secrets to VPS via SSH
# shellcheck disable=SC2087
ssh localsnow-vps bash << 'ENDSSH'
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Checking Docker Swarm status..."

# Check if Docker Swarm is initialized
if ! docker node ls >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker Swarm is not initialized${NC}"
    echo ""
    echo "Initialize it with: docker swarm init"
    exit 1
fi

echo "✅ Docker Swarm is active"
echo ""

# Function to create or update secret
create_or_update_secret() {
    local name=$1
    local value=$2

    # Check if secret exists
    if docker secret ls --format '{{.Name}}' | grep -q "^${name}$"; then
        echo -e "${YELLOW}⚠️  Secret '${name}' already exists${NC}"
        echo -n "   Do you want to replace it? [y/N] "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo "   🗑️  Removing old secret..."
            docker secret rm "${name}" || true
            echo "${value}" | docker secret create "${name}" -
            echo -e "   ${GREEN}✅ Updated: ${name}${NC}"
        else
            echo "   ⏭️  Skipped: ${name}"
        fi
    else
        echo "${value}" | docker secret create "${name}" -
        echo -e "${GREEN}✅ Created: ${name}${NC}"
    fi
}

echo "📦 Creating/updating Docker Secrets..."
echo ""

ENDSSH

# Now send the actual secrets through stdin
ssh localsnow-vps bash << ENDSSH
set -euo pipefail

# Function definition (repeated for this context)
create_or_update_secret() {
    local name=\$1
    local value=\$2
    if docker secret ls --format '{{.Name}}' | grep -q "^\${name}\$"; then
        docker secret rm "\${name}" 2>/dev/null || true
        sleep 1
    fi
    echo "\${value}" | docker secret create "\${name}" -
    echo "✅ Created: \${name}"
}

# Database secrets
create_or_update_secret "postgres_password" "${POSTGRES_PASSWORD}"
create_or_update_secret "postgres_user" "${POSTGRES_USER}"
create_or_update_secret "postgres_db" "${POSTGRES_DB}"
create_or_update_secret "database_url" "${DATABASE_URL}"

# Stripe secrets
create_or_update_secret "stripe_secret_key" "${STRIPE_SECRET_KEY}"
create_or_update_secret "stripe_webhook_secret" "${STRIPE_WEBHOOK_SECRET}"

# Google OAuth secrets
create_or_update_secret "google_client_id" "${GOOGLE_CLIENT_ID}"
create_or_update_secret "google_client_secret" "${GOOGLE_CLIENT_SECRET}"

# Cloudflare R2 secrets
create_or_update_secret "r2_account_id" "${R2_ACCOUNT_ID}"
create_or_update_secret "r2_access_key_id" "${R2_ACCESS_KEY_ID}"
create_or_update_secret "r2_secret_access_key" "${R2_SECRET_ACCESS_KEY}"
create_or_update_secret "r2_bucket_name" "${R2_BUCKET_NAME}"
create_or_update_secret "r2_public_url" "${R2_PUBLIC_URL}"

# Cron secret
create_or_update_secret "cron_secret" "${CRON_SECRET}"

# Calendar encryption key
create_or_update_secret "calendar_token_encryption_key" "${CALENDAR_TOKEN_ENCRYPTION_KEY}"

# n8n email webhook secret
create_or_update_secret "email_header_secret" "${EMAIL_HEADER_SECRET}"

# Optional secrets (if provided)
$([ -n "${SENTRY_DSN:-}" ] && echo "create_or_update_secret \"sentry_dsn\" \"${SENTRY_DSN}\"" || echo "echo '⏭️  Skipping sentry_dsn (not provided)'")
$([ -n "${GA_MEASUREMENT_ID:-}" ] && echo "create_or_update_secret \"ga_measurement_id\" \"${GA_MEASUREMENT_ID}\"" || echo "echo '⏭️  Skipping ga_measurement_id (not provided)'")

echo ""
echo "✅ All secrets deployed successfully!"
echo ""
echo "📋 Verify secrets:"
echo "   docker secret ls"
echo ""
echo "🗑️  To remove a secret:"
echo "   docker secret rm secret_name"

ENDSSH

echo ""
echo -e "${GREEN}✅ Secrets deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Build and push your Docker image"
echo "2. Deploy the stack: docker stack deploy -c docker-compose.production.yml localsnow"
