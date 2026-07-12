from sqlalchemy.orm import Session

from app.models import User
import app.modules.auth.repository as auth_repository


def create_user(session: Session, **kwargs):
    password = kwargs.pop('password', None)
    user = User(**kwargs)

    if password:
        user.set_password(password)
        
    user = auth_repository.add_user(session, user)
    session.commit()
    return user