from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import Video, UserVideo, TranscriptLine


# VIDEOS


def add_video(session: Session, video: Video):
    """Add a video to the database."""
    session.add(video)
    return video


def add_user_video(session: Session, user_video: UserVideo):
    """Add a user video to the database."""
    session.add(user_video)
    return user_video


def get_video_by_id(session: Session, id: str):
    """Get a video from the database based on its ID."""
    return session.get(Video, id)


def get_user_video_by_ids(session: Session, user_id: int, video_id: str):
    """Get a video specific to the user by the user and video IDs."""
    statement = select(UserVideo).where(
        UserVideo.user_id == user_id,
        UserVideo.video_id == video_id
    )
    return session.scalar(statement)


# TRANSCRIPTS


def add_transcript_lines(session: Session, transcript_lines: list[TranscriptLine]):
    """Add transcript lines to the database."""
    session.add_all(transcript_lines)
    return transcript_lines


def get_transcript_lines(session: Session, video_id: str):
    """Get all transcript lines associated with a video."""
    statement = (
        select(TranscriptLine)
        .where(TranscriptLine.video_id == video_id)
        .order_by(TranscriptLine.start)
    )
    return session.scalars(statement).all()