from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import User


def get_user_by_id(session: Session, id: int):
    """Returns a user object based on the user ID"""
    return session.get(User, id)


def get_user_by_username(session: Session, username: str):
    """Returns a user object based on the username"""
    statement = select(User).where(User.username == username)
    return session.scalar(statement)


def create_user(session: Session, **kwargs):
    password = kwargs.pop('password', None)
    user = User(**kwargs)

    if password:
        user.set_password(password)
        
    session.add(user)
    session.commit()
    return user