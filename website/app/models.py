from typing import Optional
from sqlalchemy import Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column
from .extensions import db


class Word(db.Model):
    __tablename__ = 'words'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(10), unique=True)
    proficiency: Mapped[int] = mapped_column(Integer)
    hsk_old_level: Mapped[Optional[int]] = mapped_column(Integer)
    hsk_new_level: Mapped[Optional[int]] = mapped_column(Integer)
    pinyin: Mapped[Optional[str]] = mapped_column(String(64))
    translation: Mapped[Optional[str]] = mapped_column(String(64))
    saved: Mapped[int] = mapped_column(Integer, default=1)

    def __repr__(self):
        return f'Word: {self.text}'


class Sentence(db.Model):
    __tablename__ = 'sentences'
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(255))
    word: Mapped[str] = mapped_column(String(10))

    def __repr__(self):
        return f'Sentence: {self.text}, word: {self.word}'


class TranscriptLine(db.Model):
    __tablename__ = 'transcript_lines'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    video_id: Mapped[str] = mapped_column(String(64))
    text: Mapped[str] = mapped_column(String(255))
    timestamp: Mapped[float] = mapped_column(Float)
    duration: Mapped[float] = mapped_column(Float)

    def __repr__(self):
        return f'Text: {self.text}, ID: {self.video_id}, timestamp: {self.timestamp}'


class Flashcard(db.Model):
    __tablename__ = 'flashcards'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    word: Mapped[str] = mapped_column(String(10), unique=True)
    state: Mapped[int] = mapped_column(Integer, default=1)
    step: Mapped[int] = mapped_column(Integer, default=0)
    stability: Mapped[Optional[float]] = mapped_column(Float)
    difficulty: Mapped[Optional[float]] = mapped_column(Float)
    due: Mapped[str] = mapped_column(String(64))
    last_review: Mapped[Optional[str]] = mapped_column(String(64))

    def __repr__(self):
        return f'Word: {self.word}, due: {self.due}'


# def execute_query(query: str, params: tuple = ()):
#     with sqlite3.connect(':memory:') as conn:
#         cursor = conn.cursor()
#         cursor.execute(query, params)
#         return cursor.fetchall()



# with sqlite3.connect(':memory:') as conn:
#     cursor = conn.cursor()
#     cursor.execute("""
#                    CREATE TABLE IF NOT EXISTS words_learning (
#                    word TEXT PRIMARY_KEY VARCHAR(64),
#                    proficiency INTEGER CHECK (proficiency BETWEEN 0 AND 3),
#                    hsk_old_level INTEGER CHECK (hsk_old_level BETWEEN 1 AND 6),
#                    hsk_new_level INTEGER CHECK (hsk_new_level BETWEEN 1 AND 9),
#                    pinyin TEXT VARCHAR(64),
#                    translation TEXT VARCHAR(64),
#                    saved BOOLEAN DEFAULT 0 CHECK (saved BETWEEN 0 AND 1)
#                    );""")
#     cursor.execute("INSERT INTO words_learning (word, proficiency) VALUES ('我', 2), ('你', 3)")
#     cursor.execute("SELECT proficiency FROM words_learning WHERE word = '我'")
#     print(cursor.fetchone())
#     conn.commit()