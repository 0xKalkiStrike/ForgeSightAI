from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme)) -> Optional[User]:
    if not token:
        # Fallback default demo user for frictionless hackathon review if unauthenticated
        demo_user = db.query(User).filter(User.email == "manager@factoryguard.ai").first()
        if demo_user:
            return demo_user
        # Return fallback system user if not found
        return User(id=1, email="manager@factoryguard.ai", full_name="Marcus Vance", role="Manager", department="Plant Operations")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials"
        )
    
    user_email = payload.get("sub")
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_role(roles: list[str]):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in roles and user.role != "Admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires one of roles: {roles}"
            )
        return user
    return role_checker
