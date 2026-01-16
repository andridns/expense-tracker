# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build-time API URL and expose it to Vite during `npm run build`
# NOTE: Vite only exposes variables prefixed with VITE_*
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
# If VITE_API_URL is not provided as a build arg, your code will fall back to /api/v1
RUN echo "Building with VITE_API_URL=${VITE_API_URL:-<not set, fallback will be /api/v1>}" && \
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
