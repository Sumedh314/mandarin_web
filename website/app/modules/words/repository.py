from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import LearningWord


# USER WORDS


def add_user_word(session: Session, word: LearningWord):
    """Add a word to the database."""
    session.add(word)
    return word


def add_user_words(session: Session, words: list[LearningWord]):
    """Add a list of words to the database."""
    session.add_all(words)
    return words


def get_user_word_by_id(session: Session, id: int):
    """Get a word from the database by its ID."""
    return session.get(LearningWord, id)


def get_word_by_text_for_user(session: Session, user_id: int, word_text: str):
    """Get a word from the database by its text."""
    statement = select(LearningWord).where(
        LearningWord.user_id == user_id,
        LearningWord.text == word_text
    )
    return session.scalar(statement)


def get_user_words_by_texts(session: Session, user_id: int, word_texts: list[str]):
    """Get word objects based on their text for a user."""
    statement = select(LearningWord).where(
        LearningWord.user_id == user_id,
        LearningWord.text.in_(word_texts)
    )
    return session.scalars(statement).all()


def get_all_words_for_user(session: Session, user_id: int):
    """Get all words in the database for a specific user."""
    statement = select(LearningWord).where(LearningWord.user_id == user_id)
    return session.scalars(statement).all()


def get_existing_words_in_list(session: Session, words: list[str]):
    """Get words from a list that a user has already encountered."""
    statement = select(LearningWord).where(LearningWord.text.in_(words))
    return session.scalars(statement).all()


def get_saved_words_for_user(session: Session, user_id: int):
    """Get all saved words from the database."""
    statement = select(LearningWord).where(
        LearningWord.user_id == user_id,
        LearningWord.saved == True
    )
    return session.scalars(statement).all()


def delete_word(session: Session, word: LearningWord):
    """Delete a word from the database."""
    session.delete(word)
    return True