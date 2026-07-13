from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db
import app.modules.spaced_repetition.service as service
import app.modules.spaced_repetition.repository as repository


srs_bp = Blueprint('srs', __name__, url_prefix='/api/v1/flashcards')


@srs_bp.post('')
@jwt_required
def add_flashcard():
    """Add a flashcard for the FSRS algorithm."""
    flashcard_data = request.json
    user_id = get_jwt_identity()
    service.add_flashcard(db.session, user_id, flashcard_data)
    return jsonify('success'), 201


@srs_bp.get('/<int:word_id>')
@jwt_required()
def get_card(word_id: int):
    """Get a flashcard for the specified word."""
    user_id = get_jwt_identity()
    card = service.get_card_for_user_and_word_ids(db.session, user_id, word_id)
    return jsonify(card.to_dict()), 200


@srs_bp.get('/next-due')
@jwt_required()
def get_next_due_flashcard():
    """Get the next flashcard that is due for review."""
    current_time = request.args.get('current_time')
    user_id = get_jwt_identity()
    flashcard = service.get_next_due_flashcard(db.session, user_id, current_time)
    if flashcard == 'None':
        return jsonify('None'), 200
    return jsonify(flashcard.to_dict()), 200


@srs_bp.get('/due')
@jwt_required()
def get_due_flashcards():
    """Get all flashcards that are currently due for review."""
    current_time = request.args.get('current_time')
    user_id = get_jwt_identity()
    flashcard_list = service.get_due_flashcards(db.session, user_id, current_time)
    return jsonify([flashcard.to_dict() for flashcard in flashcard_list]), 200


@srs_bp.patch('/<int:card_id>')
@jwt_required()
def update_flashcard(card_id: int):
    """Update a flashcard with its new data."""
    flashcard_data = request.json
    service.update_flashcard(db.session, card_id, flashcard_data)
    return jsonify('success'), 200


@srs_bp.post('/review')
@jwt_required()
def review_flashcard():
    """Review a flashcard based on the user's rating."""
    review_data = request.json
    word_id = review_data['word_id']
    rating = review_data['rating']
    review_time = datetime.fromisoformat(review_data['review_time'])
    user_id = get_jwt_identity()
    
    card = service.get_card_for_user_and_word_ids(db.session, user_id, word_id)
    card = service.review_card(card, rating, review_time)
    card_dict = card.to_dict()
    return jsonify(card_dict), 200


@srs_bp.get('/review-intervals/<int:card_id>')
@jwt_required()
def get_review_intervals(card_id: int):
    """Get the review intervals for a flashcard."""
    review_time = datetime.fromisoformat(request.args.get('review_time'))

    card = repository.get_flashcard_by_id(db.session, card_id)
    print(card_id)
    intervals = service.calculate_card_review_intervals(card, review_time)
    return jsonify(intervals), 200


@srs_bp.delete('/<int:card_id>')
@jwt_required()
def delete_flashcard(card_id: int):
    """Delete a flashcard from the database."""
    service.delete_flashcard(db.session, card_id)
    return jsonify('success'), 200


# SENTENCES


@srs_bp.post('')
@jwt_required()
def add_sentences():
    """Add new practice sentences to the database."""
    sentence_data = request.json
    sentence_list = sentence_data['sentences']
    user_word_id = sentence_data['wordId']

    service.add_sentences_for_word(db.session, sentence_list, user_word_id)
    return jsonify('success'), 201


@srs_bp.get('/<int:word_id>')
@jwt_required()
def get_sentence(user_word_id: int):
    """Get one sentence for the desired word."""
    sentence = service.get_sentence(db.session, user_word_id)
    return jsonify(sentence), 200


@srs_bp.delete('')
@jwt_required()
def delete_sentence():
    """Delete a practice sentence for the specified word."""
    sentence = request.args.get('sentence')
    user_word_id = request.args.get('wordId')
    service.delete_sentence(db.session, sentence, user_word_id)
    return jsonify('success'), 200