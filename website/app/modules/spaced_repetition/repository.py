from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import select, update, or_

from app.models import LearningWord, Flashcard, Sentence


# FLASHCARDS


def add_flashcard(session: Session, flashcard: Flashcard):
    """Add a flashcard to the database."""
    session.add(flashcard)
    return flashcard


def get_flashcard_by_id(session: Session, learning_word_id: int):
    """Get a flashcard by its ID in the database."""
    return session.get(Flashcard, learning_word_id)


def get_flashcard_by_word_id(session: Session, learning_word_id: int):
    """Get a flashcard by its user and word IDs."""
    statement = select(Flashcard).where(
        Flashcard.learning_word_id == learning_word_id
    )
    return session.scalar(statement)


def get_all_flashcards_for_user(session: Session, user_id: int):
    """Get all flashcards for a specific user."""
    statement = (
        select(Flashcard)
        .join(Flashcard.learning_word)
        .where(LearningWord.user_id == user_id)
    )
    return session.scalars(statement).all()


def get_due_flashcards(session: Session, user_id: int, current_time: datetime):
    """Get all words that are currently due for review for the user."""
    statement = (
        select(Flashcard)
        .join(Flashcard.learning_word)
        .where(
            LearningWord.user_id == user_id,
            or_(
                Flashcard.due <= current_time,
                Flashcard.state == 1
            )
        )
        .order_by(Flashcard.due)
    )
    return session.scalars(statement).all()


def update_flashcard(session: Session, learning_word_id: int, flashcard_data: dict):
    """Update a flashcard with new data."""
    statement = (
        update(Flashcard)
        .where(Flashcard.learning_word_id == learning_word_id)
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


def get_sentence_by_id(session: Session, id: int):
    """Get a sentence from the database by its ID."""
    return session.get(Sentence, id)


def get_sentence_for_word(session: Session, learning_word_id: int):
    """Get one sentence for a word."""
    statement = (
        select(Sentence)
        .where(Sentence.learning_word_id == learning_word_id)
        .limit(1)
    )
    return session.scalar(statement)


def get_sentence_by_text_and_word_id(
    session: Session,
    sentence_text: str,
    learning_word_id: int
):
    """Get a sentence based on its text and learning word ID."""
    statement = (
        select(Sentence)
        .where(
            Sentence.text == sentence_text,
            Sentence.learning_word_id == learning_word_id
        )
    )
    return session.scalar(statement)


def delete_sentence(session: Session, sentence: Sentence):
    """Delete a sentence from the database."""
    session.delete(sentence)
    return True