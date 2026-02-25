from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from Backend.Authorization.Schemas import UserCreate
from Backend.Authorization.AuthorizationDBConnect import get_db, Users
from Backend.Authorization.HashingPassword import hash_pw
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_users = db.query(Users).filter(Users.nickname == user.nickname).first()

    if db_users:
        raise HTTPException(status_code=409, detail="Nickname already taken")

    hashed_password = hash_pw(user.password)
    new_user = Users(nickname=user.nickname, password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message":"User registered  successfully",
        "id": new_user.id,
        "nickname": new_user.nickname
    }