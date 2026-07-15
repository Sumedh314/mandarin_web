import copy
from datetime import datetime

from sqlalchemy.orm import Session
from fsrs import Card

from app.models import Flashcard, Sentence
import app.modules.spaced_repetition.repository as repository
import app.modules.words.service as words_service
import app.modules.ai as ai
from config import scheduler


# FLASHCARDS


def validate_flashcard_user(user_id: int, learning_word_id: int):
    """Make sure the user is allowed to change a flashcard."""
    pass


def add_flashcard(
    session: Session,
    flashcard_data: dict
):
    """Add a new flashcard to the database."""
    card = create_card_object_from_flashcard_data(**flashcard_data)
    flashcard = Flashcard(
        **convert_card_dict_iso_to_datetime(card.to_dict())
    )
    repository.add_flashcard(session, flashcard)
    session.commit()
    return card


def get_card_for_learning_word_id(session: Session, learning_word_id: int):
    """Get a flashcard from the database."""
    flashcard = repository.get_flashcard_by_word_id(session, learning_word_id)
    card = create_card_object_from_flashcard_data(**flashcard.to_dict())
    return card


def get_next_due_flashcard(session: Session, user_id: int, current_time_iso: str):
    """Get the next flashcard that is due for review for the user."""
    current_time = datetime.fromisoformat(current_time_iso)
    due_cards = repository.get_due_flashcards(session, user_id, current_time)
    if not due_cards:
        return 'None'
    return due_cards[0]


def update_flashcard(session: Session, learning_word_id: int, flashcard_data: dict):
    """Update a flashcard with its new data."""
    repository.update_flashcard(session, learning_word_id, flashcard_data)
    session.commit()
    return flashcard_data


def review_card(card: Card, rating: int, review_time: datetime):
    """Review a card by its rating."""
    print('before', card.to_dict())
    card, _ = scheduler.review_card(card, rating, review_time)
    print('after ', card.to_dict())
    return card


def delete_flashcard(session: Session, learning_word_id: int):
    """Delete a flashcard from the database."""
    flashcard = repository.get_flashcard_by_id(session, learning_word_id)
    repository.delete_flashcard(session, flashcard)
    session.commit()
    return True


def calculate_card_review_intervals(card: Card, current_time: datetime):
    """Calculate hypothetical review times of each rating of a card."""
    review_intervals = []
    for rating in range(1, 5):
        new_card = copy.deepcopy(card)
        new_card = review_card(new_card, rating, current_time)
        review_intervals.append((new_card.due - current_time).total_seconds())
    return review_intervals


def create_card_object_from_flashcard_data(**kwargs):
    """Create a new card object with the given parameters."""
    card_dict = Card().to_dict()
    fsrs_card_keys = card_dict.keys()
    card_items = {key: value for key, value in kwargs.items() if key in fsrs_card_keys}
    for key, value in card_items.items():
        card_dict[key] = value
    card_dict['card_id'] = card_dict.pop('learning_word_id')
    return Card.from_dict(card_dict)


def convert_card_dict_iso_to_datetime(card_dict: dict):
    """Convert dates in a card dictionary from ISO to datetime."""
    for key, value in card_dict.items():
        if key in ['due', 'last_review']:
            card_dict[key] = datetime.fromisoformat(value)
    return card_dict


def convert_card_dict_datetime_to_iso(card_dict: dict):
    """Convert dates in a card dictionary from datetime to ISO."""
    for key, value in card_dict.items():
        if key in ['due', 'last_review']:
            card_dict[key] = datetime.isoformat(value)
    return card_dict


# SENTENCES


def add_sentences_for_word(session: Session, sentences: list[str], user_word_id: int):
    """Add a list of sentences for a specific word."""
    sentence_list = [
        Sentence(text=sentence, user_word_id=user_word_id)
        for sentence in sentences
    ]
    repository.add_sentences(session, sentence_list)
    session.commit()


def get_sentence(session: Session, user_word_id: int):
    """Gets the first sentence for a word"""
    sentence = repository.get_sentence_for_word(session, user_word_id)
    print(sentence)
    if sentence is None:
        generate_sentences_for_low_words(session)
        return get_sentence(session, user_word_id)
    return sentence


def generate_sentences_for_low_words(
    session: Session,
    num_sentences: int = 5,
    threshold: int = 5
):
    """Generate sentences for words that are running low on sentences.
    
    If a word has fewer practice sentences than the threshold, this
    function prompts Google Gemini to generate more sentences for those
    words.
    
    Args:
        session (sqlalchemy.orm.Session): The database session.
        num_sentences (int): The number of sentences to create for each
            word.
        threshold (int): The amount of sentences a word must have fewer
            than to generate more sentences for.
    """
    low_words = words_service.get_low_words(session, threshold)
    word_texts = [word.text for word in low_words]
    sentences = ai.generate_practice_sentences(word_texts, num_sentences)
    print(sentences)
    for word in low_words:
        print(sentences[word.text], len(sentences[word.text]))
        word_sentences = sentences[word.text]
        add_sentences_for_word(session, word_sentences, word.id)


def delete_sentence_by_id(session: Session, id: int):
    """Delete a sentence from the database by its ID."""
    sentence = repository.get_sentence_by_id(session, id)
    session.delete(sentence)
    return True


def delete_sentence_by_text_and_word_id(
    session: Session,
    sentence_text: str,
    user_word_id: int
):
    """Delete a sentence from the database by its text and word ID."""
    sentence = repository.get_sentence_by_text_and_word_id(
        session,
        sentence_text,
        user_word_id
    )
    repository.delete_sentence(session, sentence)
    session.commit()
    return True