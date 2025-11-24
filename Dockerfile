# =============================================================================
# Multi-stage Dockerfile for LocalSnow SvelteKit Application
# Optimized for production deployment on Docker Swarm
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:25-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (production + dev for build)
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:25-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Load dummy environment variables for the build only
COPY .env.build .env

# Export all vars from .env file and build
# Increase Node.js memory limit to prevent heap out of memory errors during build
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN export $(cat .env | xargs) && pnpm run build

# -----------------------------------------------------------------------------
# Stage 3: Runner (Production)
# -----------------------------------------------------------------------------
FROM node:25-alpine AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sveltekit

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json

# Copy static files if needed
COPY --from=builder --chown=sveltekit:nodejs /app/static ./static

# Copy database migration files and scripts
COPY --from=builder --chown=sveltekit:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=sveltekit:nodejs /app/scripts/migrate.js ./scripts/migrate.js
COPY --from=builder --chown=sveltekit:nodejs /app/scripts/seed-production.js ./scripts/seed-production.js
COPY --from=builder --chown=sveltekit:nodejs /app/scripts/start.sh ./scripts/start.sh
COPY --from=builder --chown=sveltekit:nodejs /app/scripts/db-init.sh ./scripts/db-init.sh
COPY --from=builder --chown=sveltekit:nodejs /app/src/lib/server/db/seeds/data ./src/lib/server/db/seeds/data

# Make scripts executable
USER root
RUN chmod +x /app/scripts/*.sh /app/scripts/*.js
USER sveltekit

# Set user
USER sveltekit

# Expose port (SvelteKit default)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {let body='';r.on('data', (d) => body+=d);r.on('end', () => {const ok=r.statusCode===200;process.exit(ok?0:1);});}).on('error', () => process.exit(1))"

# Set environment to production
ENV NODE_ENV=production

# Start the application (startup script runs migrations first, then starts app)
CMD ["/app/scripts/start.sh"]
