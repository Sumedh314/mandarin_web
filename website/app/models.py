from datetime import datetime, timezone

from typing import Optional
from sqlalchemy import Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from .extensions import db


class Word(db.Model):
    __tablename__ = 'words'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(32), unique=True)
    proficiency: Mapped[int] = mapped_column(Integer)
    hsk_old_level: Mapped[Optional[int]] = mapped_column(Integer)
    hsk_new_level: Mapped[Optional[int]] = mapped_column(Integer)
    pinyin: Mapped[Optional[str]] = mapped_column(String(64))
    translation: Mapped[Optional[str]] = mapped_column(String(64))
    saved: Mapped[bool] = mapped_column(Boolean, default=False)

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
    title: Mapped[str] = mapped_column(String(255))
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

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    word: Mapped[str] = mapped_column(String(32), ForeignKey(Word.text), unique=True)
    state: Mapped[int] = mapped_column(Integer, default=1)
    step: Mapped[int] = mapped_column(Integer, default=0)
    stability: Mapped[Optional[float]] = mapped_column(Float)
    difficulty: Mapped[Optional[float]] = mapped_column(Float)
    due: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_review: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True))

    def to_dict(self):
        return {
            'id': self.id,
            'state': self.state,
            'step': self.step,
            'stability': self.stability,
            'difficulty': self.difficulty,
            'due': self.due,
            'last_review': self.last_review
        }

    def __repr__(self):
        return f'Word: {self.word}, due: {self.due}'