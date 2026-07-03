import copy
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from fsrs import Card
from app.models import Flashcard
from app.services.sentences import generate_sentences_for_low_words
from config import scheduler


def add_flashcard(session: Session, flashcard_data: dict[str, str | int | float]):
    """Adds a new flashcard row to the database"""
    card = create_new_card_object(**flashcard_data)
    session.add(Flashcard(word=flashcard_data['word'], **card.to_dict()))
    generate_sentences_for_low_words(session)


def get_card_for_word(session: Session, word: str):
    """Gets a flashcard from the database"""
    statement = select(Flashcard).where(Flashcard.word == word)
    flashcard = session.scalar(statement)
    card = create_new_card_object(**flashcard.to_dict())
    print(card.last_review, type(card.last_review))
    return card


def get_next_due_flashcard(session: Session, current_time_iso: str):
    """Fetches the next flashcard that is due for review"""
    due_cards = get_due_flashcards(session, current_time_iso)
    if not due_cards:
        return 'None'
    return due_cards[0]


def get_due_flashcards(session: Session, current_time_iso: str):
    """Fetches all words that are currently due for review"""
    current_time = datetime.fromisoformat(current_time_iso)
    statement = select(Flashcard)
    flashcards = session.scalars(statement).all()
    due_flashcards = [flashcard for flashcard in flashcards if datetime.fromisoformat(flashcard.due) <= current_time or flashcard.state == 1]
    print(current_time, due_flashcards)
    if due_flashcards is None:
        return []
    return due_flashcards


def update_flashcard(session: Session, word: str, flashcard_data: dict[str, str | int | float]):
    """Updates a flashcard with its new data"""
    print(flashcard_data)
    statement = update(Flashcard).where(Flashcard.word == word).values(**flashcard_data)
    session.execute(statement)


def review_card(card: Card, rating: int, review_time: datetime):
    """Reviews a card by its rating"""
    print('before', card.to_dict())
    card, _ = scheduler.review_card(card, rating, review_time)
    print('after ', card.to_dict())
    return card


def delete_flashcard(session: Session, word: str):
    """Delete a flashcard from the database"""
    session.execute(delete(Flashcard).where(Flashcard.word == word))


def calculate_card_review_intervals(card: Card, current_time: datetime):
    """Calculates the hypothetical amount of time user would have before reviewing the same flashcard again based on which rating they select"""
    review_intervals = []
    for rating in range(1, 5):
        new_card = copy.deepcopy(card)
        new_card = review_card(new_card, rating, current_time)
        review_intervals.append((new_card.due - current_time).total_seconds())
    return review_intervals


def create_new_card_object(**kwargs):
    """Createas a new card object with the given parameters"""
    kwargs_dict = {key: value for key, value in kwargs.items() if key in ['card_id', 'state', 'step', 'stability', 'difficulty', 'due', 'last_review']}
    card_dict = Card().to_dict()
    for key, value in kwargs_dict.items():
        card_dict[key] = value
    card = Card.from_dict(card_dict)
    return card