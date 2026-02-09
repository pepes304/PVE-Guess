from bcrypt import hashpw, gensalt

def hash_pw(password: str) -> str:
    hashed = hashpw(password.encode('utf-8'), gensalt())
    return hashed.decode('utf-8')