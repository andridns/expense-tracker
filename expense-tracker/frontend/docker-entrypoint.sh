#!/bin/sh
set -e

echo "=== Nginx Entrypoint ===" >&2
echo "BACKEND_URL=${BACKEND_URL:-NOT SET}" >&2

# Generate nginx config from template BEFORE nginx entrypoint processes it
if [ -n "$BACKEND_URL" ]; then
    echo "Generating nginx config with BACKEND_URL=$BACKEND_URL" >&2
    # Use envsubst to replace ${BACKEND_URL} in template
    envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
    echo "✓ Nginx config generated successfully" >&2
    echo "Testing nginx config..." >&2
    nginx -t >&2 || {
        echo "ERROR: Generated nginx config is invalid!" >&2
        exit 1
    }
else
    echo "ERROR: BACKEND_URL is not set!" >&2
    echo "Creating nginx config without proxy (API calls will fail)" >&2
    # Create a basic config without proxy
    cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
fi

# Execute the default nginx entrypoint (it will start nginx)
exec /docker-entrypoint.sh nginx -g 'daemon off;'
