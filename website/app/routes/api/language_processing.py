from flask import Blueprint, request, jsonify

import app.services.language_processing as language_service
import app.services.words as words_service


language_bp = Blueprint('language', __name__, url_prefix='/api/v1/language')


@language_bp.get('/segment')
def segment_text():
    """Use Jieba to segment Mandarin text."""
    text = request.args.get('text', '')
    segmented_text = language_service.segment_text(text)
    return jsonify(segmented_text)


@language_bp.get('/pinyin')
def get_pinyin():
    """Get the pinyin representation of a piece of Mandarin text"""
    text = request.args.get('text', '')
    pinyin = language_service.get_pinyin(text)
    return jsonify(pinyin), 200


@language_bp.get('/translate')
def translate_text():
    """Get the English translation of a piece of Mandarin text"""
    text = request.args.get('text', '')
    translation = language_service.translate_text(text)
    return jsonify(translation), 200