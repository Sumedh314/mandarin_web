import json

import jieba
from pypinyin import lazy_pinyin, Style

from config import translator, WORDS_LIST_PATH


def segment_text(text: str):
    """Uses the Jieba library to segment Mandarin text."""
    return jieba.lcut_for_search(text)


def get_pinyin(text: str):
    """Fetches the pinyin representation of a piece of Mandarin text"""
    pinyin_list = lazy_pinyin(text, style=Style.TONE, neutral_tone_with_five=True)
    return ''.join(pinyin_list)


def translate_text(text: str):
    """Transaltes the given text into English, first by checking JSON file of words, and then Google Translate if word not found"""
    if len(text) <= 6:
        with open(WORDS_LIST_PATH, 'r') as words_list_file:
            all_words = json.load(words_list_file)

        for word in all_words:
            if word['s'] == text:
                translation = ', '.join([', '.join(form['m']) for form in word['f']])
                return translation

    return translator.translate(text)