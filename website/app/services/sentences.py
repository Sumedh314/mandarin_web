from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from app.models import Sentence
import app.repositories.sentences as sentences_repository
import app.services.words as words_service
import app.services.ai as ai


def add_sentences_for_word(session: Session, sentences: list[str], word_id: int):
    """Adds a list of sentences for a specific word"""
    sentence_list = [Sentence(text=sentence, word_id=word_id) for sentence in sentences]
    sentences_repository.add_sentences(session, sentence_list)
    session.commit()

def get_sentence(session: Session, word_id: int):
    """Gets the first sentence for a word"""
    sentence = sentences_repository.get_first_sentence_for_word(session, word_id)
    print(sentence)
    if sentence is None:
        generate_sentences_for_low_words(session)
        return get_sentence(session, word_id)
    return sentence


def generate_sentences_for_low_words(session: Session, num_sentences: int = 5, threshold: int = 5):
    """Generates sentences for words with fewer practice sentences than the given threshold if at least num_words words have fewer practice sentences than the threshold"""
    low_words = words_service.get_low_words(session, threshold)
    sentences = ai.generate_practice_sentences([word.text for word in low_words], num_sentences)
    print(sentences)
    for word in low_words:
        print(sentences[word.text], len(sentences[word.text]))
        word_sentences = sentences[word.text]
        add_sentences_for_word(session, word_sentences, word.id)


def delete_sentence(session: Session, sentence_text: str, word_id: int):
    """Removes a sentence from the database"""
    sentence = sentences_repository.get_sentence_by_text_and_word(session, sentence_text, word_id)
    sentences_repository.delete_sentence(session, sentence)
    session.commit()