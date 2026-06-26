from flask import Blueprint, request, jsonify, render_template
from datetime import datetime, timezone
from sqlalchemy import select

from app.models import db, Word, Sentence, TranscriptLine, Flashcard
import app.new_services as services


main_bp = Blueprint('main', __name__, url_prefix='/api/v1/')


@main_bp.get('/words/<text>')
def get_word_data(text: str):
    return text


@main_bp.post('/words')
def create_words():
    words = request.json

    for word in words:
        db.session.add(Word(text=word))
    
    db.session.commit()
    return 200


@main_bp.get('/words/proficiency_levels')
def get_word_proficiency_levels():
    """Returns the proficiency levels"""
    words = request.args.getlist('word')
    statement = select(Word.text, Word.proficiency).where(Word.text.in_(words))
    proficiency_levels = db.session.scalars(statement=statement).all()


@main_bp.get('/words/<text>/segment')
def get_segmented_text(text: str):
    """Use Jieba to segment Mandarin text."""
    segmented_text = services.segment_text(text)
    return jsonify(segmented_text)


@main_bp.get('/words/pinyin/<text>')
def get_pinyin(text: str):
    """Get the pinyin representation of a piece of Mandarin text"""
    return services.fetch_pinyin(text)


@main_bp.get('/sentences/<word>')
def get_sentence(word: str):
    """Gets the first sentence stored in the database for the desired word"""
    statement = select(Sentence).where(Sentence.word == word).limit(1)
    sentence = db.session.scalar(statement=statement)
    return sentence


@main_bp.delete('/sentences/<sentence_text>/word/<word>')
def delete_sentence(sentence_text: str, word: str):
    """Deletes a practice sentence for the specified word"""
    statement = select(Sentence).where(Sentence.text == sentence_text and Sentence.word == word)
    sentence = db.session.scalar(statement=statement)
    db.session.delete(sentence)
    db.session.commit()


@main_bp.post('/flashcards')
def create_flashcard():
    """Creates a flashcard for the FSRS algorithm"""
    word = request.data.decode()
    db.session.add(Flashcard(word=word, due=str(datetime.now(timezone.utc))))


@main_bp.route('/')
def home():
    """Home page for site"""
    return render_template('index.html')