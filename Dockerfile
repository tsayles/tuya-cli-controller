# Multi-stage Docker build for Tuya Device Controller

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine AS production

# Install Node.js for any runtime requirements
RUN apk add --no-cache nodejs npm

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for runtime configuration
RUN mkdir -p /app

# Copy package.json for runtime dependencies if needed
COPY --from=builder /app/package*.json /app/

# Install only production dependencies if needed
WORKDIR /app
RUN npm ci --omit=dev

# Expose port 80 for the web application
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]