from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")
    
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables.")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"}
)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def create_tables():
    Base.metadata.tables['product_info'].create(bind=engine)
    Base.metadata.tables['products'].create(bind=engine)

def get_db():
    """
    Generator function for database sessions.

    Yields:
        Session: SQLAlchemy session instance.
    """
    db = Session()
    try:
        yield db
    finally:
        db.close()
