from sqlalchemy import create_engine, Column, Integer, String, CheckConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, Session

DB_URL = "postgresql+psycopg2://postgres:w3o1l2f7@localhost:5432/PVE-Guesser"

engine = create_engine(DB_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Users(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(16), nullable=False, index=True)
    password = Column(String(128), nullable=False)
    __table_args__ = ( CheckConstraint("char_length(nickname) >= 2",
    name="nickname_min_length"),

    CheckConstraint("char_length(password) >= 6",
    name="password_min_length"), )

try:
    Base.metadata.create_all(bind=engine)

except Exception as e:
    print(f"Warning: could not create DB tables at startup: {e}")

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
         db.close()