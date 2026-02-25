from pydantic import BaseModel

class UserCreate(BaseModel):
    nickname: str
    password: str

    class Config:
        from_attributes = True


