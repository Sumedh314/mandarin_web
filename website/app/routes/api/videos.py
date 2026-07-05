from flask import Blueprint, request, jsonify

from app.models import db
import app.services.videos as videos_service


videos_bp = Blueprint('videos', __name__, url_prefix='/api/v1/videos')


@videos_bp.post('')
def add_video():
    """Adds a new video to the database"""
    video_data = request.json
    video_id = video_data['video_id']
    video = videos_service.add_video(db.session, video_id)
    print(video)
    return jsonify('success'), 201


@videos_bp.get('/<video_id>/title')
def get_video_title(video_id: str):
    """Gets the title of a video from the database"""
    title = videos_service.get_video_title(db.session, video_id)
    return jsonify(title), 200


@videos_bp.patch('/<video_id>/title')
def update_video_title(video_id: str):
    """Updates the title of a video in the database"""
    title = request.json['title']
    print(video_id)
    print(title)
    videos_service.update_video_title(db.session, video_id, title)
    return jsonify('success'), 200


@videos_bp.get('/check')
def check_video_exists():
    """Checks if a video exists in the database"""
    video_id = request.args.get('video_id')
    video_exists = videos_service.check_video_exists(db.session, video_id)
    return jsonify(video_exists), 200


@videos_bp.get('/<video_id>/last-index')
def get_video_last_index(video_id: str):
    """Gets the last index for the place where user left off in a video"""
    last_index = videos_service.get_video_last_index(db.session, video_id)
    return jsonify(last_index), 200


@videos_bp.patch('/<video_id>/last-index')
def update_video_last_index(video_id: str):
    """Updates the last index of a video in the database"""
    last_index = request.json['last_index']
    videos_service.update_video_last_index(db.session, video_id, last_index)
    return jsonify('success'), 200