from bcrypt import hashpw, gensalt, checkpw

def hash_pw(password: str) -> str:
    hashed = hashpw(password.encode('utf-8'), gensalt())
    return hashed.decode('utf-8')

def verify_pw(plain_password: str, hashed_password: str) -> bool:
    return checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )