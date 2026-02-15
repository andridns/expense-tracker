"""Add correction_idr to rent_expenses

Revision ID: 011
Revises: 010
Create Date: 2026-02-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '011'
down_revision = '010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'rent_expenses',
        sa.Column('correction_idr', sa.Numeric(15, 2), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    op.drop_column('rent_expenses', 'correction_idr')

