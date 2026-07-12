from flask import Blueprint, request, jsonify

from app.models import db
import app.modules.transcripts.service as service


transcripts_bp = Blueprint(
    'transcripts',
    __name__,
    url_prefix='/api/v1/transcripts'
)


@transcripts_bp.post('')
def add_transcript():
    """Add a transcript of a YouTube video to the database."""
    transcript_data = request.json
    transcript = transcript_data['transcript']
    video_id = transcript_data['video_id']
    service.add_transcript(db.session, video_id, transcript)
    return jsonify('success'), 200


@transcripts_bp.get('/new')
def get_new_transcript():
    """Get the transcript of a new YouTube video."""
    video_id = request.args.get('video_id')
    print(video_id)
    transcript = service.get_transcript_from_youtube(video_id)
    return jsonify(transcript), 200


@transcripts_bp.get('/data/<video_id>')
def get_transcript_from_database(video_id: str):
    """Get the full transcript of a YouTube video from the database."""
    transcript = service.get_transcript_from_database(db.session, video_id)
    return jsonify(transcript), 200