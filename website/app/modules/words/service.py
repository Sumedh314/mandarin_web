import json

from sqlalchemy.orm import Session
import jieba
from pypinyin import lazy_pinyin, Style

import app.modules.words.repository as repository
from app.models import Word, WordForm, LearningWord
from config import translator, WORDS_LIST_PATH, HSK_WORDS_PATH, HSK_LEVEL_HASHMAP_PATH


def add_new_words(session: Session, word_texts: list[str]):
    """Add words to the database that are not already in it."""
    existing_word_texts = repository.get_existing_words_in_list(session, word_texts)
    new_word_texts = [
        word_text for word_text in word_texts
        if word_text not in existing_word_texts
    ]
    new_words = [Word(text=word_text) for word_text in new_word_texts]
    new_word_forms = [WordForm(word_id=word.id) for word in new_words]
    repository.add_words(session, new_words)
    repository.add_word_forms(session, new_word_forms)
    session.commit()
    return new_words


def update_word(session: Session, word_id: int, data: dict):
    """Update a word with new data."""
    word = repository.get_word_by_id(session, word_id)
    for key, value in data.items():
        setattr(word, key, value)
    session.commit()
    return word


def add_learning_words(session: Session, user_id: int, word_ids: list[int]):
    """Add learning words to the database for a specific user."""
    learning_words = [
        LearningWord(user_id=user_id, word_id=word_id)
        for word_id in word_ids
    ]
    repository.add_learning_words(session, learning_words)
    session.commit()
    return learning_words


def update_learning_word(session: Session, learning_word_id: int, data: dict):
    """Update a learning word with new data."""
    learning_word = repository.get_learning_word_by_id(session, learning_word_id)
    for key, value in data.items():
        setattr(learning_word, key, value)
    session.commit()
    return learning_word


def get_learning_word_ids(session: Session, user_id: int, word_texts: list[str]):
    """Get the IDs of a list of learning words."""
    words = repository.get_learning_word_ids(session, user_id, word_texts)
    return {word[0]: word[1] for word in words}


def get_learning_word_data(session: Session, learning_word_id: int):
    """Get all the data for a learning word."""
    learning_word = repository.get_learning_word_by_id(session, learning_word_id)
    original_word_data = get_word_data(session, learning_word.original_word.id)
    learning_word_user_data = {
        'proficiency': learning_word.proficiency,
        'saved': learning_word.saved
    }
    return learning_word_user_data | original_word_data


def get_word_data(session: Session, word_id: int):
    """Get all the data for a word."""
    word = repository.get_word_by_id(session, word_id)

    return {
        'id': word.id,
        'text': word.text,
        'radical': word.radical,
        'hsk_old_level': word.hsk_old_level,
        'hsk_new_level': word.hsk_new_level,
        'frequency': word.frequency,
        'parts_of_speech': word.parts_of_speech,
        'forms': [
            {
                'traditional': form.traditional,
                'pinyin': form.pinyin,
                'bopomofo': form.bopomofo,
                'translations': form.translations,
                'classifiers': form.classifiers
            }
            for form in word.forms
        ]
    }


def get_proficiency_levels(session: Session, learning_word_ids: list[int]):
    """Get the proficiency levels of a list of learning word IDs."""
    proficiency_levels = repository.get_proficiency_levels(session, learning_word_ids)
    return {word[0]: word[1] for word in proficiency_levels}


def calculate_new_proficiency_levels(
    session: Session,
    previous_word_ids: list[int],
    current_word_id: int
):
    """Calculates what the new proficiency levels should be.
    
    For previous words, if the previous proficiency was zero, the new
    proficiency is set to three. Otherwise, the proficiency increases
    by one (unless it was already three).
    
    For the current word, if the
    previous proficiency was zero, the new proficiency is set to one.
    Otherwise, the proficiency decreases by one if it was previously
    greater than one.
    
    Arguments:
        session (sqlalchemy.orm.Session): The database session.
        previous_word_ids (list[int]): The IDs of the words between the
            last word the user clicked on and the current word.
        current_word_id (int): The ID of the word the user just clicked
            on.
    
    Returns:
        dict[int, int]: A dictionary with the keys being the word
            IDs and the values being the new proficiency levels.
    """
    previous_words_proficiency_levels_by_id = repository.get_proficiency_levels(
        session,
        previous_word_ids
    )
    current_word_proficiency_level_by_id = repository.get_proficiency_levels(
        session,
        current_word_id
    )[0]

    new_proficiency_levels = {}
    for id, proficiency in previous_words_proficiency_levels_by_id:
        if proficiency == 0:
            proficiency = 4
        elif proficiency < 3:
            proficiency += 1
        new_proficiency_levels[id] = proficiency
    
    proficiency = current_word_proficiency_level_by_id[current_word_id]
    if proficiency == 0:
        proficiency = 1
    elif proficiency > 1:
        proficiency -= 1
    new_proficiency_levels[current_word_id] = proficiency

    return new_proficiency_levels


def update_proficiency_levels(session: Session, proficiency_levels: dict[int, int]):
    """Update the proficiency levels of a list of words."""
    repository.update_proficiency_levels(session, proficiency_levels)
    session.commit()
    return proficiency_levels


def calculate_and_update_proficiency_levels(
    session: Session,
    previous_word_ids: list[int],
    current_word_id: int
):
    """Calculate and update new proficiency levels."""
    new_proficiency_levels = calculate_new_proficiency_levels(
        session,
        previous_word_ids,
        current_word_id
    )
    update_proficiency_levels(session, new_proficiency_levels)
    session.commit()
    return new_proficiency_levels


# LANGUAGE PROCESSING


def segment_text(text: str):
    """Segment Chinese text using the Jieba library."""
    return jieba.lcut(text)


def get_new_pinyin(text: str, context: str | None = None) -> str:
    """Use the pypinyin library to get the pinyin of text.
    
    If context surrounding the text is provided, pypinyin is used to
    find the pinyin representation of the text within the specific
    context.
    
    Arguments:
        text (str): Mandarin text to get the pinyin representation of.
        context (str | None = None): Optional text surrounding and
            including the target text.
    
    Returns:
        str: A string with no spaces representing the pinyin of the
            given text.
    """
    source = context or text
    
    pinyin_list = lazy_pinyin(source, style=Style.TONE, neutral_tone_with_five=True)
    
    if context:
        index = context.index(text)
        pinyin_list = pinyin_list[index : index + len(text) + 1]
        
    return ''.join(pinyin_list)


def get_new_translation(text: str):
    """Translate a piece of Mandarin text with Google Translate."""
    return translator.translate(text)