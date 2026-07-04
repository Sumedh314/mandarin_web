from flask import Blueprint, request, jsonify

from app.models import db
import app.services.sentences as sentences_service


sentences_bp = Blueprint('sentences', __name__, url_prefix='/api/v1/sentences')


@sentences_bp.post('')
def add_sentences():
    """Adds new practice sentences to the database"""
    sentence_data = request.json
    sentence_list = sentence_data['sentences']
    word = sentence_data['word']
    sentences_service.add_sentences_for_word(db.session, sentence_list, word)
    return jsonify('success'), 201


@sentences_bp.get('/<word>')
def get_sentence(word: str):
    """Gets the first sentence stored in the database for the desired word"""
    sentence = sentences_service.get_sentence(db.session, word).text
    return jsonify(sentence), 200


@sentences_bp.delete('')
def delete_sentence():
    """Deletes a practice sentence for the specified word"""
    sentence = request.args.get('sentence')
    word = request.args.get('word')
    sentences_service.delete_sentence(db.session, sentence, word)
    return jsonify('success'), 200