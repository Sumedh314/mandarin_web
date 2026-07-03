from datetime import datetime

from flask import Blueprint, request, jsonify

from app.models import db
import app.services.flashcards as flashcards


flashcards_bp = Blueprint('flashcards', __name__, url_prefix='/api/v1/flashcards')


@flashcards_bp.post('')
def add_flashcard():
    """Adds a flashcard for the FSRS algorithm"""
    flashcard_data = request.json
    flashcards.add_flashcard(db.session, flashcard_data)
    db.session.commit()
    return jsonify('success'), 201


@flashcards_bp.get('/<word>')
def get_flashcard(word: str):
    """Gets a flashcard for the specified word"""
    flashcard = flashcards.get_card_for_word(db.session, word)
    return jsonify(flashcard.to_dict()), 200


@flashcards_bp.get('/next-due')
def get_next_due_flashcard():
    """Gets the next flashcard that is due for review"""
    current_time = request.args.get('current_time')
    flashcard = flashcards.get_next_due_flashcard(db.session, current_time)
    if flashcard == 'None':
        return jsonify('None'), 200
    return jsonify(flashcard.to_dict()), 200


@flashcards_bp.get('/due')
def get_due_flashcards():
    """Gets all flashcards that are currently due for review"""
    current_time = request.args.get('current_time')
    flashcard_list = flashcards.get_due_flashcards(db.session, current_time)
    return jsonify([flashcard.to_dict() for flashcard in flashcard_list]), 200


@flashcards_bp.patch('/<word>')
def update_flashcard(word: str):
    """Updates a flashcard with its new data"""
    flashcard_data = request.json
    flashcards.update_flashcard(db.session, word, flashcard_data)
    db.session.commit()
    return jsonify('success'), 200


@flashcards_bp.post('/review')
def review_flashcard():
    """Reviews a flashcard based on the user's rating"""
    review_data = request.json
    word = review_data['word']
    rating = review_data['rating']
    review_time = datetime.fromisoformat(review_data['review_time'])
    
    card = flashcards.get_card_for_word(db.session, word)
    card = flashcards.review_card(card, rating, review_time)
    card_dict = card.to_dict()
    return jsonify(card_dict), 200


@flashcards_bp.get('/review-intervals/<word>')
def get_review_intervals(word: str):
    """Gets the review intervals for a flashcard"""
    review_time = datetime.fromisoformat(request.args.get('review_time'))
    card = flashcards.get_card_for_word(db.session, word)
    print(word)
    intervals = flashcards.calculate_card_review_intervals(card, review_time)
    return jsonify(intervals), 200


@flashcards_bp.delete('/<word>')
def delete_flashcard(word: str):
    """Deletes a flashcard from the database"""
    flashcards.delete_flashcard(db.session, word)
    db.session.commit()
    return jsonify('success'), 200