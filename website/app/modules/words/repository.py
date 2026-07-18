from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models import Word, WordForm, LearningWord, Sentence


def add_words(session: Session, words: list[Word]):
    """Add a list of words to the database."""
    session.add_all(words)
    return words


def add_learning_words(session: Session, learning_words: list[LearningWord]):
    """Add a list of words to the database."""
    session.add_all(learning_words)
    return learning_words


def add_word_forms(session: Session, word_forms: list[WordForm]):
    """Add a word form to the database."""
    session.add_all(word_forms)
    return word_forms


def get_word_by_id(session: Session, id: int):
    """Get a word object by its ID."""
    return session.get(Word, id)


def get_word_ids_by_texts(session: Session, texts: list[str]):
    """Get a list of words by their IDs."""
    statement = select(Word.id).where(Word.text.in_(texts))
    return session.scalars(statement).all()


def get_learning_word_by_id(session: Session, id: int):
    """Get a learning word object by its ID."""
    return session.get(LearningWord, id)


def get_learning_word_ids(session: Session, user_id: int, word_texts: list[str]):
    """Get the IDs of learning words for a user by their text."""
    statement = (
        select(Word.text, LearningWord.id)
        .join(LearningWord.original_word)
        .where(
            LearningWord.user_id == user_id,
            Word.text.in_(word_texts)
        )
    )
    return session.execute(statement).all()


def get_existing_words_in_list(session: Session, words: list[str]):
    """Get words from the list that already exist in the database."""
    statement = select(Word).where(Word.text.in_(words))
    return session.scalars(statement).all()


def get_existing_learning_word_texts_in_list(
    session: Session,
    user_id: int,
    words: list[str]
):
    """Get learning words that the current user has seen."""
    statement = (
        select(Word.text)
        .join(LearningWord.original_word)
        .where(
            LearningWord.user_id == user_id,
            Word.text.in_(words)
        )
    )
    return session.scalars(statement).all()


def get_proficiency_levels(session: Session, learning_word_ids: list[int]):
    """Get the proficiency levels of a list of words for a user."""
    statement = (
        select(
            LearningWord.id,
            LearningWord.proficiency
        )
        .where(LearningWord.id.in_(learning_word_ids))
    )
    return session.execute(statement).all()


def update_proficiency_levels(
    session: Session,
    new_proficiency_levels_by_id: dict[int, int]
):
    """Update the proficiency levels of a list of words by their IDs."""
    for id, proficiency in new_proficiency_levels_by_id.items():
        learning_word = get_learning_word_by_id(session, id)
        learning_word.proficiency = proficiency
    return new_proficiency_levels_by_id


def get_saved_words_in_list(
    session: Session,
    user_id: int,
    learning_word_ids: list[int]
):
    """Get the words from the list that the user has saved."""
    statement = (
        select(LearningWord.id)
        .where(
            LearningWord.user_id == user_id,
            LearningWord.id.in_(learning_word_ids),
            LearningWord.saved
        )
    )
    return session.scalars(statement).all()


def get_low_words(session: Session, user_id: int, threshold: int):
    """Get words that have fewer sentences than the given threshold."""
    statement = (
        select(LearningWord)
        .outerjoin(LearningWord.sentences)
        .where(
            LearningWord.user_id == user_id,
            LearningWord.saved
        )
        .group_by(LearningWord.id)
        .having(func.count(Sentence.id) < threshold)
    )
    return session.scalars(statement).all()