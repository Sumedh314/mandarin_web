from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from app.models import Sentence


def add_sentences(session: Session, sentences: list[Sentence]):
    """Adds a list of sentences for a specific word"""
    session.add_all(sentences)
    return sentences


def get_first_sentence_for_word(session: Session, word_id: int):
    """Queries the database to fetch the first sentence for a word"""
    statement = select(Sentence).where(Sentence.word_id == word_id).limit(1)
    return session.scalar(statement)


def get_sentence_by_text_and_word(session: Session, sentence_text: str, word_id: int):
    """Gets a sentence based on its text and associated word ID"""
    statement = select(Sentence).where(Sentence.text == sentence_text, Sentence.word_id == word_id)
    return session.scalar(statement)


def delete_sentence(session: Session, sentence: Sentence):
    """Deletes a sentence from the database"""
    session.delete(sentence)
    return True