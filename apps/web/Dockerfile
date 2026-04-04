FROM node:20-alpine AS builder

WORKDIR /workspace

# Copy shared packages and web frontend into absolute monorepo architecture
COPY apps/packages ./apps/packages
COPY apps/web ./apps/web

WORKDIR /workspace/apps/web

# Install dependencies local to web app
RUN npm ci

# Remove ARG/ENV overrides to allow Next.js to cleanly fallback to the physical .env files

RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Next.js native .env files are copied below to provide runtime configurations

# Copy necessary files specifically from the builder's nested directory
COPY --from=builder /workspace/apps/web/package*.json ./
COPY --from=builder /workspace/apps/web/node_modules ./node_modules
COPY --from=builder /workspace/apps/web/.next ./.next
COPY --from=builder /workspace/apps/web/public ./public
COPY --from=builder /workspace/apps/web/.env* ./
COPY --from=builder /workspace/apps/web/next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]
