from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.models import Sentence
from app.services.words import get_low_words, add_num_sentences
from app.services.ai import generate_practice_sentences


def add_sentences(session: Session, sentences: list[str], word: str):
    """Adds a list of sentences for a specific word"""
    sentence_list = [Sentence(text=sentence, word=word) for sentence in sentences]
    session.add_all(sentence_list)

def get_sentence(session: Session, word: str):
    """Queries the database to fetch the first sentence for a word"""
    statement = select(Sentence.text).where(Sentence.word == word).limit(1)
    sentence = session.scalar(statement)
    print(sentence)
    if sentence is None:
        generate_sentences_for_low_words(session)
        return get_sentence(session, word)
    return sentence


def generate_sentences_for_low_words(session: Session, num_sentences: int = 5, threshold: int = 5):
    """Generates sentences for words with fewer practice sentences than the given threshold if at least num_words words have fewer practice sentences than the threshold"""
    low_words = get_low_words(session, threshold)
    sentences = generate_practice_sentences(low_words, num_sentences)
    print(sentences)
    for word in low_words:
        print(sentences[word], len(sentences[word]))
        word_sentences = sentences[word]
        add_sentences(session, word_sentences, word)
        add_num_sentences(session, word, len(word_sentences))


def delete_sentence(session: Session, sentence: str, word: str):
    """Removes a sentence from the database"""
    statement = delete(Sentence).where(Sentence.text == sentence, Sentence.word == word)
    session.execute(statement)