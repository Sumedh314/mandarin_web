from sqlalchemy.orm import Session

from app.models import TranscriptLine
import app.repositories.transcripts as transcripts_repository
from config import transcript_generator, MANDARIN_AND_ENGLISH_LANGUAGE_CODES


def add_transcript(session: Session, video_id: str, raw_transcript: list[dict]):
    """Adds a YouTube video's transcript lines to the database"""
    transcript_lines = [TranscriptLine(video_id=video_id, **line) for line in raw_transcript]
    transcripts_repository.add_transcript_lines(session, transcript_lines)
    session.commit()
    return transcript_lines


def get_transcript_from_database(session: Session, video_id: int):
    """Fetches the transcript of a YouTube video from the database"""
    transcript_lines = transcripts_repository.get_transcript_lines(session, video_id)
    return sort_transcript_lines(transcript_lines)


def get_transcript_from_youtube(youtube_id: str):
    """Uses YouTubeTranscriptAPI to fetch the transcript of a YouTube video that has captions"""
    try:
        return transcript_generator.fetch(youtube_id, MANDARIN_AND_ENGLISH_LANGUAGE_CODES).to_raw_data()
    except:
        return []


def sort_transcript_lines(transcript_lines: list[TranscriptLine]):
    """Sorts a transcript by its timestamp in each line"""
    transcript = [{'text': line.text, 'start': line.start, 'duration': line.duration} for line in transcript_lines]
    transcript.sort(key=lambda line: line['start'])
    return transcript