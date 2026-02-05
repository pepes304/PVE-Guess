from Backend.Authorization.Schemas import UserCreate
from Backend.Authorization.AuthorizationDBConnect import Users, get_db
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from bcrypt import hashpw, gensalt
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hash_password(password: str) -> str:
    hashed = hashpw(password.encode('utf-8'), gensalt())
    return hashed.decode('utf-8')

@app.get("/get_user_from_id/{user_id}")
def get_user_from_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return { "nickname": user.nickname, }

@app.post("/register_user")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(Users).filter(Users.nickname == user.nickname).first()
    if db_user: raise HTTPException(status_code=400, detail="Nickname already taken")
    hashed_password = hash_password(user.password)
    new_user = Users(nickname=user.nickname, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return{ "message":"User registered successfully", "id": new_user.id, "nickname": new_user.nickname, }

@app.get("/get_all_users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(Users).all()
    return users

@app.delete("/delete_user_from_id/{user_id}", status_code=status.HTTP_200_OK)
def delete_user_from_id(user_id: int,db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ooops! User not found")
    db.delete(user)
    db.commit()
    return { "message":"User delete successfully" }