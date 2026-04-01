FROM node:20-alpine AS builder

WORKDIR /workspace

# Copy shared packages and web frontend into absolute monorepo architecture
COPY apps/packages ./apps/packages
COPY apps/web ./apps/web

WORKDIR /workspace/apps/web

# Install dependencies local to web app
RUN npm ci

# NEXT_PUBLIC_ variables must be evaluated at build-time to be bundled into the static JS chunks
ARG NEXT_PUBLIC_BFF_URL
ARG NEXT_PUBLIC_BASE_PATH
ARG INTERNAL_BFF_URL
ENV NEXT_PUBLIC_BFF_URL=${NEXT_PUBLIC_BFF_URL}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV INTERNAL_BFF_URL=${INTERNAL_BFF_URL}

RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files specifically from the builder's nested directory
COPY --from=builder /workspace/apps/web/package*.json ./
COPY --from=builder /workspace/apps/web/node_modules ./node_modules
COPY --from=builder /workspace/apps/web/.next ./.next
COPY --from=builder /workspace/apps/web/public ./public
COPY --from=builder /workspace/apps/web/next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]
