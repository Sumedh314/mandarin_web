from flask import Blueprint, request, jsonify, render_template

from app.models import db
import app.services as services


main_bp = Blueprint('main', __name__, url_prefix='/api/v1/')


@main_bp.post('/words')
def add_words():
    """Adds a list of words to the database"""
    words_data = request.json
    print(words_data)
    services.add_words(db.session, words_data)
    db.session.commit()
    return jsonify('success'), 201


@main_bp.get('/words/proficiency-levels')
def get_word_proficiency_levels():
    """Returns the proficiency levels"""
    words = request.args.getlist('word')
    
    if not words:
        return jsonify({}), 200
    
    proficiency_levels = services.get_word_proficiency_levels(db.session, words)
    return proficiency_levels, 200


@main_bp.patch('/words/proficiency-levels')
def update_word_proficiency_levels():
    """Updates the proficiency levels for a list of words"""
    data = request.json
    new_proficiency_levels = data['proficiency_levels']
    services.update_word_proficiency_levels(db.session, new_proficiency_levels)
    db.session.commit()
    return jsonify('success'), 200


@main_bp.post('/words/proficiency-levels/calculate')
def calculate_new_proficiency_levels():
    """Calculates the new proficiency levels for a list of words"""
    data = request.json
    print(data)
    previous_words = data['previous_words']
    current_word = data['current_word']
    
    new_proficiency_levels = services.calculate_new_proficiency_levels(db.session, previous_words, current_word)
    return new_proficiency_levels, 200


@main_bp.get('/words/saved')
def get_saved_words():
    """Gets all words that are saved"""
    saved_words = services.get_saved_words(db.session)
    return jsonify(saved_words), 200


@main_bp.get('/words/saved/<word>')
def get_word_saved_status(word: str):
    """Checks if a word is saved"""
    word_is_saved = services.get_word_saved_status(db.session, word)
    return jsonify(word_is_saved), 200


@main_bp.patch('/words/saved/<word>')
def toggle_saved_word(word: str):
    """Saves a word if not already saved, or unsaves if already saved"""
    word_is_saved = services.get_word_saved_status(db.session, word)
    services.update_word_saved_status(db.session, word, not word_is_saved)
    db.session.commit()
    return jsonify('success'), 200


@main_bp.get('/words/segment')
def segment_text():
    """Use Jieba to segment Mandarin text."""
    text = request.args.get('text', '')
    segmented_text = services.segment_text(text)
    return jsonify(segmented_text)


@main_bp.get('/words/pinyin')
def get_pinyin():
    """Get the pinyin representation of a piece of Mandarin text"""
    text = request.args.get('text', '')
    pinyin = services.get_pinyin(text)
    return jsonify(pinyin), 200


@main_bp.get('/words/translate')
def translate_text():
    """Get the English translation of a piece of Mandarin text"""
    text = request.args.get('text', '')
    translation = services.translate_text(text)
    return translation


@main_bp.post('/sentences')
def add_sentences():
    """Adds new practice sentences to the database"""
    sentence_data = request.json
    sentences = sentence_data['sentences']
    word = sentence_data['word']
    services.add_sentences(db.session, sentences, word)
    db.session.commit()
    return jsonify('success'), 201


@main_bp.get('/sentences/<word>')
def get_sentence(word: str):
    """Gets the first sentence stored in the database for the desired word"""
    sentence = services.get_sentence(db.session, word)
    return sentence, 200


@main_bp.delete('/sentences')
def delete_sentence():
    """Deletes a practice sentence for the specified word"""
    sentence = request.args.get('sentence')
    word = request.args.get('word')
    services.delete_sentence(db.session, sentence, word)
    db.session.commit()
    return jsonify('success'), 200


@main_bp.post('/videos')
def add_video():
    """Adds a new video to the database"""
    video_data = request.json
    video_id = video_data['video_id']
    services.add_video(db.session, video_id)
    db.session.commit()
    return jsonify('success'), 201


@main_bp.get('/videos/<video_id>/title')
def get_video_title(video_id: str):
    """Gets the title of a video from the database"""
    title = services.get_video_title(db.session, video_id)
    return jsonify(title), 200


@main_bp.patch('/videos/<video_id>/title')
def update_video_title(video_id: str):
    """Updates the title of a video in the database"""
    title = request.json['title']
    services.update_video_title(db.session, video_id, title)
    db.session.commit()
    return jsonify('success'), 200


@main_bp.get('/videos/check')
def check_video_exists():
    """Checks if a video exists in the database"""
    video_id = request.args.get('video_id')
    video_exists = services.check_video_exists(db.session, video_id)
    return jsonify(video_exists), 200


@main_bp.get('/videos/<video_id>/last-index')
def get_video_last_index(video_id: str):
    """Gets the last index for the place where user left off in a video"""
    last_index = services.get_video_last_index(db.session, video_id)
    return jsonify(last_index), 200


@main_bp.patch('/videos/<video_id>/last-index')
def update_video_last_index(video_id: str):
    """Updates the last index of a video in the database"""
    last_index = request.json['last_index']
    services.update_video_last_index(db.session, video_id, last_index)
    db.session.commit()
    return jsonify('success'), 200


@main_bp.post('/transcripts')
def add_transcript():
    """Adds a transcript of a YouTube video to the database"""
    transcript_data = request.json
    transcript = transcript_data['transcript']
    video_id = transcript_data['video_id']
    services.add_transcript(db.session, video_id, transcript)
    db.session.commit()
    return jsonify('success'), 200


@main_bp.get('/transcripts/data/<video_id>')
def get_transcript_from_database(video_id: str):
    """Gets the full transcript of a YouTube video from the database"""
    transcript = services.get_transcript_from_database(db.session, video_id)
    return jsonify(transcript), 200


@main_bp.get('/transcripts')
def get_new_transcript():
    """Gets the transcript of a new YouTube video"""
    video_id = request.args.get('video_id')
    print(video_id)
    transcript = services.get_transcript_from_youtube(video_id)
    return jsonify(transcript), 200


@main_bp.post('/flashcards')
def add_flashcard():
    """Adds a flashcard for the FSRS algorithm"""
    flashcard_data = request.json
    services.add_flashcard(db.session, flashcard_data)
    db.session.commit()
    return jsonify('success'), 201


@main_bp.get('/flashcards/<word>')
def get_flashcard(word: str):
    """Gets a flashcard for the specified word"""
    flashcard = services.get_flashcard(db.session, word)
    return jsonify(flashcard), 200


@main_bp.get('/flashcards/next-due')
def get_next_due_flashcard():
    """Gets the next flashcard that is due for review"""
    flashcard = services.get_next_due_flashcard(db.session)
    return jsonify(flashcard), 200


@main_bp.get('/flashcards/due')
def get_due_flashcards():
    """Gets all flashcards that are currently due for review"""
    flashcards = services.get_due_flashcards(db.session)
    return jsonify(flashcards), 200


@main_bp.patch('/flashcards/<word>')
def update_flashcard(word: str):
    """Updates a flashcard with its new data"""
    flashcard_data = request.json
    services.update_flashcard(db.session, word, flashcard_data)
    db.session.commit()
    return jsonify('success'), 200


@main_bp.post('/flashcards/review')
def review_flashcard():
    """Reviews a flashcard based on the user's rating"""
    review_data = request.json
    word = review_data['word']
    rating = review_data['rating']
    review_time = review_data['review_time']
    
    card = services.get_flashcard(db.session, word)
    card = services.review_flashcard(card, rating, review_time)
    return card


@main_bp.get('/flashcards/review-intervals/<word>')
def get_review_intervals(word: str):
    """Gets the review intervals for a flashcard"""
    review_time = request.args.get('review_time')
    card = services.get_flashcard(db.session, word)
    intervals = services.calculate_flashcard_review_intervals(card, review_time)
    return intervals


@main_bp.delete('/flashcards/<word>')
def delete_flashcard(word: str):
    """Deletes a flashcard from the database"""
    services.delete_flashcard(db.session, word)
    db.session.commit()
    return jsonify('success'), 200


@main_bp.route('/')
def home():
    """Home page for site"""
    return render_template('index.html')