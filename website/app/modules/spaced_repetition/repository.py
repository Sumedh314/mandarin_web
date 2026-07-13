from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app.models import Flashcard, Sentence


# FLASHCARDS


def add_flashcard(session: Session, flashcard: Flashcard):
    """Add a flashcard to the database."""
    session.add(flashcard)
    return flashcard


def get_flashcard_by_id(session: Session, card_id: int):
    """Get a flashcard by its ID in the database."""
    return session.get(Flashcard, card_id)


def get_flashcard_by_word_id(session: Session, user_id: int, user_word_id: int):
    """Get a flashcard by its user and word IDs."""
    statement = select(Flashcard).where(
        Flashcard.user_id == user_id,
        Flashcard.word_id == user_word_id
    )
    return session.scalar(statement)


def get_all_flashcards_for_user(session: Session, user_id: int):
    """Get all flashcards for a specific user."""
    statement = select(Flashcard).where(Flashcard.user_id == user_id)
    return session.scalars(statement).all()


def update_flashcard(session: Session, card_id: int, flashcard_data: dict):
    """Update a flashcard with new data."""
    statement = (
        update(Flashcard)
        .where(Flashcard.card_id == card_id)
        .values(**flashcard_data)
    )
    session.execute(statement)
    return flashcard_data


def delete_flashcard(session: Session, flashcard: Flashcard):
    """Delete a flashcard from the database."""
    session.delete(flashcard)
    return True


# SENTENCES


def add_sentences(session: Session, sentences: list[Sentence]):
    """Add a list of sentences for a specific word."""
    session.add_all(sentences)
    return sentences


def get_one_sentence_for_user_word(session: Session, user_word_id: int):
    """Get one sentence for a word."""
    statement = select(Sentence).where(Sentence.learning_word_id == user_word_id).limit(1)
    return session.scalar(statement)


def get_sentence(session: Session, sentence_text: str, user_word_id: int):
    """Get a sentence based on its text and associated word ID."""
    statement = (
        select(Sentence)
        .where(
            Sentence.text == sentence_text,
            Sentence.learning_word_id == user_word_id
        )
    )
    return session.scalar(statement)


def delete_sentence(session: Session, sentence: Sentence):
    """Delete a sentence from the database."""
    session.delete(sentence)
    return True