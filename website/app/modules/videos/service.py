import os

import requests
from sqlalchemy.orm import Session

from app.models import Video, UserVideo, TranscriptLine
import app.modules.videos.repository as videos_repository
import app.modules.words.service as words_service
from config import transcript_generator, MANDARIN_AND_ENGLISH_LANGUAGE_CODES


# VIDEOS


def add_video(session: Session, **kwargs):
    """Add a YouTube video to the database."""
    video = Video(**kwargs)
    videos_repository.add_video(session, video)
    session.commit()
    return video


def add_user_video(session: Session, user_id: int, video_id: str, **kwargs):
    """Add a YouTube video for a user to the database."""
    video_exists = check_video_exists(session, video_id)
    if not video_exists:
        video = Video(id=video_id, **kwargs)
        videos_repository.add_video(session, video)
    user_video = UserVideo(user_id=user_id, video_id=video_id)
    videos_repository.add_user_video(session, user_video)
    session.commit()
    return user_video


def get_video_title(session: Session, id: str):
    """Get the title of a YouTube video."""
    video = videos_repository.get_video_by_id(session, id)
    return video.title


def update_video_title(session: Session, id: str, title: str):
    """Update the title of a YouTube video."""
    video = videos_repository.get_video_by_id(session, id)
    video.title = title
    session.commit()
    return video


def check_video_exists(session: Session, video_id: str):
    """Check if a YouTube video exists in the database."""
    video = videos_repository.get_video_by_id(session, video_id)
    return video is not None


def check_video_exists_for_user(session: Session, user_id: int, video_id: str):
    """Check if a YouTube video exists in the database."""
    video = videos_repository.get_user_video_by_ids(session, user_id, video_id)
    return video is not None


def get_video_last_index(session: Session, user_id: int, video_id: str):
    """Get the last index for a video."""
    video = videos_repository.get_user_video_by_ids(session, user_id, video_id)
    print(video)
    if video is None:
        video = add_user_video(session, user_id, video_id)
    return video.last_index


def update_video_last_index(
    session: Session,
    user_id: int,
    video_id: str,
    last_index: int
):
    """Update the last index for a video."""
    video = videos_repository.get_user_video_by_ids(session, user_id, video_id)
    video.last_index = last_index
    session.commit()
    return video


# TRANSCRIPTS


def get_transcript(session: Session, user_id: int, video_id: str):
    """Get the transcript of a YouTube video.
    
    If the database already contains the transcript, this function gets
    the transcript already in the database. Otherwise, it fetches the
    transcript using YouTubeTranscriptAPI and adds it to the database.

    If the video does not already exist in the database, this function
    creates a new video with the given ID.
    
    Arguments:
        session (sqlalchemy.orm.Session): The database session.
        video_id (str): The ID of the YouTube video.
    
    Returns:
        (list[dict]): The raw transcrpit lines sorted by timestamp.
    """
    video = videos_repository.get_video_by_id(session, video_id)
    if video is None:
        video = add_video(session, id=video_id)
    if len(video.transcript_lines) > 0:
        return get_transcript_from_database(session, video_id), 200
    transcript = get_transcript_from_youtube(video_id)
    add_transcript(session, video_id, transcript)
    
    return transcript, 201


def add_transcript(session: Session, video_id: str, transcript: list[dict]):
    """Add a YouTube video's transcript lines to the database."""
    lines = [TranscriptLine(video_id=video_id, **line) for line in transcript]
    videos_repository.add_transcript_lines(session, lines)
    session.commit()
    return lines


def get_transcript_from_database(session: Session, video_id: int):
    """Get the transcript of a YouTube video from the database."""
    transcript_lines = videos_repository.get_transcript_lines(session, video_id)
    return [
        {'text': line.text, 'start': line.start, 'duration': line.duration}
        for line in transcript_lines
    ]


def get_transcript_from_youtube(video_id: str) -> dict:
    """Get the transcript of a new YouTube video that has captions."""
    password = os.getenv('RASPBERRY_PI_PASSWORD')
    formatted_language_codes = '&'.join(
        ['code=' + code for code in MANDARIN_AND_ENGLISH_LANGUAGE_CODES]
    )
    print(formatted_language_codes)
    transcript_response = (
        requests.post(
            (
                f'https://sumedh.tail3317aa.ts.net/transcript/'
                f'{video_id}?'
                f'{formatted_language_codes}'
            ),
            json={'password': password}
        )
    )
    print('Transcript:', transcript_response.status_code)
    print(transcript_response.json())
    return transcript_response.json()