from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.models import Video


def add_video(session: Session, video_id: str):
    """Adds a YouTube video to the database"""
    video = Video(video_id=video_id)
    session.add(video)


def get_video_title(session: Session, video_id: str):
    """Fetches the title of a YouTube video from the database"""
    statement = select(Video.title).where(Video.video_id == video_id)
    title = session.scalar(statement)
    return title


def update_video_title(session: Session, video_id: str, title: str):
    """Updates the title of a YouTube video in the database"""
    statement = update(Video).where(Video.video_id == video_id).values(title=title)
    session.execute(statement)


def check_video_exists(session: Session, video_id: str):
    """Checks if a YouTube video exists in the database"""
    statement = select(Video).where(Video.video_id == video_id)
    video = session.scalar(statement)
    return video is not None


def get_video_last_index(session: Session, video_id: str):
    """Gets the last index for the place where user left off in a video"""
    statement = select(Video.last_index).where(Video.video_id == video_id)
    last_index = session.scalar(statement)
    return last_index


def update_video_last_index(session: Session, video_id: str, new_last_index: int):
    """Updates the last index for the place where user left off in a video"""
    statement = update(Video).where(Video.video_id == video_id).values(last_index=new_last_index)
    session.execute(statement)