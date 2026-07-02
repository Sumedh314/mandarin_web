import os
from pathlib import Path
from fsrs import Scheduler, Card
from deep_translator import GoogleTranslator
from youtube_transcript_api import YouTubeTranscriptApi
from google import genai
from dotenv import load_dotenv


class DatabaseConfig:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///mandarin.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False


load_dotenv()

scheduler = Scheduler()
translator = GoogleTranslator()
transcript_generator = YouTubeTranscriptApi()
gemini_client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

MANDARIN_LANGAUGE_CODES = ['zh', 'zh-Hans', 'zh-CN', 'zh-Hant']
MANDARIN_AND_ENGLISH_LANGUAGE_CODES = MANDARIN_LANGAUGE_CODES + ['en']

BASE_PATH = Path(__file__).parent / 'app'

WORD_PROFICIENCY_LEVELS_PATH = BASE_PATH / 'user_progress' / 'word_proficiency_levels.json'
PRACTICE_SENTENCES_PATH = BASE_PATH / 'user_progress' / 'practice_sentences.json'
FLASHCARDS_DATA_PATH = BASE_PATH / 'user_progress' / 'flashcards_data.json'
SAVED_WORDS_PATH = BASE_PATH / 'user_progress' / 'saved_words.json'
TRANSCRIPTS_PATH = BASE_PATH / 'user_progress' / 'transcripts.json'
HSK_WORDS_PATH = BASE_PATH / 'mandarin_words' / 'words_by_hsk.json'
WORDS_LIST_PATH = BASE_PATH / 'mandarin_words' / 'words.json'

flashcards_by_word: dict[str, Card] = {}