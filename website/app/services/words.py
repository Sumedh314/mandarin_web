from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.models import Word


def add_words(session: Session, words_data: list[dict[str, int | str]]):
    """Adds a list of words to the database"""
    words = [Word(**data) for data in words_data]
    new_words = get_new_words(session, words)
    session.add_all(new_words)
    session.flush()


def get_new_words(session: Session, words: list[Word]):
    """Gets a list of words from the given list that don't exist in the database"""
    statement = select(Word.text).where(Word.text.in_([word.text for word in words]))
    existing_words = session.scalars(statement).all()
    new_words = [word for word in words if word.text not in existing_words]
    return new_words


def get_word_proficiency_levels(session: Session, words: list[str]):
    """Queries the database to return a dictionary of proficiency levels for the given words"""
    statement = select(Word.text, Word.proficiency).where(Word.text.in_(words))
    word_proficiency_pairs = session.execute(statement).all()
    return dict(word_proficiency_pairs)


def update_word_proficiency_levels(session: Session, new_proficiency_levels_by_word: dict[str, int]):
    """Updates the proficiency levels for a dictionary of words"""
    for word, new_proficiency in new_proficiency_levels_by_word.items():
        statement = update(Word).where(Word.text == word).values(proficiency=new_proficiency)
        session.execute(statement)
    session.flush()


def calculate_new_proficiency_levels(session: Session, previous_words: list[str], current_word: str):
    """Calculates the new proficiency levels for a list of words"""
    previous_proficiency_levels = get_word_proficiency_levels(session, previous_words)
    new_proficiency_levels = {}
    for word in previous_words:
        proficiency = previous_proficiency_levels[word]
        if proficiency == 0:
            proficiency = 3
        elif 1 <= proficiency < 3:
            proficiency += 1
        new_proficiency_levels[word] = proficiency
    
    current_proficiency_level = get_word_proficiency_levels(session, [current_word])[current_word]
    if current_proficiency_level == 0:
        current_proficiency_level = 1
    elif 1 < current_proficiency_level <= 3:
        current_proficiency_level -= 1
    new_proficiency_levels[current_word] = current_proficiency_level
    
    return new_proficiency_levels


def get_low_words(session: Session, threshold: int = 5):
    """Fetches all saved words with fewer practice sentences than the given threshold"""
    statement = select(Word.text).where(Word.saved == True, Word.num_sentences < threshold)
    low_words = session.scalars(statement).all()
    print(low_words)
    return low_words


def get_saved_words(session: Session):
    """Gets all the words that the user has saved"""
    statement = select(Word.text).where(Word.saved == True)
    saved_words = session.scalars(statement).all()
    return saved_words


def get_word_saved_status(session: Session, word: str):
    """Checks whether the user has saved the given word"""
    statement = select(Word.saved).where(Word.text == word)
    word_saved_status = session.scalar(statement)
    return word_saved_status


def update_word_saved_status(session: Session, word: str, new_status: bool):
    """Updates whether or not a word is saved"""
    statement = update(Word).where(Word.text == word).values(saved=new_status)
    session.execute(statement)


def add_num_sentences(session: Session, word: str, num_addl_sentences: int):
    """Adds to the number of practice sentences for the word"""
    statement = select(Word.num_sentences).where(word == Word.text)
    num_sentences = session.scalar(statement)
    statement = update(Word).where(Word.text == word).values(num_sentences=num_sentences + num_addl_sentences)
    session.execute(statement)