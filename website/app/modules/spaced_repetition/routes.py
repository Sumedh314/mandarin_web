from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db
import app.modules.spaced_repetition.service as service
import app.modules.spaced_repetition.repository as repository


srs_bp = Blueprint('srs', __name__, url_prefix='/api/v1/srs')


@srs_bp.post('/flashcards')
@jwt_required()
def add_flashcard():
    """Add a flashcard for the FSRS algorithm."""
    flashcard_data = request.get_json()
    service.add_flashcard(db.session, flashcard_data)
    return jsonify('success'), 201


@srs_bp.get('/flashcards/<int:learning_word_id>')
@jwt_required()
def get_card(learning_word_id: int):
    """Get a flashcard for the specified word."""
    card = service.get_card_for_learning_word_id(db.session, learning_word_id)
    return jsonify(card.to_dict()), 200


@srs_bp.get('/flashcards/next-due')
@jwt_required()
def get_next_due_flashcard():
    """Get the next flashcard that is due for review."""
    current_time = request.args.get('current_time')
    user_id = get_jwt_identity()
    flashcard = service.get_next_due_flashcard(db.session, user_id, current_time)
    if flashcard == 'None':
        return jsonify('None'), 200
    return jsonify(flashcard.to_dict()), 200


@srs_bp.get('/flashcards/due')
@jwt_required()
def get_due_flashcards():
    """Get all flashcards that are currently due for review."""
    current_time = request.args.get('current_time')
    user_id = get_jwt_identity()
    flashcard_list = repository.get_due_flashcards(db.session, user_id, current_time)
    return jsonify([flashcard.to_dict() for flashcard in flashcard_list]), 200


@srs_bp.patch('/flashcards/<int:learning_word_id>')
@jwt_required()
def update_flashcard(learning_word_id: int):
    """Update a flashcard with its new data."""
    flashcard_data = request.get_json()
    service.update_flashcard(db.session, learning_word_id, flashcard_data)
    return jsonify('success'), 200


@srs_bp.post('/flashcards/review')
@jwt_required()
def review_flashcard():
    """Review a flashcard based on the user's rating."""
    review_data = request.get_json()
    learning_word_id = review_data['learningWordId']
    rating = review_data['rating']
    review_time = datetime.fromisoformat(review_data['reviewTime'])
    
    card = service.get_card_for_learning_word_id(db.session, learning_word_id)
    card = service.review_card(card, rating, review_time)
    return jsonify(card.to_dict()), 200


@srs_bp.get('/flashcards/review-intervals/<int:learning_word_id>')
@jwt_required()
def get_review_intervals(learning_word_id: int):
    """Get the review intervals for a flashcard."""
    review_time = datetime.fromisoformat(request.args.get('review_time'))

    card = repository.get_flashcard_by_id(db.session, learning_word_id)
    print(learning_word_id)
    intervals = service.calculate_card_review_intervals(card, review_time)
    return jsonify(intervals), 200


@srs_bp.delete('/flashcards/<int:learning_word_id>')
@jwt_required()
def delete_flashcard(learning_word_id: int):
    """Delete a flashcard from the database."""
    service.delete_flashcard(db.session, learning_word_id)
    return jsonify('success'), 200


# SENTENCES


@srs_bp.post('/sentences')
@jwt_required()
def add_sentences():
    """Add new practice sentences to the database."""
    sentence_data = request.get_json()
    sentence_list = sentence_data['sentences']
    learning_word_id = sentence_data['learningWordId']

    service.add_sentences_for_word(db.session, sentence_list, learning_word_id)
    return jsonify('success'), 201


@srs_bp.get('/sentences/<int:learning_word_id>')
@jwt_required()
def get_sentence(learning_word_id: int):
    """Get one sentence for the desired word."""
    sentence = service.get_sentence(db.session, learning_word_id)
    return jsonify(sentence), 200


@srs_bp.delete('/sentences')
@jwt_required()
def delete_sentence():
    """Delete a practice sentence for the specified word."""
    sentence = request.args.get('sentence')
    learning_word_id = request.args.get('learningWordId')
    service.delete_sentence_by_text_and_word_id(db.session, sentence, learning_word_id)
    return jsonify('success'), 200