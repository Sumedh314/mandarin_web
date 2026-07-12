import json
from functools import lru_cache

import jieba
from pypinyin import lazy_pinyin, Style

from config import translator, WORDS_LIST_PATH


def segment_text(text: str):
    """Uses the Jieba library to segment Mandarin text."""
    return jieba.lcut(text)


def get_pinyin(text: str):
    """Fetches the pinyin representation of a piece of Mandarin text"""
    pinyin_list = lazy_pinyin(text, style=Style.TONE, neutral_tone_with_five=True)
    return ''.join(pinyin_list)


def translate_text(text: str):
    """Transaltes the given text into English, first by checking JSON file of words, and then Google Translate if word not found"""
    translations = get_word_translations()
    if text in translations:
        return translations[text]
    return translator.translate(text)


@lru_cache(maxsize=1)
def get_word_translations():
    """Returns the translations of words parsed once at the beginning of the session"""
    with open(WORDS_LIST_PATH, 'r') as words_list_file:
        all_words = json.load(words_list_file)

    return {word['s']: ', '.join([', '.join(form['m']) for form in word['f']]) for word in all_words}