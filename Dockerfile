# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install build dependencies (needed for bcrypt native bindings)
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

# Copy package files and install ALL dependencies (including dev for tsc)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Install typescript globally so tsc is available on PATH
RUN npm install -g typescript

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]