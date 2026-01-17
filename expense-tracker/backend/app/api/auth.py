from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, UserResponse, GoogleTokenRequest
from app.core.auth import (
    verify_password,
    create_session_token,
    get_current_user,
    SESSION_COOKIE_NAME,
    SESSION_EXPIRE_HOURS,
    verify_google_token,
    get_allowed_emails
)
from datetime import timedelta
import os

router = APIRouter()
security = HTTPBearer(auto_error=False)


@router.post("/auth/login", response_model=UserResponse)
async def login(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Login with username and password"""
    try:
        user = db.query(User).filter(User.username == login_data.username).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        # Check if user has password (not OAuth-only user)
        if not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This account uses Google Sign-In. Please use Google to sign in."
            )
        
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled"
            )
        
        # Create session token
        session_token = create_session_token(str(user.id))
        
        # Set secure cookie for web clients (sticky session)
        # Use secure=True only in production (when HTTPS is available)
        is_production = os.getenv("ENVIRONMENT", "development") == "production"
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_token,
            max_age=SESSION_EXPIRE_HOURS * 3600,  # Convert hours to seconds
            httponly=True,
            secure=is_production,  # Set to True in production with HTTPS
            samesite="lax",  # Works for both same-site and cross-site requests
            path="/"
        )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        # Handle database errors (e.g., table doesn't exist) and other unexpected errors
        import traceback
        error_details = traceback.format_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}. Please ensure migrations have been run."
        )


@router.post("/auth/logout")
async def logout(response: Response):
    """Logout and clear session cookie"""
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        samesite="lax"
    )
    return {"message": "Logged out successfully"}


@router.post("/auth/google", response_model=UserResponse)
async def google_login(
    token_data: GoogleTokenRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Login with Google OAuth token"""
    try:
        # Verify Google ID token
        google_user_info = verify_google_token(token_data.id_token)
        
        if not google_user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
        
        email = google_user_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Check if email is in allowed list
        allowed_emails = get_allowed_emails()
        if allowed_emails and email.lower() not in [e.lower() for e in allowed_emails]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your email is not authorized to access this application"
            )
        
        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user from Google account
            name = google_user_info.get("name", "")
            username = email.split("@")[0]  # Use email prefix as username
            
            # Ensure username is unique
            base_username = username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User(
                username=username,
                email=email,
                password_hash=None,  # No password for OAuth users
                is_active=True,
                auth_provider="google"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user if needed
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is disabled"
                )
            # Update auth provider if it changed
            if user.auth_provider != "google":
                user.auth_provider = "google"
                db.commit()
        
        # Create session token
        session_token = create_session_token(str(user.id))
        
        # Set secure cookie
        is_production = os.getenv("ENVIRONMENT", "development") == "production"
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_token,
            max_age=SESSION_EXPIRE_HOURS * 3600,
            httponly=True,
            secure=is_production,
            samesite="lax",
            path="/"
        )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user information"""
    return current_user
