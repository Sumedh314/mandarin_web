from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app.models import Flashcard


def add_flashcard(session: Session, flashcard: Flashcard):
    """Adds a flashcard to the database"""
    session.add(flashcard)
    return flashcard


def get_flashcard_by_id(session: Session, card_id: int):
    """Gets a flashcard by its ID in the database"""
    return session.get(Flashcard, card_id)


def get_flashcard_by_word_id(session: Session, word_id: int):
    """Gets a flashcard by its associated word's ID in the database"""
    statement = select(Flashcard).where(Flashcard.word_id == word_id)
    return session.scalar(statement)


def get_all_flashcards(session: Session):
    """Gets all flashcards currently in the database"""
    statement = select(Flashcard)
    return session.scalars(statement).all()


def update_flashcard(session: Session, card_id: int, flashcard_data: dict[str, str | int | float]):
    """Updates a flashcard with its new data"""
    statement = update(Flashcard).where(Flashcard.card_id == card_id).values(**flashcard_data)
    session.execute(statement)
    return flashcard_data


def delete_flashcard(session: Session, flashcard: Flashcard):
    """Deletes a flashcard from the database"""
    session.delete(flashcard)
    return True