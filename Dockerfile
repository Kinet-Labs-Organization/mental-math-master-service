# Production-grade NestJS Dockerfile

# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies, keeping only production dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:18-alpine AS production

# Install dumb-init to properly handle signals
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package.json for metadata
COPY package*.json ./

# Copy production dependencies from dependencies stage
COPY --from=build /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=build /app/prisma ./prisma

# Create necessary directories and set permissions
RUN mkdir -p /app/logs && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "run", "start:prod"]