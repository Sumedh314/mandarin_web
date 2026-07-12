from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import User


def add_user(session: Session, user: User):
    """Adds a user to the database"""
    session.add(user)
    return user


def get_user_by_id(session: Session, id: int):
    """Returns a user object based on the user ID"""
    return session.get(User, id)


def get_user_by_username(session: Session, username: str):
    """Returns a user object based on the username"""
    statement = select(User).where(User.username == username)
    return session.scalar(statement)