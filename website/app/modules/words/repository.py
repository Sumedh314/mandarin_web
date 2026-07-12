from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import UserWord


def add_word(session: Session, word: UserWord):
    """Adds a word to the database"""
    session.add(word)
    return word


def add_words(session: Session, words: list[UserWord]):
    """Adds a list of words to the database"""
    session.add_all(words)
    return words


def get_word_by_id(session: Session, id: int):
    """Fetches a word from the database by its ID"""
    return session.get(UserWord, id)


def get_word_by_text(session: Session, word_text: str):
    """Fetches a word from the database by its text"""
    statement = select(UserWord).where(UserWord.text == word_text)
    return session.scalar(statement)


def get_words_by_texts(session: Session, word_texts: list[str]):
    """Get word objects based on their text."""
    statement = select(UserWord).where(UserWord.text.in_(word_texts))
    return session.scalars(statement).all()


def get_all_words(session: Session):
    """Gets all words in the database"""
    statement = select(UserWord)
    return session.scalars(statement).all()


def get_existing_words_in_list(session: Session, words: list[str]):
    statement = select(UserWord).where(UserWord.text.in_(words))
    return session.scalars(statement).all()


def get_saved_words(session: Session):
    """Fetches all saved words from the database"""
    statement = select(UserWord).where(UserWord.saved == True)
    return session.scalars(statement).all()


def delete_word(session: Session, word: UserWord):
    """Deletes a word from the database"""
    session.delete(word)
    return True