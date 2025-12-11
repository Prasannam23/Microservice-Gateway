# ----------- Builder Stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first
COPY package*.json ./

RUN npm ci

# Copy tsconfig + src (BOTH exist in your project)
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ----------- Runtime Stage -----------
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

# Copy only required runtime files
COPY package*.json ./

RUN npm ci --omit=dev

# Copy built dist folder from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/server.js"]
