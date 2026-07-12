from flask import Blueprint, request, jsonify

from app.models import db
import app.modules.words.service as service
import app.modules.words.repository as repository


words_bp = Blueprint('words', __name__, url_prefix='/api/v1/words')


@words_bp.post('')
def add_words():
    """Add a list of words to the database"""
    words_data = request.json
    print(words_data)
    service.add_new_words(db.session, words_data)
    return jsonify('success'), 201


@words_bp.get('/ids')
def get_word_ids():
    """Get the ids of words based on their text"""
    word_texts = request.args.getlist('word')
    words = repository.get_words_by_texts(db.session, word_texts)
    word_ids = {word.id for word in words}
    return jsonify(word_ids), 200


@words_bp.get('/<int:word_id>/pinyin')
def get_pinyin(word_id: int):
    """Get the pinyin representation of a word"""
    pinyin = service.get_pinyin(db.session, word_id)
    if pinyin is not None:
        return jsonify(pinyin), 200
    else:
        return jsonify(''), 200


@words_bp.get('/<int:word_id>/translation')
def get_translation(word_id: int):
    """Get the translation of a word stored in the database"""
    translation = service.get_translation(db.session, word_id)
    if translation is not None:
        return jsonify(translation), 200
    else:
        return jsonify(''), 200


@words_bp.get('/proficiency-levels')
def get_proficiency_levels():
    """Get the proficiency levels of a list of words."""
    id_list = request.args.getlist('id')
    
    if not id_list:
        return jsonify({}), 200
    
    proficiency_levels = service.get_proficiency_levels(db.session, id_list)
    return proficiency_levels, 200


@words_bp.patch('/<int:word_id>/update')
def update_word(word_id: int):
    """Update a word with new data."""
    data = request.json
    service.update_word(db.session, word_id, **data)
    return jsonify('success'), 200


@words_bp.patch('/proficiency-levels')
def update_word_proficiency_levels():
    """Update the proficiency levels for a list of words."""
    data = request.json
    new_proficiency_levels = data['proficiency_levels']
    service.update_word_proficiency_levels(db.session, new_proficiency_levels)
    return jsonify('success'), 200


@words_bp.post('/proficiency-levels/calculate')
def calculate_new_proficiency_levels():
    """Calculate the new proficiency levels for a list of words."""
    data = request.json
    print(data)
    previous_words = data['previous_words']
    current_word = data['current_word']
    
    new_proficiency_levels = service.calculate_new_proficiency_levels(
        db.session,
        previous_words,
        current_word
    )
    return new_proficiency_levels, 200


@words_bp.get('/hsk-percentages')
def calculate_hsk_percentages():
    """Get the percentage of words for each HSK level that the user has seen"""
    return service.calculate_hsk_percentages(db.session)


@words_bp.get('/saved')
def get_saved_words():
    """Get all words that the user has saved."""
    saved_words = repository.get_saved_words(db.session)
    words_text = [word.text for word in saved_words]
    return jsonify(words_text), 200


@words_bp.get('/saved/<int:word_id>')
def get_word_saved_status(word_id: int):
    """Check if a word is saved."""
    word_is_saved = service.get_word_saved_status(db.session, word_id)
    return jsonify(word_is_saved), 200


@words_bp.patch('/saved/<int:word_id>')
def toggle_saved_word(word_id: int):
    """Save a word if not already saved, or unsave if already saved."""
    word_is_saved = service.get_word_saved_status(db.session, word_id)
    service.update_word(db.session, word_id, saved=not word_is_saved)
    return jsonify('success'), 200