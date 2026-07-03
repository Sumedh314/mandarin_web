from flask import Blueprint, request, jsonify

from app.models import db
import app.services.words as words


words_bp = Blueprint('words', __name__, url_prefix='/api/v1/words')


@words_bp.post('')
def add_words():
    """Adds a list of words to the database"""
    words_data = request.json
    print(words_data)
    words.add_words(db.session, words_data)
    db.session.commit()
    return jsonify('success'), 201


@words_bp.get('/proficiency-levels')
def get_word_proficiency_levels():
    """Returns the proficiency levels"""
    word_list = request.args.getlist('word')
    
    if not word_list:
        return jsonify({}), 200
    
    proficiency_levels = words.get_word_proficiency_levels(db.session, word_list)
    return proficiency_levels, 200


@words_bp.patch('/proficiency-levels')
def update_word_proficiency_levels():
    """Updates the proficiency levels for a list of words"""
    data = request.json
    new_proficiency_levels = data['proficiency_levels']
    words.update_word_proficiency_levels(db.session, new_proficiency_levels)
    db.session.commit()
    return jsonify('success'), 200


@words_bp.post('/proficiency-levels/calculate')
def calculate_new_proficiency_levels():
    """Calculates the new proficiency levels for a list of words"""
    data = request.json
    print(data)
    previous_words = data['previous_words']
    current_word = data['current_word']
    
    new_proficiency_levels = words.calculate_new_proficiency_levels(db.session, previous_words, current_word)
    return new_proficiency_levels, 200


@words_bp.get('/saved')
def get_saved_words():
    """Gets all words that are saved"""
    saved_words = words.get_saved_words(db.session)
    return jsonify(saved_words), 200


@words_bp.get('/saved/<word>')
def get_word_saved_status(word: str):
    """Checks if a word is saved"""
    word_is_saved = words.get_word_saved_status(db.session, word)
    return jsonify(word_is_saved), 200


@words_bp.patch('/saved/<word>')
def toggle_saved_word(word: str):
    """Saves a word if not already saved, or unsaves if already saved"""
    word_is_saved = words.get_word_saved_status(db.session, word)
    words.update_word_saved_status(db.session, word, not word_is_saved)
    db.session.commit()
    return jsonify('success'), 200