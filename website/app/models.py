from datetime import datetime, timezone

from typing import Optional
from sqlalchemy import Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from .extensions import db


class Word(db.Model):
    __tablename__ = 'words'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(32), unique=True)
    proficiency: Mapped[int] = mapped_column(Integer, default=0)
    hsk_old_level: Mapped[Optional[int]] = mapped_column(Integer)
    hsk_new_level: Mapped[Optional[int]] = mapped_column(Integer)
    pinyin: Mapped[Optional[str]] = mapped_column(String(64))
    translation: Mapped[Optional[str]] = mapped_column(String(64))
    saved: Mapped[bool] = mapped_column(Boolean, default=False)
    num_sentences: Mapped[int] = mapped_column(Integer, default=0)

    def __repr__(self):
        return f'Word: {self.text}'


class Sentence(db.Model):
    __tablename__ = 'sentences'
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(255))
    word: Mapped[str] = mapped_column(String(10), ForeignKey(Word.text))

    def __repr__(self):
        return f'Sentence: {self.text}, word: {self.word}'


class Video(db.Model):
    __tablename__ = 'videos'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    video_id: Mapped[str] = mapped_column(String(64), index=True)
    title: Mapped[Optional[str]] = mapped_column(String(255))
    last_index: Mapped[int] = mapped_column(Integer, default=-1)

    def __repr__(self):
        return f'Video ID: {self.video_id}, title: {self.title}, last index: {self.last_index}'


class TranscriptLine(db.Model):
    __tablename__ = 'transcript_lines'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    video_id: Mapped[str] = mapped_column(String(64), ForeignKey(Video.video_id), index=True)
    text: Mapped[str] = mapped_column(String(1024))
    start: Mapped[float] = mapped_column(Float)
    duration: Mapped[float] = mapped_column(Float)

    def __repr__(self):
        return f'Text: {self.text}, ID: {self.video_id}, start: {self.start}'


class Flashcard(db.Model):
    __tablename__ = 'flashcards'

    card_id: Mapped[int] = mapped_column(primary_key=True)
    word: Mapped[str] = mapped_column(String(32), ForeignKey(Word.text), unique=True)
    state: Mapped[int] = mapped_column(Integer, default=1)
    step: Mapped[Optional[int]] = mapped_column(Integer)
    stability: Mapped[Optional[float]] = mapped_column(Float)
    difficulty: Mapped[Optional[float]] = mapped_column(Float)
    due: Mapped[str] = mapped_column(String(64))
    last_review: Mapped[Optional[str]] = mapped_column(String(64))

    def to_dict(self):
        return {
            'card_id': self.card_id,
            'word': self.word,
            'state': self.state,
            'step': self.step,
            'stability': self.stability,
            'difficulty': self.difficulty,
            'due': self.due,
            'last_review': self.last_review
        }

    def __repr__(self):
        return f'Word: {self.word}, due: {self.due}'