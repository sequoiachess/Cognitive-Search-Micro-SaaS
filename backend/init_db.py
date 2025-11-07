from app.database import engine
from app.models import Base
from sqlalchemy import text

# Create pgvector extension
with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    conn.commit()

# Create all tables
Base.metadata.create_all(bind=engine)

print("Database initialized with pgvector extension!")
