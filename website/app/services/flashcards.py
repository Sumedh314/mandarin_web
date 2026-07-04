import copy
from datetime import datetime

from sqlalchemy.orm import Session
from fsrs import Card

from app.models import Flashcard
import app.repositories.flashcards as flashcards_repository
from config import scheduler


def add_flashcard(session: Session, flashcard_data: dict[str, str | int | float]):
    """Adds a new flashcard row to the database"""
    card = create_new_card_object(**flashcard_data)
    flashcards_repository.add_flashcard(session, Flashcard(word_id=flashcard_data['wordId'], **card.to_dict()))
    session.commit()


def get_card_for_word_id(session: Session, word_id: str):
    """Gets a flashcard from the database"""
    flashcard = flashcards_repository.get_flashcard_by_word_id(session, word_id)
    card = create_new_card_object(**flashcard.to_dict())
    return card


def get_next_due_flashcard(session: Session, current_time_iso: str):
    """Fetches the next flashcard that is due for review"""
    due_cards = get_due_flashcards(session, current_time_iso)
    if not due_cards:
        return 'None'
    return due_cards[0]


def get_due_flashcards(session: Session, current_time_iso: str):
    """Fetches all words that are currently due for review"""
    flashcards = flashcards_repository.get_all_flashcards(session)
    current_time = datetime.fromisoformat(current_time_iso)
    due_flashcards = [flashcard for flashcard in flashcards if datetime.fromisoformat(flashcard.due) <= current_time or flashcard.state == 1]
    due_flashcards.sort(key=lambda flashcard: datetime.fromisoformat(flashcard.due))
    return due_flashcards


def update_flashcard(session: Session, card_id: int, flashcard_data: dict[str, str | int | float]):
    """Updates a flashcard with its new data"""
    flashcards_repository.update_flashcard(session, card_id, flashcard_data)
    session.commit()
    return flashcard_data


def review_card(card: Card, rating: int, review_time: datetime):
    """Reviews a card by its rating"""
    print('before', card.to_dict())
    card, _ = scheduler.review_card(card, rating, review_time)
    print('after ', card.to_dict())
    return card


def delete_flashcard(session: Session, card_id: int):
    """Delete a flashcard from the database based on its associated word"""
    flashcard = flashcards_repository.get_flashcard_by_id(session, card_id)
    flashcards_repository.delete_flashcard(session, flashcard)
    session.commit()
    return True


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