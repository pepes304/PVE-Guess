from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from Backend.Authorization.AuthorizationDBConnect import get_db, Users
from Backend.Authorization.JWT import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):

    try:
        payload = verify_access_token(token)
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(Users).filter(Users.id == int(user_id)).first()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user