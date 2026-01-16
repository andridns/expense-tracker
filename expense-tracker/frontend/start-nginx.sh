#!/bin/sh
set -e

# Check if BACKEND_URL is set
if [ -n "$BACKEND_URL" ]; then
    echo "BACKEND_URL is set to: $BACKEND_URL"
    echo "Configuring nginx to proxy API requests to backend..."
    
    # Install gettext for envsubst
    apk add --no-cache gettext > /dev/null 2>&1
    
    # Substitute BACKEND_URL in template
    envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
    
    echo "Nginx proxy configuration applied successfully"
else
    echo "BACKEND_URL not set, using default nginx config (no proxy)"
    echo "Note: API requests will fail. Set BACKEND_URL environment variable in Railway."
fi

# Start nginx
exec nginx -g 'daemon off;'
