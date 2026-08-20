from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db
import app.modules.videos.service as service


videos_bp = Blueprint('videos', __name__, url_prefix='/api/v1/videos')


# VIDEOS


@videos_bp.post('')
@jwt_required()
def add_user_video():
    """Add a new video to the database."""
    video_data = request.get_json()
    video_id = video_data['video_id']
    user_id = int(get_jwt_identity())
    service.add_user_video(db.session, user_id, video_id)
    return jsonify('success'), 201


@videos_bp.get('/<video_id>/title')
def get_video_title(video_id: str):
    """Get the title of a video from the database."""
    title = service.get_video_title(db.session, video_id)
    return jsonify(title), 200


@videos_bp.patch('/<video_id>/title')
def update_video_title(video_id: str):
    """Update the title of a video."""
    title = request.get_json()['title']
    service.update_video_title(db.session, video_id, title)
    return jsonify('success'), 200


@videos_bp.get('/check')
@jwt_required()
def check_video_exists():
    """Check if a video exists in the database."""
    video_id = request.args.get('video_id')
    video_exists = service.check_video_exists(db.session, video_id)
    return jsonify(video_exists), 200


# USER VIDEO PROGRESS


@videos_bp.get('/check/user')
@jwt_required()
def check_video_exists_for_user():
    """Check if a video exists in the database."""
    video_id = request.args.get('video_id')
    user_id = int(get_jwt_identity())
    video_exists = service.check_video_exists_for_user(db.session, user_id, video_id)
    return jsonify(video_exists), 200


@videos_bp.get('/<video_id>/last-index')
@jwt_required()
def get_video_last_index(video_id: str):
    """Get the last index for a video."""
    user_id = int(get_jwt_identity())
    last_index = service.get_video_last_index(db.session, user_id, video_id)
    return jsonify(last_index), 200


@videos_bp.patch('/<video_id>/last-index')
@jwt_required()
def update_video_last_index(video_id: str):
    """Update the last index of a video."""
    user_id = int(get_jwt_identity())
    last_index = request.get_json()['last_index']
    service.update_video_last_index(db.session, user_id, video_id, last_index)
    return jsonify('success'), 200


# TRANSCRIPTS


@videos_bp.post('/transcripts')
def add_transcript():
    """Add a transcript of a YouTube video to the database."""
    transcript_data = request.get_json()
    transcript = transcript_data['transcript']
    video_id = transcript_data['video_id']
    service.add_transcript(db.session, video_id, transcript)
    return jsonify('success'), 200


@videos_bp.get('/transcripts/<video_id>')
@jwt_required(optional=True)
def get_transcript(video_id: str):
    """Get the transcript of a YouTube video."""
    user_id = int(get_jwt_identity())
    transcript, status_code = service.get_transcript(db.session, user_id, video_id)
    return jsonify(transcript), status_code


@videos_bp.get('/transcripts/new')
def get_new_transcript():
    """Get the transcript of a new YouTube video."""
    video_id = request.args.get('video_id')
    print(video_id)
    transcript = service.get_transcript_from_youtube(video_id)
    return jsonify(transcript), 200


@videos_bp.get('/transcripts/data/<video_id>')
def get_transcript_from_database(video_id: str):
    """Get the full transcript of a YouTube video from the database."""
    transcript = service.get_transcript_from_database(db.session, video_id)
    return jsonify(transcript), 200