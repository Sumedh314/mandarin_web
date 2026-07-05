from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app.models import Video
import app.repositories.videos as videos_repository


def add_video(session: Session, id: str):
    """Adds a YouTube video to the database"""
    video = Video(id=id)
    videos_repository.add_video(session, video)
    session.commit()
    return video


def get_video_title(session: Session, id: str):
    """Fetches the title of a YouTube video from the database"""
    video = videos_repository.get_video_by_id(session, id)
    return video.title


def update_video_title(session: Session, id: str, title: str):
    """Updates the title of a YouTube video in the database"""
    video = videos_repository.get_video_by_id(session, id)
    print(title)
    print(id)
    print(video)
    video.title = title
    session.commit()
    return video


def check_video_exists(session: Session, id: str):
    """Checks if a YouTube video exists in the database"""
    video = videos_repository.get_video_by_id(session, id)
    return video is not None


def get_video_last_index(session: Session, id: str):
    """Gets the last index for the place where user left off in a video"""
    video = videos_repository.get_video_by_id(session, id)
    return video.last_index


def update_video_last_index(session: Session, id: str, new_last_index: int):
    """Updates the last index for the place where user left off in a video"""
    video = videos_repository.get_video_by_id(session, id)
    video.last_index = new_last_index
    session.commit()
    return video