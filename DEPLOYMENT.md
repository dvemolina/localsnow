# LocalSnow Deployment Guide

Complete guide for deploying LocalSnow to production using Docker Swarm on Contabo VPS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial VPS Setup](#initial-vps-setup)
3. [Docker Swarm Configuration](#docker-swarm-configuration)
4. [Cloudflare Configuration](#cloudflare-configuration)
5. [GitHub Secrets Setup](#github-secrets-setup)
6. [First Deployment](#first-deployment)
7. [Database Migration](#database-migration)
8. [n8n Cron Setup](#n8n-cron-setup)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Services

- ✅ Contabo VPS (4 cores, 4GB RAM, 100GB NVMe)
- ✅ Domain: `localsnow.org` (Namecheap → Cloudflare)
- ✅ Cloudflare account (for CDN, SSL, R2 storage)
- ✅ Stripe account (payment processing)
- ✅ Google Cloud Console (OAuth, Calendar API)
- ✅ n8n instance (self-hosted for emails & cron)
- ✅ GitHub account (for CI/CD)

### VPS Specifications

```
IP: 161.97.77.125
IPv6: 2a02:c207:2254:3894::1/64
Region: EU
Cores: 4
RAM: 4GB
Disk: 100GB NVMe
OS: Linux 4.4.0
```

---

## Initial VPS Setup

### 1. SSH into Your VPS

```bash
ssh root@161.97.77.125
```

### 2. Update System

```bash
apt update && apt upgrade -y
```

### 3. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker service
systemctl enable docker
systemctl start docker

# Verify installation
docker --version
```

### 4. Initialize Docker Swarm

```bash
docker swarm init --advertise-addr 161.97.77.125
```

**Output:**
```
Swarm initialized: current node (xyz123) is now a manager.
```

### 5. Create Application Directory

```bash
mkdir -p /opt/localsnow
cd /opt/localsnow
```

### 6. Install pnpm (for database migrations)

```bash
npm install -g pnpm
```

---

## Docker Swarm Configuration

### 1. Copy Production Stack File

From your local machine, copy the Docker Compose file to the VPS:

```bash
# On your local machine
scp docker-compose.prod.yml root@161.97.77.125:/opt/localsnow/
```

Or clone from GitHub:

```bash
# On VPS
cd /opt/localsnow
git clone https://github.com/YOUR_USERNAME/localsnow.git .
```

### 2. Create Environment File

```bash
cd /opt/localsnow
nano .env
```

Copy values from `.env.example` and fill in your production credentials.

**Important**: NEVER commit `.env` to version control!

---

## Cloudflare Configuration

### 1. DNS Setup

Go to Cloudflare Dashboard → DNS → Records:

**A Records:**
```
Type: A
Name: @
Content: 161.97.77.125
Proxy status: Proxied (orange cloud)
TTL: Auto
```

```
Type: A
Name: www
Content: 161.97.77.125
Proxy status: Proxied
TTL: Auto
```

```
Type: A
Name: traefik
Content: 161.97.77.125
Proxy status: Proxied
TTL: Auto
```

**AAAA Record (IPv6):**
```
Type: AAAA
Name: @
Content: 2a02:c207:2254:3894::1
Proxy status: Proxied
TTL: Auto
```

### 2. SSL/TLS Settings

- **SSL/TLS encryption mode**: Full (strict)
- **Always Use HTTPS**: ON
- **Minimum TLS Version**: 1.2
- **Automatic HTTPS Rewrites**: ON

### 3. Get Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit zone DNS"
4. Zone Resources: `localsnow.org`
5. Copy the token → Save as `CLOUDFLARE_DNS_API_TOKEN`

### 4. R2 Bucket Setup

1. Go to: https://dash.cloudflare.com/ → R2
2. Create bucket: `localsnow-uploads`
3. Get credentials:
   - Account ID
   - Access Key ID
   - Secret Access Key
4. Public URL: Configure custom domain or use default

---

## GitHub Secrets Setup

Go to: GitHub Repository → Settings → Secrets and variables → Actions

### Required Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VPS_HOST` | `161.97.77.125` | Your Contabo VPS IP |
| `VPS_USERNAME` | `root` | SSH username |
| `VPS_SSH_KEY` | `<private key>` | SSH private key for authentication |
| `VPS_PORT` | `22` | SSH port (default: 22) |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `PROJECT_URL` | `https://localsnow.org` | Production domain |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe secret key (LIVE) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook secret |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `xxx` | Google OAuth secret |
| `R2_ACCOUNT_ID` | `xxx` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | `xxx` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | `xxx` | R2 secret key |
| `R2_BUCKET_NAME` | `localsnow-uploads` | R2 bucket name |
| `R2_PUBLIC_URL` | `https://...` | R2 public URL |
| `N8N_WEBHOOK_URL` | `https://...` | n8n webhook URL |
| `CRON_SECRET` | `<random string>` | Cron authentication secret |
| `POSTGRES_USER` | `localsnow` | Database user |
| `POSTGRES_PASSWORD` | `<secure password>` | Database password |
| `POSTGRES_DB` | `localsnow` | Database name |
| `CLOUDFLARE_EMAIL` | `your@email.com` | Cloudflare account email |
| `CLOUDFLARE_DNS_API_TOKEN` | `xxx` | Cloudflare DNS API token |

### Generate SSH Key for GitHub Actions

On your VPS:

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions" -f /root/.ssh/github-actions

# Add public key to authorized_keys
cat /root/.ssh/github-actions.pub >> /root/.ssh/authorized_keys

# Copy private key to add to GitHub Secrets
cat /root/.ssh/github-actions
```

Copy the **private key** output and paste it as `VPS_SSH_KEY` in GitHub Secrets.

---

## First Deployment

### Option 1: Manual Deployment (Recommended for First Time)

```bash
# SSH into VPS
ssh root@161.97.77.125

# Navigate to application directory
cd /opt/localsnow

# Login to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull the latest image
docker pull ghcr.io/YOUR_USERNAME/localsnow:latest

# Deploy the stack
docker stack deploy -c docker-compose.prod.yml localsnow

# Check service status
docker service ls

# View service logs
docker service logs -f localsnow_app
```

### Option 2: Automatic via GitHub Actions

1. Push to `main` branch
2. GitHub Actions will:
   - Build Docker image
   - Push to ghcr.io
   - Deploy to Docker Swarm via SSH
   - Verify deployment
   - Rollback automatically if deployment fails

Monitor deployment: https://github.com/YOUR_USERNAME/localsnow/actions

---

## Database Migration

### Initial Schema Setup

On first deployment, run database migrations:

```bash
# SSH into VPS
ssh root@161.97.77.125

# Navigate to project
cd /opt/localsnow

# Install dependencies (if not already)
pnpm install

# Push schema to database
pnpm run db:push
```

### Seed Database (Optional)

```bash
# Seed initial data (countries, regions, resorts, sports)
pnpm run seed
```

### Future Migrations

When you update the schema:

1. Update `src/lib/server/db/schema.ts`
2. Commit and push changes
3. After deployment, SSH into VPS and run:
   ```bash
   cd /opt/localsnow
   pnpm run db:push
   ```

---

## n8n Cron Setup

### Create Cron Workflows in n8n

#### Workflow 1: Calendar Sync & Tentative Block Cleanup

**Trigger:** Schedule (every hour)

**Nodes:**
1. **Schedule Trigger**
   - Interval: Every hour
   - Start time: 00:00

2. **HTTP Request**
   - Method: POST
   - URL: `https://localsnow.org/api/cron/availability`
   - Authentication: Header Auth
     - Header Name: `Authorization`
     - Header Value: `Bearer YOUR_CRON_SECRET`

3. **If Error** → Send notification (optional)

---

#### Workflow 2: Process Expired Deposits

**Trigger:** Schedule (every 6 hours)

**Nodes:**
1. **Schedule Trigger**
   - Interval: Every 6 hours
   - Start time: 00:00

2. **HTTP Request**
   - Method: POST
   - URL: `https://localsnow.org/api/cron/process-deposits`
   - Authentication: Header Auth
     - Header Name: `Authorization`
     - Header Value: `Bearer YOUR_CRON_SECRET`

3. **If Error** → Send notification (optional)

---

#### Workflow 3: Review Reminder Emails (Future)

**Trigger:** Webhook or Schedule

**Nodes:**
1. **HTTP Request** → Fetch pending reviews
2. **Filter** → Reviews eligible (1 hour after lesson)
3. **Send Email** → Reminder to leave review

---

## Monitoring

### Check Service Status

```bash
# List all services
docker service ls

# View service details
docker service ps localsnow_app

# View logs
docker service logs -f localsnow_app
docker service logs -f localsnow_postgres
docker service logs -f localsnow_traefik
```

### Health Checks

- **Application**: https://localsnow.org
- **Traefik Dashboard**: https://traefik.localsnow.org
- **Database**: Check via application logs

### Resource Monitoring

```bash
# System resources
htop

# Docker stats
docker stats

# Disk usage
df -h
```

### Lightweight Monitoring Stack (Optional)

Given your 4GB RAM, use **Uptime Kuma** instead of heavy Prometheus/Grafana:

```bash
# Deploy Uptime Kuma
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```

Access at: http://161.97.77.125:3001

Add monitoring for:
- `https://localsnow.org` (HTTP 200 check)
- `https://localsnow.org/api/health` (API health endpoint - create this)
- PostgreSQL port 5432

---

## Troubleshooting

### Service Won't Start

```bash
# Check service logs
docker service logs localsnow_app

# Check container status
docker service ps localsnow_app --no-trunc

# Force update
docker service update --force localsnow_app
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker service ps localsnow_postgres

# Connect to database manually
docker exec -it $(docker ps -q -f name=localsnow_postgres) psql -U localsnow -d localsnow

# Check connection string in environment
docker service inspect localsnow_app | grep DATABASE_URL
```

### SSL Certificate Issues

```bash
# Check Traefik logs
docker service logs localsnow_traefik

# Verify Cloudflare API token
# Make sure DNS propagation is complete: https://dnschecker.org/
```

### Rolling Back a Failed Deployment

```bash
# Automatic rollback (already in GitHub Actions)
docker service update --rollback localsnow_app

# Or manually specify previous image
docker service update --image ghcr.io/YOUR_USERNAME/localsnow:PREVIOUS_TAG localsnow_app
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean up unused Docker resources
docker system prune -a --volumes

# Remove old images (keep last 3 days)
docker image prune -af --filter "until=72h"
```

### Out of Memory

```bash
# Check memory usage
free -m

# Identify memory-hungry services
docker stats

# Options:
# 1. Reduce app replicas from 2 to 1
# 2. Skip monitoring stack (Prometheus/Grafana)
# 3. Upgrade VPS to 8GB RAM
```

---

## Production Checklist

Before going live:

### Stripe Configuration
- [ ] Switch from test keys to live keys
- [ ] Configure webhooks for production URL
- [ ] Test payment flow end-to-end

### Google OAuth
- [ ] Add production redirect URI
- [ ] Test OAuth login flow

### Email Notifications
- [ ] Verify n8n webhooks work
- [ ] Test all email types (signup, booking, review)

### Database
- [ ] Run migrations
- [ ] Seed initial data
- [ ] Create database backups

### Security
- [ ] All environment variables set correctly
- [ ] CRON_SECRET is strong and unique
- [ ] SSH key authentication only (disable password auth)
- [ ] Firewall configured (UFW)

### DNS & SSL
- [ ] DNS propagation complete
- [ ] SSL certificate issued
- [ ] HTTP → HTTPS redirect working

### Monitoring
- [ ] Health checks passing
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up

---

## Backup Strategy

### Database Backups

Create automated backup script:

```bash
# /opt/scripts/backup-db.sh
#!/bin/bash

BACKUP_DIR="/opt/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="localsnow_${DATE}.sql"

mkdir -p $BACKUP_DIR

docker exec $(docker ps -q -f name=localsnow_postgres) \
  pg_dump -U localsnow localsnow > $BACKUP_DIR/$FILENAME

# Compress backup
gzip $BACKUP_DIR/$FILENAME

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$FILENAME.gz"
```

Add to crontab:

```bash
crontab -e

# Add line:
0 2 * * * /opt/scripts/backup-db.sh
```

### Upload to R2 (Optional)

Use `rclone` to sync backups to Cloudflare R2.

---

## Next Steps

1. **Deploy application** (follow "First Deployment" above)
2. **Run database migrations**
3. **Configure n8n cron workflows**
4. **Test all features** (booking, payments, reviews)
5. **Set up monitoring**
6. **Configure backups**
7. **Go live!** 🚀

---

## Support

For issues:
- Check logs: `docker service logs -f localsnow_app`
- Review this guide
- Check GitHub Actions for deployment errors

---

**Last Updated:** 2025-11-08
