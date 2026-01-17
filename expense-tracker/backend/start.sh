#!/bin/bash
# Don't use set -e here - we want to handle errors gracefully

# Wait for database to be ready (if using PostgreSQL)
# Railway handles database readiness, but we can add a simple retry loop
if [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" == postgresql* ]]; then
    echo "Waiting for database connection..."
    # Simple retry loop - try migrations, they will fail if DB is not ready
    for i in {1..30}; do
        if poetry run alembic current &>/dev/null 2>&1 || poetry run python -c "from app.database import engine; engine.connect()" &>/dev/null 2>&1; then
            echo "Database is ready!"
            break
        fi
        echo "Waiting for database... ($i/30)"
        sleep 2
    done
fi

# Run database migrations
echo "Running database migrations..."
poetry run alembic upgrade head || {
    echo "Warning: Migration failed or already up to date"
}

# Seed database if empty (only seed categories, not sample expenses)
echo "Checking if database needs seeding..."
CATEGORY_COUNT=$(poetry run python -c "from app.database import SessionLocal; from app.models.category import Category; db = SessionLocal(); count = db.query(Category).count(); db.close(); print(count)" 2>/dev/null || echo "0")
if [ "$CATEGORY_COUNT" = "0" ]; then
    echo "Database is empty. Seeding default categories..."
    poetry run python scripts/seed_data.py || {
        echo "Warning: Seeding failed or already seeded"
    }
else
    echo "Database already has data. Skipping seed."
fi

# Always sync user credentials from environment variables
# This allows updating credentials via Railway env vars (DEFAULT_USERNAME, DEFAULT_PASSWORD)
echo "Syncing user credentials from environment variables..."
poetry run python -c "
from app.database import SessionLocal
from app.models.user import User
from app.core.auth import get_password_hash
import os

db = SessionLocal()
try:
    username = os.getenv('DEFAULT_USERNAME', 'admin')
    password = os.getenv('DEFAULT_PASSWORD')
    
    user = db.query(User).filter(User.username == username).first()
    if user and password:
        user.password_hash = get_password_hash(password)
        user.is_active = True
        db.commit()
        print(f'✓ Updated user \"{username}\" password from DEFAULT_PASSWORD environment variable')
    elif user:
        print(f'✓ User \"{username}\" exists (set DEFAULT_PASSWORD env var to update password)')
    else:
        print(f'⚠ User \"{username}\" not found (run seed script to create)')
finally:
    db.close()
" || {
    echo "Warning: Failed to sync user credentials"
}

# Start the application
echo "Starting FastAPI server..."
exec poetry run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
