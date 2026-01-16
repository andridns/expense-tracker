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

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy startup script
COPY start-nginx.sh /start-nginx.sh
RUN chmod +x /start-nginx.sh

# Expose port
EXPOSE 80

# Start nginx with proxy configuration if BACKEND_URL is set
CMD ["/start-nginx.sh"]
