# 🚀 LocalSnow Production Deployment Guide

**Last Updated:** November 23, 2025
**Target Environment:** VPS with Docker Swarm + Traefik

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] VPS accessible via SSH (port 99)
- [ ] Docker Swarm initialized on VPS
- [ ] Traefik reverse proxy running on `traefik_network`
- [ ] Domain DNS pointed to VPS IP
- [ ] `/home/dvemolina/localsnow` folder created on VPS
- [ ] Stripe live keys ready
- [ ] Google OAuth credentials configured
- [ ] Cloudflare R2 bucket created and public
- [ ] n8n instance running for email notifications

---

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Environment Variables (On Your Local Machine)

#### 1.1 Generate Secure Secrets

```bash
# Navigate to project directory
cd /home/user/localsnow

# Make the script executable
chmod +x scripts/setup-secrets.sh

# Run the secrets generator
./scripts/setup-secrets.sh
```

This will generate:
- PostgreSQL password
- Cron secret
- Session secret (optional)

**📝 Save these secrets securely!**

#### 1.2 Create Production Environment File

```bash
# Copy the template
cp .env.production.template .env.production

# Edit with your actual values
nano .env.production
```

**Fill in ALL the values in `.env.production`:**

1. **Database:**
   - `POSTGRES_PASSWORD` - Use the generated password from Step 1.1

2. **Stripe (LIVE KEYS!):**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy LIVE secret key (starts with `sk_live_`)
   - Go to https://dashboard.stripe.com/webhooks
   - Create endpoint: `https://localsnow.org/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy webhook secret (starts with `whsec_`)

3. **Google OAuth:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add redirect URI: `https://localsnow.org/oauth/google/callback`
   - Copy Client ID and Client Secret

4. **Cloudflare R2:**
   - Go to https://dash.cloudflare.com > R2
   - Create bucket: `localsnow-uploads`
   - Make bucket PUBLIC (Settings > Public Access > Allow)
   - Create API Token with R2 read/write permissions
   - Copy Account ID, Access Key ID, and Secret Access Key
   - Set public URL (format: `https://localsnow-uploads.r2.cloudflarestorage.com`)

5. **n8n Webhook:**
   - Use your n8n webhook URL for email notifications

6. **Cron Secret:**
   - Use the generated secret from Step 1.1

#### 1.3 Verify Environment File

```bash
# Check that all required variables are set (no empty values)
grep -E "^[A-Z_]+=$" .env.production

# If this shows any lines, those variables are empty and need to be filled
```

---

### Step 2: Upload Files to VPS

#### 2.1 Upload Environment File

```bash
# From your local machine
scp -P 99 .env.production dvemolina@YOUR_VPS_IP:/home/dvemolina/localsnow/
```

#### 2.2 Upload Docker Compose File

```bash
scp -P 99 docker-compose.production.yml dvemolina@YOUR_VPS_IP:/home/dvemolina/localsnow/
```

#### 2.3 Upload Scripts

```bash
scp -P 99 scripts/backup-database.sh dvemolina@YOUR_VPS_IP:/home/dvemolina/localsnow/
scp -P 99 scripts/restore-database.sh dvemolina@YOUR_VPS_IP:/home/dvemolina/localsnow/
```

---

### Step 3: Deploy on VPS

#### 3.1 SSH into VPS

```bash
ssh -p 99 dvemolina@YOUR_VPS_IP
```

#### 3.2 Navigate to Project Directory

```bash
cd /home/dvemolina/localsnow
```

#### 3.3 Verify Traefik Network Exists

```bash
# Check if traefik_network exists
docker network ls | grep traefik

# If it doesn't exist, create it
docker network create --driver=overlay traefik_network
```

#### 3.4 Pull Docker Image

You have two options:

**Option A: Use GitHub Container Registry (Recommended)**

First, you need to build and push the image from your local machine:

```bash
# On local machine
cd /home/user/localsnow

# Build the image
docker build -t ghcr.io/dvemolina/localsnow:latest .

# Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u dvemolina --password-stdin

# Push the image
docker push ghcr.io/dvemolina/localsnow:latest
```

Then on VPS:

```bash
# Pull the image
docker pull ghcr.io/dvemolina/localsnow:latest
```

**Option B: Build on VPS (Slower)**

```bash
# Clone repository on VPS
git clone https://github.com/dvemolina/localsnow.git app
cd app

# Build image
docker build -t ghcr.io/dvemolina/localsnow:latest .

# Go back to deployment directory
cd /home/dvemolina/localsnow
```

#### 3.5 Deploy the Stack

```bash
# Deploy using Docker Swarm
docker stack deploy -c docker-compose.production.yml --env-file .env.production localsnow

# Alternative if --env-file doesn't work:
# Export variables first
set -a
source .env.production
set +a
docker stack deploy -c docker-compose.production.yml localsnow
```

#### 3.6 Verify Deployment

```bash
# Check services are running
docker stack services localsnow

# Should show:
# localsnow_app        2/2       ghcr.io/dvemolina/localsnow:latest
# localsnow_postgres   1/1       postgres:16-alpine

# Check logs
docker service logs localsnow_app
docker service logs localsnow_postgres

# Watch deployment progress
watch -n 2 'docker service ps localsnow_app'
```

---

### Step 4: Initialize Database

#### 4.1 Wait for Services to be Healthy

```bash
# Wait for health checks to pass (about 60 seconds)
# Check health status
docker service ps localsnow_app
docker service ps localsnow_postgres
```

#### 4.2 Run Database Migrations

```bash
# Get the app container ID
APP_CONTAINER=$(docker ps -q -f name=localsnow_app | head -n 1)

# Run migrations
docker exec $APP_CONTAINER pnpm run db:migrate
```

If `pnpm` is not available in the container, you may need to install dependencies first:

```bash
docker exec $APP_CONTAINER sh -c "cd /app && npm install -g pnpm && pnpm install --prod && pnpm run db:migrate"
```

#### 4.3 Seed BETA2025 Launch Code

Option 1: Use seed script (if available):

```bash
docker exec $APP_CONTAINER pnpm run seed
```

Option 2: Manual SQL insert:

```bash
# Get postgres container ID
POSTGRES_CONTAINER=$(docker ps -q -f name=localsnow_postgres | head -n 1)

# Insert BETA2025 code
docker exec -i $POSTGRES_CONTAINER psql -U localsnow -d localsnow << 'EOF'
INSERT INTO launch_codes (code, description, valid_until, is_active, max_uses, current_uses)
VALUES (
    'BETA2025',
    'MVP Launch Beta Access - Free deposits & lead unlocks',
    '2025-04-30 23:59:59',
    true,
    NULL,
    0
)
ON CONFLICT (code) DO NOTHING;
EOF
```

#### 4.4 Verify Database Setup

```bash
# Check if BETA2025 code exists
docker exec -i $POSTGRES_CONTAINER psql -U localsnow -d localsnow -c "SELECT * FROM launch_codes WHERE code='BETA2025';"
```

---

### Step 5: Verify Application is Running

#### 5.1 Check Health Endpoint

```bash
# From VPS
curl http://localhost:3000/api/health

# Should return: {"status":"healthy","timestamp":"..."}

# From outside (through Traefik)
curl https://localsnow.org/api/health
```

#### 5.2 Test Application

Open in browser:
- https://localsnow.org
- https://localsnow.org/resorts/baqueira-beret

#### 5.3 Check SSL Certificate

```bash
curl -vI https://localsnow.org 2>&1 | grep -A 10 "SSL certificate"
```

---

### Step 6: Set Up Database Backups

#### 6.1 Make Backup Scripts Executable

```bash
chmod +x /home/dvemolina/localsnow/backup-database.sh
chmod +x /home/dvemolina/localsnow/restore-database.sh
```

#### 6.2 Create Backup Directory

```bash
mkdir -p /home/dvemolina/localsnow/backups
```

#### 6.3 Test Manual Backup

```bash
cd /home/dvemolina/localsnow
./backup-database.sh
```

#### 6.4 Set Up Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add this line to backup daily at 2 AM
0 2 * * * /home/dvemolina/localsnow/backup-database.sh >> /home/dvemolina/localsnow/backups/backup.log 2>&1
```

---

### Step 7: Configure n8n Cron Jobs

You need to create TWO workflows in n8n:

#### 7.1 Cron Job: Process Expired Deposits (Every 6 Hours)

Create workflow in n8n:

1. **Schedule Trigger Node:**
   - Cron Expression: `0 */6 * * *` (every 6 hours)

2. **HTTP Request Node:**
   - Method: POST
   - URL: `https://localsnow.org/api/cron/process-deposits`
   - Authentication: Header Auth
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_CRON_SECRET` (from .env.production)

#### 7.2 Cron Job: Calendar Sync & Cleanup (Every Hour)

Create workflow in n8n:

1. **Schedule Trigger Node:**
   - Cron Expression: `0 * * * *` (every hour)

2. **HTTP Request Node:**
   - Method: POST
   - URL: `https://localsnow.org/api/cron/availability`
   - Authentication: Header Auth
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_CRON_SECRET`

---

### Step 8: Test Critical Flows

#### 8.1 Test Client Booking with BETA2025

1. Go to https://localsnow.org
2. Browse instructors at https://localsnow.org/resorts/baqueira-beret
3. Click on an instructor profile
4. Fill booking request form
5. Enter launch code: `BETA2025`
6. Submit booking
7. **Expected:** Booking created WITHOUT payment (€15 deposit bypassed)

#### 8.2 Test Instructor Lead Unlock with BETA2025

1. Login as instructor
2. View pending bookings
3. Click to view booking details
4. **Expected:** Contact info visible immediately (no €5 payment required)

#### 8.3 Test Normal Booking (Without BETA2025)

1. Create booking without launch code
2. **Expected:** Redirected to Stripe for €15 deposit
3. Complete payment
4. **Expected:** Booking created, email sent

---

## 🔄 Updating the Application

### Rolling Update (Zero Downtime)

```bash
# On local machine: Build and push new image
docker build -t ghcr.io/dvemolina/localsnow:latest .
docker push ghcr.io/dvemolina/localsnow:latest

# On VPS: Pull and update
ssh -p 99 dvemolina@YOUR_VPS_IP
cd /home/dvemolina/localsnow

# Pull new image
docker pull ghcr.io/dvemolina/localsnow:latest

# Update stack (automatic rolling update)
docker stack deploy -c docker-compose.production.yml --env-file .env.production localsnow

# Monitor update progress
watch -n 2 'docker service ps localsnow_app'

# Check if update succeeded
curl https://localsnow.org/api/health
```

### Rollback (If Update Fails)

```bash
# Docker Swarm automatically rolls back failed updates
# Manual rollback:
docker service rollback localsnow_app

# Check rollback status
docker service ps localsnow_app
```

---

## 🚨 Troubleshooting

### Issue: Services Not Starting

```bash
# Check service logs
docker service logs localsnow_app
docker service logs localsnow_postgres

# Check service details
docker service ps localsnow_app --no-trunc
```

### Issue: Database Connection Errors

```bash
# Check postgres is running
docker service ps localsnow_postgres

# Check database credentials match
docker exec -i $(docker ps -q -f name=localsnow_postgres | head -n 1) psql -U localsnow -d localsnow -c "SELECT 1;"
```

### Issue: SSL Certificate Not Working

```bash
# Check Traefik logs
docker service logs traefik

# Verify domain DNS
dig localsnow.org

# Check Traefik can reach the app
docker exec -it $(docker ps -q -f name=traefik) wget -O- http://localsnow_app:3000/api/health
```

### Issue: Health Check Failing

```bash
# Check if /api/health endpoint exists
APP_CONTAINER=$(docker ps -q -f name=localsnow_app | head -n 1)
docker exec $APP_CONTAINER wget -O- http://localhost:3000/api/health

# If it doesn't exist, you need to create it (see PRE_LAUNCH_AUDIT_REPORT.md)
```

### Issue: Stripe Webhooks Not Working

```bash
# Check webhook endpoint is accessible
curl -X POST https://localsnow.org/api/webhooks/stripe

# Check Stripe webhook logs in dashboard
# https://dashboard.stripe.com/webhooks

# Verify STRIPE_WEBHOOK_SECRET is correct in .env.production
```

---

## 📊 Monitoring

### Check Service Status

```bash
# List all services
docker service ls

# Check specific service
docker service ps localsnow_app
docker service ps localsnow_postgres

# View real-time logs
docker service logs -f localsnow_app
```

### Check Resource Usage

```bash
# Check memory and CPU usage
docker stats

# Check disk usage
df -h
docker system df
```

### Database Status

```bash
# Check database size
docker exec $(docker ps -q -f name=localsnow_postgres | head -n 1) \
  psql -U localsnow -d localsnow -c "\l+"

# Check table sizes
docker exec $(docker ps -q -f name=localsnow_postgres | head -n 1) \
  psql -U localsnow -d localsnow -c "\dt+"
```

---

## 🔐 Security Checklist

- [ ] `.env.production` is NOT committed to git
- [ ] Using Stripe LIVE keys (not test keys)
- [ ] PostgreSQL password is strong and random
- [ ] CRON_SECRET is secure random string
- [ ] SSL certificate is valid (check browser)
- [ ] Health endpoint returns 200 OK
- [ ] Stripe webhook signature verification is working
- [ ] Google OAuth redirect URI matches production URL
- [ ] R2 bucket has proper CORS and public access configured
- [ ] n8n cron jobs are configured and running
- [ ] Database backups are automated

---

## 📝 Post-Deployment Tasks

1. **Monitor First 24 Hours:**
   - Check error logs regularly
   - Monitor booking flow
   - Test BETA2025 code
   - Verify email notifications

2. **Set Up Additional Monitoring (Optional):**
   - Sentry for error tracking
   - Google Analytics
   - Uptime monitoring (UptimeRobot, Pingdom)

3. **Create Incident Response Plan:**
   - Document rollback procedure
   - List critical contact information
   - Set up alerts for service downtime

4. **Performance Optimization (After Launch):**
   - Monitor database query performance
   - Check page load times
   - Optimize images if needed
   - Add caching if needed

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker service logs localsnow_app`
2. Review PRE_LAUNCH_AUDIT_REPORT.md for known issues
3. Test individual components (database, health endpoint, Stripe)
4. Verify environment variables are correct

---

## ✅ Deployment Complete!

Once all steps are complete, your LocalSnow marketplace is:

- ✅ Running in production on Docker Swarm
- ✅ Accessible at https://localsnow.org
- ✅ SSL secured via Traefik + Let's Encrypt
- ✅ Database migrations applied
- ✅ BETA2025 launch code active
- ✅ Automated backups configured
- ✅ Cron jobs scheduled for deposits and calendars
- ✅ High availability with 2 app replicas
- ✅ Zero-downtime rolling updates configured

**🎉 Congratulations! You're ready to launch!**
