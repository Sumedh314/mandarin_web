from sqlalchemy.orm import Session

from app.repositories import words as words_repository
from app.models import Word


def add_new_words(session: Session, words_data: list[dict[str, int | str]]):
    """Adds a list of words to the database. First filters out any words that already exist in the database, then adds the new words"""
    words = [Word(**data) for data in words_data]
    new_words = get_new_words(session, words)
    words_repository.add_words(session, new_words)
    session.commit()
    return new_words


def get_new_words(session: Session, words: list[Word]):
    """Gets the words in the list that are not already stored in the database"""
    existing_words = [word.text for word in words_repository.get_existing_words_in_list(session, [word.text for word in words])]
    return [word for word in words if word.text not in existing_words]


def update_word_proficiency_levels(session: Session, new_proficiency_levels_by_word_id: dict[int, int]):
    """Updates the proficiency levels for a dictionary of words"""
    for word_id, new_proficiency in new_proficiency_levels_by_word_id.items():
        word = words_repository.get_word_by_id(session, word_id)
        word.proficiency = new_proficiency
    session.commit()
    return new_proficiency_levels_by_word_id


def get_proficiency_levels(session: Session, word_ids: list[int]):
    proficiency_levels = {}
    for id in word_ids:
        proficiency_levels[id] = words_repository.get_word_by_id(session, id).proficiency
    return proficiency_levels    


def calculate_new_proficiency_levels(session: Session, previous_word_ids: list[int], current_word_id: int):
    """Calculates the new proficiency levels for a list of words"""
    previous_proficiency_levels = {id: words_repository.get_word_by_id(session, id).proficiency for id in previous_word_ids}

    new_proficiency_levels = {}
    for word in previous_word_ids:
        proficiency = previous_proficiency_levels[word]
        if proficiency == 0:
            proficiency = 3
        elif 1 <= proficiency < 3:
            proficiency += 1
        new_proficiency_levels[word] = proficiency
    
    current_proficiency_level = words_repository.get_word_by_id(session, current_word_id).proficiency

    if current_proficiency_level == 0:
        current_proficiency_level = 1
    elif 1 < current_proficiency_level <= 3:
        current_proficiency_level -= 1

    new_proficiency_levels[current_word_id] = current_proficiency_level
    
    return new_proficiency_levels


def get_word_saved_status(session: Session, word_id: int):
    """Checks if a word is marked as saved"""
    word = words_repository.get_word_by_id(session, word_id)
    return word.saved


def update_word_saved_status(session: Session, word_id: int, new_saved_status: bool):
    """Updates the saved status of a word in the database"""
    word = words_repository.get_word_by_id(session, word_id)
    word.saved = new_saved_status
    session.commit()
    return word


def get_low_words(session: Session, threshold: int = 5):
    saved_words = words_repository.get_saved_words(session)
    return [word for word in saved_words if len(word.sentences) < threshold]