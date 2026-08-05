import os
from pathlib import Path

from fsrs import Scheduler
from deep_translator import GoogleTranslator
from youtube_transcript_api import YouTubeTranscriptApi
from google import genai


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')

    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg://mandarin_qk5p_user:4IkK3c1JHC9Njb8TYnIpj52BxYfcchEF@dpg-d9p5mc3m8hqs73acecf0-a/mandarin_qk5p'
    # SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg://mandarin_qk5p_user:4IkK3c1JHC9Njb8TYnIpj52BxYfcchEF@dpg-d9p5mc3m8hqs73acecf0-a.ohio-postgres.render.com/mandarin_qk5p'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_SECURE = False


scheduler = Scheduler()
translator = GoogleTranslator()
transcript_generator = YouTubeTranscriptApi()

MANDARIN_LANGAUGE_CODES = ['zh', 'zh-Hans', 'zh-CN', 'zh-Hant']
MANDARIN_AND_ENGLISH_LANGUAGE_CODES = MANDARIN_LANGAUGE_CODES + ['en']

BASE_PATH = Path(__file__).parent / 'app'

WORD_PROFICIENCY_LEVELS_PATH = BASE_PATH / 'user_progress' / 'word_proficiency_levels.json'
PRACTICE_SENTENCES_PATH = BASE_PATH / 'user_progress' / 'practice_sentences.json'
FLASHCARDS_DATA_PATH = BASE_PATH / 'user_progress' / 'flashcards_data.json'
SAVED_WORDS_PATH = BASE_PATH / 'user_progress' / 'saved_words.json'
WORDS_LIST_PATH = BASE_PATH / 'mandarin_words' / 'words.json'
TRANSCRIPTS_PATH = BASE_PATH / 'user_progress' / 'transcripts.json'
HSK_WORDS_PATH = BASE_PATH / 'mandarin_words' / 'words_by_hsk.json'
HSK_LEVEL_HASHMAP_PATH = BASE_PATH / 'mandarin_words' / 'hsk_level_hashmap.json'