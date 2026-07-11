from typing import Optional

from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Float, Boolean, ForeignKey

from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    first_name: Mapped[Optional[str]] = mapped_column(String(64))
    last_name: Mapped[Optional[str]] = mapped_column(String(64))
    words: Mapped[list["UserWord"]] = relationship(back_populates="user")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'Username: {self.username}, Name: {self.first_name} {self.last_name}, ID: {self.id}'


class Word(db.Model):
    __tablename__ = "words"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(32), unique=True)
    pinyin: Mapped[Optional[str]] = mapped_column(String(64))
    translation: Mapped[Optional[str]] = mapped_column(String(64))
    hsk_old_level: Mapped[Optional[int]] = mapped_column(Integer)
    hsk_new_level: Mapped[Optional[int]] = mapped_column(Integer)

    def __repr__(self):
        return f'Word: {self.text}'


class UserWord(db.Model):
    __tablename__ = "user_words"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey(User.id))
    proficiency: Mapped[int] = mapped_column(Integer, default=0)
    translation: Mapped[Optional[str]] = mapped_column(String(64))
    saved: Mapped[bool] = mapped_column(Boolean, default=False)
    sentences: Mapped[Optional[list["Sentence"]]] = relationship(back_populates="target_word")
    flashcard: Mapped[Optional["Flashcard"]] = relationship(back_populates="word")
    user: Mapped[list["User"]] = relationship(back_populates="words")


class Sentence(db.Model):
    __tablename__ = "sentences"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(255))
    times_used: Mapped[int] = mapped_column(Integer, default=0)
    word_id: Mapped[int] = mapped_column(Integer, ForeignKey(UserWord.id))
    target_word: Mapped["UserWord"] = relationship(back_populates="sentences")

    def __repr__(self):
        return f'Sentence: {self.text}, word_id: {self.word_id}'


class Video(db.Model):
    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(primary_key=True)
    title: Mapped[Optional[str]] = mapped_column(String(255))
    last_index: Mapped[int] = mapped_column(Integer, default=-1)
    transcript: Mapped[list["TranscriptLine"]] = relationship(back_populates="video")

    def __repr__(self):
        return f'Video ID: {self.id}, title: {self.title}, last index: {self.last_index}'


class TranscriptLine(db.Model):
    __tablename__ = "transcript_lines"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    video_id: Mapped[str] = mapped_column(String(64), ForeignKey(Video.id), index=True)
    text: Mapped[str] = mapped_column(String(1024))
    start: Mapped[float] = mapped_column(Float)
    duration: Mapped[float] = mapped_column(Float)
    video: Mapped["Video"] = relationship(back_populates="transcript")

    def __repr__(self):
        return f'Text: {self.text}, video_id: {self.video_id}, start: {self.start}'


class Flashcard(db.Model):
    __tablename__ = "flashcards"

    card_id: Mapped[int] = mapped_column(primary_key=True)
    word_id: Mapped[str] = mapped_column(String(32), ForeignKey(UserWord.id), unique=True)
    state: Mapped[int] = mapped_column(Integer, default=1)
    step: Mapped[Optional[int]] = mapped_column(Integer)
    stability: Mapped[Optional[float]] = mapped_column(Float)
    difficulty: Mapped[Optional[float]] = mapped_column(Float)
    due: Mapped[str] = mapped_column(String(64))
    last_review: Mapped[Optional[str]] = mapped_column(String(64))
    word: Mapped["UserWord"] = relationship(back_populates="flashcard")

    def to_dict(self):
        return {
            'card_id': self.card_id,
            'word_id': self.word_id,
            'state': self.state,
            'step': self.step,
            'stability': self.stability,
            'difficulty': self.difficulty,
            'due': self.due,
            'last_review': self.last_review
        }

    def __repr__(self):
        return f'Word: {self.word_id}, due: {self.due}'