# =============================================================================
# ZhiYin (知音) - Secure Production Dockerfile
# Multi-stage build: source code stays in build stage, NOT in final image
# =============================================================================

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile --registry https://registry.npmmirror.com
RUN npx prisma generate

# ── Stage 2: Build (source code lives here ONLY, discarded after) ──
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build with standalone output - produces compiled server bundle
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build --webpack

# ── Stage 3: Production runtime (NO source code) ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy ONLY compiled artifacts - no source code
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create encrypted data directory
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Switch to non-root user
USER nextjs

EXPOSE 3456
ENV PORT=3456
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=file:/app/data/prod.db

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3456').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
