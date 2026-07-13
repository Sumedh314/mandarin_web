from sqlalchemy.orm import Session

from app.models import Video, TranscriptLine
import app.modules.videos.repository as repository
from config import transcript_generator, MANDARIN_AND_ENGLISH_LANGUAGE_CODES


# VIDEOS


def add_video(session: Session, **kwargs):
    """Add a YouTube video to the database."""
    video = Video(**kwargs)
    repository.add_video(session, video)
    session.commit()
    return video


def get_video_title(session: Session, id: str):
    """Get the title of a YouTube video."""
    video = repository.get_video_by_id(session, id)
    return video.title


def update_video_title(session: Session, id: str, title: str):
    """Update the title of a YouTube video."""
    video = repository.get_video_by_id(session, id)
    video.title = title
    session.commit()
    return video


def check_video_exists(session: Session, id: str):
    """Check if a YouTube video exists in the database."""
    video = repository.get_video_by_id(session, id)
    return video is not None


def get_video_last_index(session: Session, user_id: int, video_id: str):
    """Get the last index for a video."""
    video = repository.get_user_video_by_ids(session, user_id, video_id)
    return video.last_index


def update_video_last_index(
    session: Session,
    user_id: int,
    video_id: str,
    last_index: int
):
    """Update the last index for a video."""
    video = repository.get_user_video_by_ids(session, user_id, video_id)
    video.last_index = last_index
    session.commit()
    return video


# TRANSCRIPTS


def add_transcript(session: Session, video_id: str, transcript: list[dict]):
    """Add a YouTube video's transcript lines to the database."""
    lines = [TranscriptLine(video_id=video_id, **line) for line in transcript]
    repository.add_transcript_lines(session, lines)
    session.commit()
    return lines


def get_transcript_from_database(session: Session, video_id: int):
    """Get the transcript of a YouTube video from the database."""
    transcript_lines = repository.get_transcript_lines(session, video_id)
    return sort_transcript_lines(transcript_lines)


def get_transcript_from_youtube(video_id: str):
    """Get the transcript of a new YouTube video that has captions."""
    try:
        return (
            transcript_generator
            .fetch(video_id, MANDARIN_AND_ENGLISH_LANGUAGE_CODES)
            .to_raw_data()
        )
    except:
        return []


def sort_transcript_lines(transcript_lines: list[TranscriptLine]):
    """Sort a transcript by its timestamp in each line."""
    transcript = [
        {'text': line.text, 'start': line.start, 'duration': line.duration}
        for line in transcript_lines
    ]
    transcript.sort(key=lambda line: line['start'])
    return transcript