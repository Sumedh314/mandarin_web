import jieba
from pypinyin import lazy_pinyin, Style
from fsrs import Card, Scheduler, ReviewLog


def segment_text(text: str):
    """Uses the Jieba library to segment Mandarin text."""
    return jieba.lcut_for_search(text)


def fetch_pinyin(text: str):
    """Fetches the pinyin representation of a piece of Mandarin text"""
    pinyin_list = lazy_pinyin(text, style=Style.TONE, neutral_tone_with_five=True)
    return ''.join(pinyin_list)


def create_flashcard_object():
    """Creates a new flashcard object and returns the dictionary form of the card"""
    card = Card()
    return card.to_dict()