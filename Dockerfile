# =============================================
# Stage 1: Build
# =============================================
FROM node:20-alpine AS build

# Prisma needs OpenSSL available in Alpine-based images.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

# Install ALL deps (dev included) needed to compile
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile NestJS
RUN npm run build

# Prune to production deps only
RUN npm prune --omit=dev

# Keep the Prisma CLI available because the runtime command applies migrations.
RUN npm install --omit=dev prisma@$(node -p "require('./node_modules/@prisma/client/package.json').version")


# =============================================
# Stage 2: Production
# =============================================
FROM node:20-alpine AS production

# Install dumb-init for signal handling, curl for healthcheck, and OpenSSL for Prisma.
RUN apk add --no-cache dumb-init curl openssl

# Set NODE_ENV early so all libs behave in production mode
ENV NODE_ENV=production

# Use ARG so PORT can be overridden at build time; ENV makes it available at runtime
ARG PORT=8000
ENV PORT=${PORT}

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy artifacts from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Only copy prisma folder if you run migrations at startup
# Remove this line if you run migrations separately (recommended)
COPY --from=build /app/prisma ./prisma

# Set permissions
RUN mkdir -p /app/logs && \
    chown -R nestjs:nodejs /app

USER nestjs

# Documents which port the app uses (actual binding is via -p at runtime)
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
