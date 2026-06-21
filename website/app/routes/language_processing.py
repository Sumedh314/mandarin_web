import jieba
import pinyin
from google.genai import types
from app.services.storage import load_json
from flask import Blueprint, request, jsonify
from config import TRANSLATOR, GEMINI_CLIENT, WORDS_LIST_PATH


language_bp = Blueprint('language', __name__)


@language_bp.route('/translate_text', methods=['POST'])
def translate_text():
    """Translates a given word or phrase and returns it to JavaScript"""
    text = request.data.decode()

    all_words = load_json(WORDS_LIST_PATH)

    translation = ''
    translation_found = False

    for word in all_words:
        if word['s'] == text:
            translation = ', '.join([', '.join(form['m']) for form in word['f']])
            translation_found = True
    
    if not translation_found:
        translation = (TRANSLATOR.translate(text))

    return translation


@language_bp.route('/get_pinyin', methods=['POST'])
def get_pinyin():
    """Returns the pinyin representation of a Mandarin word"""
    text = request.data.decode()

    all_words = load_json(WORDS_LIST_PATH)

    pinyin_text = []
    pinyin_found = False
    
    for word in all_words:
        if word['s'] == text:
            for form in word['f']:
                pinyin_text.append(form['i']['y'])
            pinyin_found = True
    pinyin_text = ', '.join(pinyin_text)
    
    if not pinyin_found:
        pinyin_text = pinyin.get(text)

    return pinyin_text


@language_bp.route('/segment_text', methods=['POST'])
def segment_text():
    """Segments Mandarin text into individual words using the jieba library"""
    text = request.data.decode()
    segmented_text = [word for word in jieba.cut_for_search(text)]
    print(segmented_text)
    segmented_text = [word for word in jieba.cut(text)]
    print(segmented_text)

    return segmented_text


@language_bp.route('/segment_transcript', methods=['POST'])
def segment_transcript():
    """Segments a video transcript into individual words using the jieba library while preserving timestamps"""
    transcript = request.json
    segmented_transcript = {}
    
    for snippet in transcript:
        segmented_transcript[snippet['start']] = [word for word in jieba.cut(snippet['text'])]

    return jsonify(segmented_transcript)


@language_bp.route('/prompt_gemini', methods=['POST'])
def prompt_gemini():
    """Prompts Google Gemini using its API with an optional response schema"""
    data = request.json

    prompt = data['prompt']
    schema = data['schema']

    if schema == {}:
        response = GEMINI_CLIENT.models.generate_content(model='gemini-2.5-flash', contents=prompt).text
    else:
        response = GEMINI_CLIENT.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=schema
            )
        ).text
        
    print(response)

    return response