from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import TranscriptLine


def add_transcript_lines(session: Session, transcript_lines: list[TranscriptLine]):
    """Adds transcript lines to the database"""
    session.add_all(transcript_lines)
    return transcript_lines


def get_transcript_lines(session: Session, video_id: str):
    """Gets all transcript lines associated with a video from the database"""
    statement = select(TranscriptLine).where(TranscriptLine.video_id == video_id)
    return session.scalars(statement).all()