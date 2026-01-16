# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
# VITE_API_URL will be injected at build time (Railway automatically passes VITE_* vars as build args)
# If not set, use relative path which will be proxied by nginx
RUN echo "Building with VITE_API_URL=${VITE_API_URL:-/api/v1}" && \
    npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script that generates nginx config
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 80

# Use our entrypoint script
ENTRYPOINT ["/entrypoint.sh"]