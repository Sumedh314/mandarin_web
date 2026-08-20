from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db
import app.modules.words.service as service
import app.modules.words.repository as repository


words_bp = Blueprint('words', __name__, url_prefix='/api/v1/words')


# WORDS PROCESSING


@words_bp.post('')
@jwt_required()
def add_all_new_words():
    """Add words to the database that are not already in it."""
    words = request.get_json()
    user_id = int(get_jwt_identity())
    new_words = service.add_all_new_words(db.session, user_id, words)
    return jsonify(new_words), 201


@words_bp.patch('<int:word_id>')
@jwt_required()
def update_word(word_id: int):
    """Update a word with new data."""
    data = request.get_json()
    word = service.update_word(db.session, word_id, data)
    return jsonify(word.id), 200


@words_bp.post('/learning')
@jwt_required()
def add_learning_words():
    """Add words to the database that are not already in it."""
    words = request.get_json()
    user_id = int(get_jwt_identity())
    new_words = service.add_learning_words(db.session, user_id, words)
    return jsonify([word.id for word in new_words]), 201


@words_bp.patch('/learning/<int:learning_word_id>')
@jwt_required()
def update_learning_word(learning_word_id: int):
    """Update a learning word with new data."""
    data = request.get_json()
    learning_word = service.update_learning_word(db.session, learning_word_id, data)
    return jsonify(learning_word.id), 200


@words_bp.post('/learning/ids/read')
@jwt_required()
def get_learning_word_ids():
    """Get the IDs of a list of learning words."""
    words = request.get_json()
    user_id = int(get_jwt_identity())
    learning_word_ids = service.get_learning_word_ids(db.session, user_id, words)
    return jsonify(learning_word_ids), 200


@words_bp.get('/learning/<int:learning_word_id>')
@jwt_required()
def get_learning_word_data(learning_word_id: int):
    """Get all the data for a word."""
    learning_word_data = service.get_learning_word_data(db.session, learning_word_id)
    return jsonify(learning_word_data), 200


@words_bp.post('/learning/proficiency-levels/read')
@jwt_required()
def get_word_proficiency_levels():
    """Get the proficiency levels of a list of words by their IDS."""
    word_ids = request.get_json()
    proficiency_levels = service.get_proficiency_levels(db.session, word_ids)
    return jsonify(proficiency_levels), 200


@words_bp.patch('/learning/proficiency-levels')
@jwt_required()
def update_proficiency_levels():
    """Calculate what the new proficiency levels should be."""
    previous_word_ids = request.get_json()['previousWordIds']
    current_word_id = request.get_json()['currentWordId']
    new_proficiency_levels = service.calculate_and_update_proficiency_levels(
        db.session,
        previous_word_ids,
        current_word_id
    )
    return jsonify(new_proficiency_levels), 200


@words_bp.post('/learning/saved')
@jwt_required()
def get_saved_words_in_list():
    """Get words from the list that the user has saved."""
    word_ids = request.get_json()
    print(word_ids)
    user_id = int(get_jwt_identity())
    saved_word_ids = repository.get_saved_words_in_list(db.session, user_id, word_ids)
    return jsonify(saved_word_ids), 200


@words_bp.patch(('/learning/saved/<int:learning_word_id>/toggle'))
@jwt_required()
def toggle_word_saved(learning_word_id: int):
    """Toggle the saved status of a word"""
    saved = service.toggle_word_saved(db.session, learning_word_id)
    return jsonify(saved), 200


# LANGAUGE PROCESSING


@words_bp.post('/segment')
def segment_text():
    """Segment a list of Mandarin text."""
    text = request.get_json()['text']
    segmented_text = service.segment_text(text)
    return jsonify(segmented_text), 200


@words_bp.post('/pinyin')
def get_new_pinyin():
    """Get the pinyin representation of a piece of text."""
    data: dict = request.get_json()
    print(data)
    text = data.get('text')
    context = data.get('context')
    pinyin = service.get_new_pinyin(text, context)
    return jsonify(pinyin), 200


@words_bp.post('/translate')
def get_new_translation():
    """Translate a piece of Mandarin text."""
    text = request.get_json()['text']
    translation = service.get_new_translation(text)
    return jsonify(translation), 200