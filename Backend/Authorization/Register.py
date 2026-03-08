from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from Backend.Authorization.OAuth2 import current_user
from Backend.Authorization.Login import router
from Backend.Authorization.Schemas import UserCreate
from Backend.Authorization.AuthorizationDBConnect import get_db, Users
from Backend.Authorization.HashingPassword import hash_pw

app = FastAPI()
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/profile")
def profile(current_user = Depends(current_user)):
    return {
        "id": current_user.id,
        "nickname": current_user.nickname
    }

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