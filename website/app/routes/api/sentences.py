from flask import Blueprint, request, jsonify

from app.models import db
import app.services.sentences as sentences


sentences_bp = Blueprint('sentences', __name__, url_prefix='/api/v1/sentences')


@sentences_bp.post('')
def add_sentences():
    """Adds new practice sentences to the database"""
    sentence_data = request.json
    sentence_list = sentence_data['sentences']
    word = sentence_data['word']
    sentences.add_sentences(db.session, sentence_list, word)
    sentences.add_num_sentences(db.session, word, len(sentence_list))
    db.session.commit()
    return jsonify('success'), 201


@sentences_bp.get('/<word>')
def get_sentence(word: str):
    """Gets the first sentence stored in the database for the desired word"""
    sentence = sentences.get_sentence(db.session, word)
    return jsonify(sentence), 200


@sentences_bp.delete('')
def delete_sentence():
    """Deletes a practice sentence for the specified word"""
    sentence = request.args.get('sentence')
    word = request.args.get('word')
    sentences.delete_sentence(db.session, sentence, word)
    sentences.add_num_sentences(db.session, word, -1)
    db.session.commit()
    return jsonify('success'), 200