# 🚀 Production Deployment Quickstart

## What Was Created

I've built a **production-ready database migration system** for your app following industry best practices. Here's what you now have:

### 📁 New Files

```
scripts/
├── migrate.js              # Production migration runner (no drizzle-kit needed)
├── seed-production.js      # Production seed runner (idempotent)
├── db-init.sh             # Combined migration + seed helper
└── deploy-production.sh   # Full automated deployment

docs/
└── DATABASE_SETUP.md      # Complete documentation

Dockerfile                 # Updated to include migrations & scripts
package.json              # New scripts: db:init, db:seed, db:generate
```

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  Deployment Process                              │
├─────────────────────────────────────────────────┤
│  1. Build Docker image                           │
│     └─ Includes migrations, scripts, seed data   │
│                                                  │
│  2. Run migrations (temporary container)         │
│     └─ Creates/updates database schema           │
│                                                  │
│  3. Run seeds (optional, temporary container)    │
│     └─ Populates reference data                  │
│                                                  │
│  4. Deploy/update app service                    │
│     └─ Starts application containers             │
└─────────────────────────────────────────────────┘
```

## 🎯 How To Deploy NOW

### Option 1: Automated (Recommended)

```bash
# First time deployment (includes seeds)
./scripts/deploy-production.sh --seed

# Regular updates (migrations only)
./scripts/deploy-production.sh
```

That's it! The script handles everything:
- ✅ Builds and pushes Docker image
- ✅ Runs database migrations on VPS
- ✅ Optionally runs seeds
- ✅ Deploys/updates service
- ✅ Shows logs and status

### Option 2: Manual Steps

```bash
# 1. Build and push image
docker buildx build --platform linux/amd64 \
  -t ghcr.io/dvemolina/localsnow/localsnow:latest --push .

# 2. SSH to VPS
ssh dvemolina@vmi2543894

# 3. Run migrations
docker run --rm \
  --network localsnow_localsnow_network \
  --secret source=localsnow_database_url,target=/run/secrets/localsnow_database_url \
  -e DATABASE_URL_FILE=/run/secrets/localsnow_database_url \
  ghcr.io/dvemolina/localsnow/localsnow:latest \
  node scripts/migrate.js

# 4. Run seeds (first time only)
docker run --rm \
  --network localsnow_localsnow_network \
  --secret source=localsnow_database_url,target=/run/secrets/localsnow_database_url \
  -e DATABASE_URL_FILE=/run/secrets/localsnow_database_url \
  ghcr.io/dvemolina/localsnow/localsnow:latest \
  node scripts/seed-production.js

# 5. Deploy service
docker stack deploy -c docker-compose.production.yml localsnow

# 6. Check status
docker service ls | grep localsnow
docker service logs localsnow_app --tail 20
```

## 🔧 Development Workflow

### Making Schema Changes

```bash
# 1. Modify schema
vim src/lib/server/db/schema.ts

# 2. Generate migration
pnpm db:generate

# 3. Test locally
pnpm db:init

# 4. Test seeds locally (if needed)
pnpm seed:all

# 5. Commit migration file
git add drizzle/migrations/
git commit -m "Add new schema changes"

# 6. Deploy to production
./scripts/deploy-production.sh
```

## 📋 Available Commands

### Production Deployment

```bash
./scripts/deploy-production.sh              # Full deployment
./scripts/deploy-production.sh --seed       # Include seeds
./scripts/deploy-production.sh --skip-build # Skip Docker build
./scripts/deploy-production.sh --migrations-only # Only migrations
```

### Development

```bash
pnpm db:generate   # Generate new migration from schema changes
pnpm db:init       # Run migrations (works in prod too!)
pnpm db:seed       # Run seeds (works in prod too!)
pnpm seed:all      # Run seeds (TypeScript version, dev only)
```

## ✅ What This Fixes

Your original problem was **"relation countries does not exist"** because:
- ❌ No database tables were created
- ❌ No seed data was populated
- ❌ No automated migration system

Now you have:
- ✅ Automatic migration running on every deployment
- ✅ Optional seeding for reference data
- ✅ Production-ready, no dev dependencies needed
- ✅ Idempotent (safe to run multiple times)
- ✅ Transaction-safe (auto-rollback on failure)

## 🎬 Deploy Now

Let's fix your production database:

```bash
# Deploy with seeds (first time)
./scripts/deploy-production.sh --seed
```

After this runs, your app will:
1. Have all database tables created
2. Have countries, regions, resorts, and sports data populated
3. Start successfully without "relation does not exist" errors
4. Be accessible at https://localsnow.org

## 📚 More Information

- **Complete Documentation**: `docs/DATABASE_SETUP.md`
- **Troubleshooting**: See DATABASE_SETUP.md "Troubleshooting" section
- **Best Practices**: See DATABASE_SETUP.md "Best Practices" section

## 🆘 Quick Troubleshooting

**Problem:** Migrations fail
```bash
# Check logs
ssh dvemolina@vmi2543894 'docker service logs localsnow_app --tail 100'

# Run migrations with verbose output
ssh dvemolina@vmi2543894
docker run --rm \
  --network localsnow_localsnow_network \
  --secret source=localsnow_database_url,target=/run/secrets/localsnow_database_url \
  -e DATABASE_URL_FILE=/run/secrets/localsnow_database_url \
  ghcr.io/dvemolina/localsnow/localsnow:latest \
  node scripts/migrate.js
```

**Problem:** Seeds fail
```bash
# Make sure migrations ran first!
# Seeds depend on tables existing

# Check seed logs
docker run --rm \
  --network localsnow_localsnow_network \
  --secret source=localsnow_database_url,target=/run/secrets/localsnow_database_url \
  -e DATABASE_URL_FILE=/run/secrets/localsnow_database_url \
  ghcr.io/dvemolina/localsnow/localsnow:latest \
  node scripts/seed-production.js
```

**Problem:** App still returns 404/500
```bash
# Check app logs
ssh dvemolina@vmi2543894 'docker service logs localsnow_app -f'

# Verify database has data
ssh dvemolina@vmi2543894
docker exec -it $(docker ps -q -f name=localsnow_postgres) psql -U [user] -d [dbname]
# Then: SELECT COUNT(*) FROM countries;
```

## 🎉 You're Ready!

Your production deployment system is now **professional-grade**:
- ✅ Automated migrations
- ✅ Idempotent seeds
- ✅ Zero-downtime deployments
- ✅ Transaction safety
- ✅ Comprehensive logging

Just run: `./scripts/deploy-production.sh --seed`
