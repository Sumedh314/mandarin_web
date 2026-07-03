from flask import Blueprint, request, jsonify

import app.services.language_processing as language


language_bp = Blueprint('language', __name__, url_prefix='/api/v1/language')


@language_bp.get('/segment')
def segment_text():
    """Use Jieba to segment Mandarin text."""
    text = request.args.get('text', '')
    segmented_text = language.segment_text(text)
    return jsonify(segmented_text)


@language_bp.get('/pinyin')
def get_pinyin():
    """Get the pinyin representation of a piece of Mandarin text"""
    text = request.args.get('text', '')
    pinyin = language.get_pinyin(text)
    return jsonify(pinyin), 200


@language_bp.get('/translate')
def translate_text():
    """Get the English translation of a piece of Mandarin text"""
    text = request.args.get('text', '')
    translation = language.translate_text(text)
    return jsonify(translation), 200