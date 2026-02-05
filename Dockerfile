# =============================================
# Multi-stage Dockerfile for Zentra Shop Monolith
# =============================================

# Stage 1: Build Frontend (Angular)
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source code
COPY src ./src
COPY public ./public
COPY angular.json tsconfig*.json tailwind.config.js ./

# Build frontend for production
RUN npm run build -- --configuration production

# =============================================
# Stage 2: Build Backend (NestJS)
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci

# Copy backend source code
COPY server/src ./src
COPY server/tsconfig*.json server/nest-cli.json ./

# Build backend
RUN npm run build

# =============================================
# Stage 3: Production Image
FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy backend production dependencies
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend to be served by NestJS
COPY --from=frontend-builder /app/frontend/dist/frontend/browser ./dist/frontend/browser

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/products', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["dumb-init", "node", "dist/main.js"]
