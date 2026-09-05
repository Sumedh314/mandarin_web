from __future__ import annotations
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, UniqueConstraint, DateTime

from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'ID: {self.id}, username: {self.username}'


class Word(db.Model):
    __tablename__ = "words"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(unique=True)
    radical: Mapped[str | None]
    hsk_old_level: Mapped[int | None]
    hsk_new_level: Mapped[int | None]
    frequency: Mapped[int | None]
    parts_of_speech: Mapped[str | None]

    forms: Mapped[list[WordForm]] = relationship(back_populates="word")

    def __repr__(self):
        return f'Word: {self.text}'


class WordForm(db.Model):
    __tablename__ = "word_forms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    traditional: Mapped[str | None]
    pinyin: Mapped[str | None]
    bopomofo: Mapped[str | None]
    translations: Mapped[str | None]
    classifiers: Mapped[str | None]

    word_id: Mapped[int] = mapped_column(
        ForeignKey(Word.id, ondelete='CASCADE'),
        index=True
    )

    word: Mapped[Word] = relationship(back_populates="forms")

    def __repr__(self):
        return (
            f'Traditional: {self.traditional}, '
            f'Pinyin: {self.pinyin}, '
            f'Translations: {self.translations}'
        )


class LearningWord(db.Model):
    __tablename__ = "learning_words"
    __table_args__ = (UniqueConstraint("user_id", "word_id", name="uq_user_word"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    proficiency: Mapped[int] = mapped_column(default=0, index=True)
    saved: Mapped[bool] = mapped_column(default=False)

    user_id: Mapped[int] = mapped_column(
        ForeignKey(User.id, ondelete='CASCADE'),
        index=True
    )
    word_id: Mapped[int] = mapped_column(
        ForeignKey(Word.id, ondelete='CASCADE'),
        index=True
    )

    user: Mapped[User] = relationship()
    original_word: Mapped[Word] = relationship()
    sentences: Mapped[list[Sentence]] = relationship(
        back_populates="learning_word"
    )
    flashcard: Mapped[Flashcard | None] = relationship(
        back_populates="learning_word"
    )

    def __repr__(self):
        return f'User ID: {self.user_id}, word ID: {self.word_id}'


class Sentence(db.Model):
    __tablename__ = "sentences"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str]
    times_used: Mapped[int] = mapped_column(default=0)

    learning_word_id: Mapped[int] = mapped_column(
        ForeignKey(LearningWord.id, ondelete='CASCADE'),
        index=True
    )

    learning_word: Mapped[LearningWord] = relationship(back_populates="sentences")

    def __repr__(self):
        return f'Sentence: {self.text}, word ID: {self.learning_word_id}'


class Flashcard(db.Model):
    __tablename__ = "flashcards"

    learning_word_id: Mapped[int] = mapped_column(
        ForeignKey(LearningWord.id, ondelete='CASCADE'),
        primary_key=True
    )
    state: Mapped[int] = mapped_column(default=1)
    step: Mapped[int | None]
    stability: Mapped[float | None]
    difficulty: Mapped[float | None]
    due: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    last_review: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    learning_word: Mapped[LearningWord] = relationship(back_populates="flashcard")

    def to_dict(self):
        return {
            'learning_word_id': self.learning_word_id,
            'state': self.state,
            'step': self.step,
            'stability': self.stability,
            'difficulty': self.difficulty,
            'due': self.due.isoformat(),
            'last_review': self.last_review.isoformat() if self.last_review else None,
        }

    def __repr__(self):
        return (
            f'User: {self.learning_word.user.username}, '
            f'word: {self.learning_word.original_word.text}, '
            f'due: {self.due}'
        )


class Video(db.Model):
    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(String(11), primary_key=True)
    title: Mapped[str | None]

    transcript_lines: Mapped[list[TranscriptLine]] = relationship(back_populates="video")

    def __repr__(self):
        return f'Video ID: {self.id}, title: {self.title}'


class UserVideo(db.Model):
    __tablename__ = "user_videos"

    user_id: Mapped[int] = mapped_column(
        ForeignKey(User.id, ondelete='CASCADE'),
        primary_key=True
    )
    video_id: Mapped[str] = mapped_column(
        String(11),
        ForeignKey(Video.id, ondelete='CASCADE'),
        primary_key=True
    )
    last_index: Mapped[int] = mapped_column(default=-1)

    user: Mapped[User] = relationship()
    video: Mapped[Video] = relationship()

    def __repr__(self):
        return f'Video ID: {self.video_id}, last_index: {self.last_index}'


class TranscriptLine(db.Model):
    __tablename__ = "transcript_lines"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str]
    start: Mapped[float]
    duration: Mapped[float]

    video_id: Mapped[str] = mapped_column(
        String(11),
        ForeignKey(Video.id, ondelete='CASCADE'),
        index=True
    )
    
    video: Mapped[Video] = relationship(back_populates="transcript_lines")

    def to_dict(self):
        return {
            'text': self.text,
            'start': self.start,
            'duration': self.duration
        }

    def __repr__(self):
        return f'Text: {self.text}, video_id: {self.video_id}, start: {self.start}'