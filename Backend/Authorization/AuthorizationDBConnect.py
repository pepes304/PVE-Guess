from sqlalchemy.orm import Session, declarative_base, sessionmaker
from sqlalchemy import Column, create_engine, Integer, String, CheckConstraint

DB_URL = "postgresql+psycopg2://postgres:w3o1l2f7@localhost:5432/PVE-Guesser"

engine = create_engine(DB_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit= False, autoflush=False, bind=engine)

class Users(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column("nick",String(16), nullable=False, index=True, unique=True)
    password = Column(String(128), nullable=False)
    email = Column(String, nullable=False, unique=True,)
    score = Column(Integer, nullable=False, server_default="0")

    __table_args__ = (CheckConstraint("char_length(nickname) >= 2",
    name="nickname_min_length"),

    CheckConstraint("char_length(password) >= 8",
    name="password_min_length"))

try:
    Base.metadata.create_all(bind=engine)

except Exception as e:
    print(f"Warning: could not be create DB tables at startup: {e}")

def get_db() -> Session:
    db = SessionLocal()

    try:
        yield  db

    finally:
        db.close()














