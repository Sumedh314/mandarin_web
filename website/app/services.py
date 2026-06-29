from datetime import datetime
import json
import copy

from sqlalchemy import select, insert, true, update, delete
from sqlalchemy.orm import Session

import jieba
from pypinyin import lazy_pinyin, Style
from fsrs import Card

from google.genai import types

from app.models import Word, Sentence, Video, TranscriptLine, Flashcard
from config import transcript_generator, translator, scheduler, gemini_client, MANDARIN_AND_ENGLISH_LANGUAGE_CODES, WORDS_LIST_PATH


def add_words(session: Session, words_data: list[dict[str, int | str]]):
    """Adds a list of words to the database"""
    words = [Word(**data) for data in words_data]
    new_words = get_new_words(session, words)
    session.add_all(new_words)
    session.flush()


def get_new_words(session: Session, words: list[Word]):
    """Gets a list of words from the given list that don't exist in the database"""
    statement = select(Word.text).where(Word.text.in_([word.text for word in words]))
    existing_words = session.scalars(statement).all()
    new_words = [word for word in words if word.text not in existing_words]
    return new_words


def get_word_proficiency_levels(session: Session, words: list[str]):
    """Queries the database to return a dictionary of proficiency levels for the given words"""
    statement = select(Word.text, Word.proficiency).where(Word.text.in_(words))
    word_proficiency_pairs = session.execute(statement).all()
    return dict(word_proficiency_pairs)


def update_word_proficiency_levels(session: Session, new_proficiency_levels_by_word: dict[str, int]):
    """Updates the proficiency levels for a dictionary of words"""
    for word, new_proficiency in new_proficiency_levels_by_word.items():
        statement = update(Word).where(Word.text == word).values(proficiency=new_proficiency)
        session.execute(statement)
    session.flush()


def calculate_new_proficiency_levels(session: Session, previous_words: list[str], current_word: str):
    """Calculates the new proficiency levels for a list of words"""
    previous_proficiency_levels = get_word_proficiency_levels(session, previous_words)
    new_proficiency_levels = {}
    for word in previous_words:
        proficiency = previous_proficiency_levels[word]
        if proficiency == 0:
            proficiency = 3
        elif 1 <= proficiency < 3:
            proficiency += 1
        new_proficiency_levels[word] = proficiency
    
    current_proficiency_level = get_word_proficiency_levels(session, [current_word])[current_word]
    if current_proficiency_level == 0:
        current_proficiency_level = 1
    elif 1 < current_proficiency_level <= 3:
        current_proficiency_level -= 1
    new_proficiency_levels[current_word] = current_proficiency_level
    
    return new_proficiency_levels
    

def segment_text(text: str):
    """Uses the Jieba library to segment Mandarin text."""
    return jieba.lcut_for_search(text)


def get_pinyin(text: str):
    """Fetches the pinyin representation of a piece of Mandarin text"""
    pinyin_list = lazy_pinyin(text, style=Style.TONE, neutral_tone_with_five=True)
    return ''.join(pinyin_list)


def translate_text(text: str):
    """Transaltes the given text into English, first by checking JSON file of words, and then Google Translate if word not found"""
    if len(text) <= 6:
        with open(WORDS_LIST_PATH, 'r') as words_list_file:
            all_words = json.load(words_list_file)

        for word in all_words:
            if word['s'] == text:
                translation = ', '.join([', '.join(form['m']) for form in word['f']])
                return translation

    return translator.translate(text)


def get_saved_words(session: Session):
    """Gets all the words that the user has saved"""
    statement = select(Word.text).where(Word.saved == True)
    saved_words = session.scalars(statement).all()
    return saved_words


def get_word_saved_status(session: Session, word: str):
    """Checks whether the user has saved the given word"""
    statement = select(Word.saved).where(Word.text == word)
    word_saved_status = session.scalar(statement)
    return word_saved_status


def update_word_saved_status(session: Session, word: str, new_status: bool):
    """Updates whether or not a word is saved"""
    statement = update(Word).where(Word.text == word).values(saved=new_status)
    session.execute(statement)


def add_sentences(session: Session, sentences: list[str], word: str):
    """Adds a list of sentences for a specific word"""
    sentence_list = [Sentence(text=sentence, word=word) for sentence in sentences]
    session.add_all(sentence_list)


def get_sentence(session: Session, word: str):
    """Queries the database to fetch the first sentence for a word"""
    statement = select(Sentence.text).where(Sentence.word == word).limit(1)
    sentence = session.scalar(statement)
    return sentence


def fetch_low_words(session: Session, threshold: int = 5):
    """Fetches all words with fewer practice sentences than the given threshold"""
    statement = select(Word).where(select(Sentence).where(Sentence.word == Word.text).count() < threshold)
    low_words = session.scalars(statement).all()
    return low_words


def delete_sentence(session: Session, sentence: str, word: str):
    """Removes a sentence from the database"""
    statement = delete(Sentence).where(Sentence.text == sentence, Sentence.word == word)
    session.execute(statement)


def add_video(session: Session, video_id: str):
    """Adds a YouTube video to the database"""
    video = Video(video_id=video_id)
    session.add(video)


def get_video_title(session: Session, video_id: str):
    """Fetches the title of a YouTube video from the database"""
    statement = select(Video.title).where(Video.video_id == video_id)
    title = session.scalar(statement)
    return title


def update_video_title(session: Session, video_id: str, title: str):
    """Updates the title of a YouTube video in the database"""
    statement = update(Video).where(Video.video_id == video_id).values(title=title)
    session.execute(statement)


def check_video_exists(session: Session, video_id: str):
    """Checks if a YouTube video exists in the database"""
    statement = select(Video).where(Video.video_id == video_id)
    video = session.scalar(statement)
    return video is not None


def get_video_last_index(session: Session, video_id: str):
    """Gets the last index for the place where user left off in a video"""
    statement = select(Video.last_index).where(Video.video_id == video_id)
    last_index = session.scalar(statement)
    return last_index


def update_video_last_index(session: Session, video_id: str, new_last_index: int):
    """Updates the last index for the place where user left off in a video"""
    statement = update(Video).where(Video.video_id == video_id).values(last_index=new_last_index)
    session.execute(statement)


def add_transcript(session: Session, video_id: str, transcript: list[dict]):
    """Adds a YouTube video's transcript lines to the database"""
    transcript_lines = [TranscriptLine(video_id=video_id, **line) for line in transcript]
    print(transcript_lines)
    statement = insert(TranscriptLine).values([{'video_id': video_id, **line} for line in transcript])
    session.execute(statement)


def get_transcript_from_database(session: Session, video_id: str):
    """Fetches the transcript of a YouTube video from the database"""
    statement = select(TranscriptLine.text, TranscriptLine.start, TranscriptLine.duration).where(TranscriptLine.video_id == video_id)
    transcript = session.execute(statement).mappings().all()
    transcript = [dict(row) for row in transcript]
    return transcript


def get_transcript_from_youtube(video_id: str):
    """Uses YouTubeTranscriptAPI to fetch the transcript of a YouTube video that has captions"""
    transcript = transcript_generator.fetch(video_id, MANDARIN_AND_ENGLISH_LANGUAGE_CODES).to_raw_data()
    return transcript


def add_flashcard(session: Session, flashcard_data: dict[str, str | int | float]):
    """Adds a new flashcard row to the database"""
    session.add(Flashcard(**flashcard_data))


def get_flashcard(session: Session, word: str):
    """Gets a flashcard from the database"""
    statement = select(Flashcard).where(Flashcard.word == word)
    card = session.scalar(statement)
    return card


def get_next_due_flashcard(session: Session, current_time: datetime):
    """Fetches the next flashcard that is due for review"""
    statement = select(Flashcard).where(Flashcard.due <= current_time).order_by(Flashcard.due.asc()).limit(1)
    due_card = session.scalar(statement)
    return due_card


def get_due_flashcards(session: Session, current_time: datetime):
    """Fetches all words that are currently due for review"""
    statement = select(Flashcard).where(Flashcard.due <= current_time)
    due_cards = session.scalars(statement).all()
    return due_cards


def update_flashcard(session: Session, word: str, flashcard_data: dict[str, str | int | float]):
    """Updates a flashcard with its new data"""
    statement = update(Flashcard).where(Flashcard.word == word).values(**flashcard_data)
    session.execute(statement)


def review_flashcard(card: Card, rating: int, review_time: datetime):
    """Reviews a card by its rating"""
    card, _ = scheduler.review_card(card, rating, review_time)
    return card


def delete_flashcard(session: Session, word: str):
    """Delete a flashcard from the database"""
    session.execute(delete(Flashcard).where(Flashcard.word == word))


def calculate_flashcard_review_intervals(card: Card, current_time: datetime):
    """Calculates the hypothetical amount of time user would have before reviewing the same flashcard again based on which rating they select"""
    review_intervals = []
    for rating in range(1, 5):
        new_card = copy.deepcopy(card)
        new_card = review_flashcard(new_card, rating, current_time)
        review_intervals.append((new_card.due - current_time).total_seconds())
    return review_intervals


def generate_practice_sentences(words, num_sentences):
    """Generates practice senetences using Gemini and a list of words to generate sentences with"""
    prompt = f'Using this list of Mandarin Chinese words, generate {num_sentences} sentences for each word using simplified Mandarin Chinese: {', '.join(words)}. Other than the words in the list, use relatively common vocabulary for the sentences.'

    response_schema={
        "type": "object",
        "description": "A dictionary in which keys are a single Mandarin Chinese word whose values are Mandarin Chinese sentences that contain their corresponding key word.",
        "properties": {word: {'type': 'array', 'items': {'type': 'string'}} for word in words}
    }

    return prompt_gemini(prompt, schema=response_schema)


def prompt_gemini(prompt: str, model: str = 'gemini-2.5-flash', schema: dict = None):
    """Prompts Google Gemini and returns its response"""
    if schema == None:
        response = gemini_client.models.generate_content(model=model, contents=prompt).text
    else:
        response = gemini_client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=schema
            )
        ).text
    
    return response