from datetime import datetime

from flask import Blueprint, request, jsonify

from app.models import db
import app.services.flashcards as flashcards_service


flashcards_bp = Blueprint('flashcards', __name__, url_prefix='/api/v1/flashcards')


@flashcards_bp.post('')
def add_flashcard():
    """Adds a flashcard for the FSRS algorithm"""
    flashcard_data = request.json
    flashcards_service.add_flashcard(db.session, flashcard_data)
    return jsonify('success'), 201


@flashcards_bp.get('/<int:word_id>')
def get_card(word_id: int):
    """Gets a flashcard for the specified word"""
    card = flashcards_service.get_card_for_word_id(db.session, word_id)
    return jsonify(card.to_dict()), 200


@flashcards_bp.get('/next-due')
def get_next_due_flashcard():
    """Gets the next flashcard that is due for review"""
    current_time = request.args.get('current_time')
    flashcard = flashcards_service.get_next_due_flashcard(db.session, current_time)
    if flashcard == 'None':
        return jsonify('None'), 200
    return jsonify(flashcard.to_dict()), 200


@flashcards_bp.get('/due')
def get_due_flashcards():
    """Gets all flashcards that are currently due for review"""
    current_time = request.args.get('current_time')
    flashcard_list = flashcards_service.get_due_flashcards(db.session, current_time)
    return jsonify([flashcard.to_dict() for flashcard in flashcard_list]), 200


@flashcards_bp.patch('/<int:card_id>')
def update_flashcard(card_id: int):
    """Updates a flashcard with its new data"""
    flashcard_data = request.json
    flashcards_service.update_flashcard(db.session, card_id, flashcard_data)
    return jsonify('success'), 200


@flashcards_bp.post('/review')
def review_flashcard():
    """Reviews a flashcard based on the user's rating"""
    review_data = request.json
    word_id = review_data['word_id']
    rating = review_data['rating']
    review_time = datetime.fromisoformat(review_data['review_time'])
    
    card = flashcards_service.get_card_for_word_id(db.session, word_id)
    card = flashcards_service.review_card(card, rating, review_time)
    card_dict = card.to_dict()
    return jsonify(card_dict), 200


@flashcards_bp.get('/review-intervals/<int:card_id>')
def get_review_intervals(card_id: int):
    """Gets the review intervals for a flashcard"""
    review_time = datetime.fromisoformat(request.args.get('review_time'))
    card = flashcards_service.get_card_for_word_id(db.session, card_id)
    print(card_id)
    intervals = flashcards_service.calculate_card_review_intervals(card, review_time)
    return jsonify(intervals), 200


@flashcards_bp.delete('/<int:card_id>')
def delete_flashcard(card_id: int):
    """Deletes a flashcard from the database"""
    flashcards_service.delete_flashcard(db.session, card_id)
    return jsonify('success'), 200