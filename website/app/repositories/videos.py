from sqlalchemy.orm import Session

from app.models import Video


def add_video(session: Session, video: Video):
    """Adds a video to the videos table in the database"""
    session.add(video)
    return video


def get_video_by_id(session: Session, id: str):
    """Gets a Video object from the database based on its video ID"""
    return session.get(Video, id)