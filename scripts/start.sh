#!/bin/sh
set -e

echo "🚀 Starting LocalSnow..."
echo ""

# Run migrations automatically on startup
echo "📊 Running database migrations..."
node /app/scripts/migrate.js

# Check if we should seed (only on first deployment or when SEED_DATA=true)
if [ "${SEED_DATA}" = "true" ]; then
  echo ""
  echo "🌱 Seeding database..."
  node /app/scripts/seed-production.js
fi

echo ""
echo "✅ Database ready!"
echo "🚀 Starting application..."
echo ""

# Start the SvelteKit app
exec node build/index.js
