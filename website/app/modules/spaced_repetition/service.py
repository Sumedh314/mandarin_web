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


def add_flashcard(session: Session, user_id: int, flashcard_data: dict):
    """Add a new flashcard to the database."""
    card = create_new_card_object(**flashcard_data)
    repository.add_flashcard(
        session=session,
        flashcard=Flashcard(
            user_id=user_id,
            word_id=flashcard_data['wordId'],
            **card.to_dict()
        )
    )
    session.commit()


def get_card_for_user_and_word_ids(session: Session, user_id: int, user_word_id: int):
    """Get a flashcard from the database."""
    flashcard = repository.get_flashcard_by_word_id(session, user_id, user_word_id)
    card = create_new_card_object(**flashcard.to_dict())
    return card


def get_next_due_flashcard(session: Session, user_id: int, current_time_iso: str):
    """Get the next flashcard that is due for review for the user."""
    due_cards = get_due_flashcards(session, user_id, current_time_iso)
    if not due_cards:
        return 'None'
    return due_cards[0]


def get_due_flashcards(session: Session, user_id: int, current_time_iso: str):
    """Get all words that are currently due for review for the user."""
    flashcards = repository.get_all_flashcards_for_user(session, user_id)
    current_time = datetime.fromisoformat(current_time_iso)

    due_flashcards: list[Flashcard] = []
    for flashcard in flashcards:
        flashcard_due = datetime.fromisoformat(flashcard.due)
        if flashcard_due <= current_time or flashcard.state == 1:
            due_flashcards.append(flashcard)

    due_flashcards.sort(key=lambda flashcard: datetime.fromisoformat(flashcard.due))
    return due_flashcards


def update_flashcard(session: Session, card_id: int, flashcard_data: dict):
    """Update a flashcard with its new data."""
    repository.update_flashcard(session, card_id, flashcard_data)
    session.commit()
    return flashcard_data


def review_card(card: Card, rating: int, review_time: datetime):
    """Review a card by its rating."""
    print('before', card.to_dict())
    card, _ = scheduler.review_card(card, rating, review_time)
    print('after ', card.to_dict())
    return card


def delete_flashcard(session: Session, card_id: int):
    """Delete a flashcard from the database."""
    flashcard = repository.get_flashcard_by_id(session, card_id)
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


def create_new_card_object(**kwargs):
    """Createa a new card object with the given parameters."""
    card_dict = Card().to_dict()
    fsrs_card_keys = card_dict.keys()
    card_keys = {key: value for key, value in kwargs.items() if key in fsrs_card_keys}
    for key, value in card_keys.items():
        card_dict[key] = value
    return Card.from_dict(card_dict)


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
    sentence = repository.get_one_sentence_for_user_word(session, user_word_id)
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
        session: The SQLAlchemy database session.
        num_sentences: The number of sentences to create for each word.
        threshold: The amount of sentences a word must have fewer than
            to generate more sentences for.
    """
    low_words = words_service.get_low_words(session, threshold)
    word_texts = [word.text for word in low_words]
    sentences = ai.generate_practice_sentences(word_texts, num_sentences)
    print(sentences)
    for word in low_words:
        print(sentences[word.text], len(sentences[word.text]))
        word_sentences = sentences[word.text]
        add_sentences_for_word(session, word_sentences, word.id)


def delete_sentence(session: Session, sentence_text: str, user_word_id: int):
    """Remove a sentence from the database."""
    sentence = repository.get_sentence(session, sentence_text, user_word_id)
    repository.delete_sentence(session, sentence)
    session.commit()