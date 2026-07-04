from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import Word


def add_word(session: Session, word: Word):
    """Adds a word to the database"""
    session.add(word)
    return word


def add_words(session: Session, words: list[Word]):
    """Adds a list of words to the database"""
    session.add_all(words)
    return words


def get_existing_words_in_list(session: Session, words: list[str]):
    statement = select(Word).where(Word.text.in_(words))
    return session.scalars(statement).all()


def get_word_by_id(session: Session, id: int):
    """Fetches a word from the database by its ID"""
    return session.get(Word, id)


def get_word_by_text(session: Session, word_text: str):
    """Fetches a word from the database by its text"""
    statement = select(Word).where(Word.text == word_text)
    return session.scalar(statement)


def get_saved_words(session: Session):
    """Fetches all saved words from the database"""
    statement = select(Word).where(Word.saved == True)
    return session.scalars(statement).all()


def delete_word(session: Session, word: Word):
    """Deletes a word from the database"""
    session.delete(word)
    return True