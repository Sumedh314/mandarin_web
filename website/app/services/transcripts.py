from sqlalchemy.orm import Session
from sqlalchemy import select, insert
from app.models import TranscriptLine
from config import transcript_generator, MANDARIN_AND_ENGLISH_LANGUAGE_CODES


def add_transcript(session: Session, video_id: str, transcript: list[dict]):
    """Adds a YouTube video's transcript lines to the database"""
    transcript_lines = [TranscriptLine(video_id=video_id, **line) for line in transcript]
    print(transcript_lines)
    statement = insert(TranscriptLine).values([{'video_id': video_id, **line} for line in transcript])
    session.execute(statement)


def get_transcript_from_database(session: Session, video_id: str):
    """Fetches the transcript of a YouTube video from the database"""
    statement = select(TranscriptLine.text, TranscriptLine.start, TranscriptLine.duration).where(TranscriptLine.video_id == video_id)
    transcript = session.execute(statement).mappings().all()
    transcript = [dict(row) for row in transcript]
    return transcript


def get_transcript_from_youtube(video_id: str):
    """Uses YouTubeTranscriptAPI to fetch the transcript of a YouTube video that has captions"""
    transcript = transcript_generator.fetch(video_id, MANDARIN_AND_ENGLISH_LANGUAGE_CODES).to_raw_data()
    return transcript