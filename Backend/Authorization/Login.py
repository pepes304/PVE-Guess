from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from Backend.Authorization.AuthorizationDBConnect import get_db, Users
from Backend.Authorization.HashingPassword import verify_pw
from Backend.Authorization.JWT import create_access_token

router = APIRouter()

@router.post("/login")
def login(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    user = db.query(Users).filter(Users.nickname==form_data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_pw(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    accessToken = create_access_token(
        data = {"sub": str(user.id)}
    )

    return {
        "access_token": accessToken,
        "token_type": "bearer"
    }