"""Add performance indexes

Revision ID: 008
Revises: 007
Create Date: 2026-01-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_indexes = {idx.get('name') for idx in inspector.get_indexes('expenses')}

    # Index on category_id for joins (prevents N+1 queries)
    if 'ix_expenses_category_id' not in existing_indexes:
        op.create_index('ix_expenses_category_id', 'expenses', ['category_id'])

    # Composite index for common query pattern (date range + category filter)
    if 'ix_expenses_date_category' not in existing_indexes:
        op.create_index('ix_expenses_date_category', 'expenses', ['date', 'category_id'])

    # Index for currency queries
    if 'ix_expenses_currency' not in existing_indexes:
        op.create_index('ix_expenses_currency', 'expenses', ['currency'])

    # Index for search on description (case-insensitive)
    # Works on both SQLite and PostgreSQL
    try:
        op.execute('CREATE INDEX IF NOT EXISTS ix_expenses_description_lower ON expenses (LOWER(description))')
    except Exception:
        # If the index creation fails (e.g., on SQLite with different syntax), skip it
        pass


def downgrade() -> None:
    # Drop indexes in reverse order
    try:
        op.execute('DROP INDEX IF EXISTS ix_expenses_description_lower')
    except Exception:
        pass
    try:
        op.execute('DROP INDEX IF EXISTS ix_expenses_currency')
    except Exception:
        pass
    try:
        op.execute('DROP INDEX IF EXISTS ix_expenses_date_category')
    except Exception:
        pass
    try:
        op.execute('DROP INDEX IF EXISTS ix_expenses_category_id')
    except Exception:
        pass
