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
    
    words: Mapped[list["UserWord"]] = relationship(back_populates="user")
    videos: Mapped[list["UserVideo"]] = relationship(back_populates="user")
    flashcards: Mapped[list["Flashcard"]] = relationship(back_populates="user")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'Username: {self.username}, ID: {self.id}'


class DictionaryWord(db.Model):
    __tablename__ = "dictionary_words"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(32), unique=True)
    radical: Mapped[str] = mapped_column(String(32))
    hsk_old_level: Mapped[Optional[int]] = mapped_column(Integer)
    hsk_new_level: Mapped[Optional[int]] = mapped_column(Integer)
    frequency: Mapped[int] = mapped_column(Integer)
    parts_of_speech: Mapped[str] = mapped_column(String(64))

    forms: Mapped[list["WordForm"]] = relationship(back_populates="dictionary_word")

    def __repr__(self):
        return f'Word: {self.text}'


class UserWord(db.Model):
    __tablename__ = "user_words"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(32))
    proficiency: Mapped[int] = mapped_column(Integer, default=0)
    saved: Mapped[bool] = mapped_column(Boolean, default=False)

    dictionary_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("dictionary_words.id")
    )
    flashcard_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("flashcards.id"),
        unique=True
    )
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    user: Mapped["User"] = relationship(back_populates="words")
    forms: Mapped[list["WordForm"]] = relationship(back_populates="user_word")
    flashcard: Mapped[Optional["Flashcard"]] = relationship(back_populates="word")
    sentences: Mapped[Optional[list["Sentence"]]] = relationship(
        back_populates="target_word"
    )

    def __repr__(self):
        return f'Word: {self.text}'


class WordForm(db.Model):
    __tablename__ = "dictionary_word_forms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    traditional: Mapped[str] = mapped_column(String(32))
    pinyin: Mapped[str] = mapped_column(String(64))
    bopomofo: Mapped[str] = mapped_column(String(64))
    translations: Mapped[str] = mapped_column(String(255))
    classifiers: Mapped[Optional[str]] = mapped_column(String(32))

    dictionary_word_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("dictionary_words.id")
    )
    user_word_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("user_words.id")
    )

    dictionary_word: Mapped["DictionaryWord"] = relationship(back_populates="forms")
    user_word: Mapped["UserWord"] = relationship(back_populates="forms")

    def __repr__(self):
        return (
            f'Word: {self.dictionary_word}, '
            f'Pinyin: {self.pinyin}, '
            f'Translations: {self.translations}'
        )


class Sentence(db.Model):
    __tablename__ = "sentences"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(255))
    times_used: Mapped[int] = mapped_column(Integer, default=0)

    word_id: Mapped[int] = mapped_column(Integer, ForeignKey("words.id"))

    target_word: Mapped["UserWord"] = relationship(back_populates="sentences")

    def __repr__(self):
        return f'Sentence: {self.text}, word_id: {self.word_id}'


class Video(db.Model):
    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(String(11), primary_key=True)
    title: Mapped[Optional[str]] = mapped_column(String(255))

    transcript: Mapped[list["TranscriptLine"]] = relationship(back_populates="video")

    def __repr__(self):
        return f'Video ID: {self.id}, title: {self.title}'


class UserVideo(db.Model):
    __tablename__ = "user_video"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    last_index: Mapped[int] = mapped_column(Integer, default=-1)

    video_id: Mapped[str] = mapped_column(String(11), ForeignKey("videos.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    user: Mapped["User"] = relationship(back_populates="videos")

    def __repr__(self):
        return f'Video ID: {self.video_id}, last_index: {self.last_index}'


class TranscriptLine(db.Model):
    __tablename__ = "transcript_lines"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String(1024))
    start: Mapped[float] = mapped_column(Float)
    duration: Mapped[float] = mapped_column(Float)

    video_id: Mapped[str] = mapped_column(
        String(11),
        ForeignKey("videos.id"),
        index=True
    )
    
    video: Mapped["Video"] = relationship(back_populates="transcript")

    def __repr__(self):
        return f'Text: {self.text}, video_id: {self.video_id}, start: {self.start}'


class Flashcard(db.Model):
    __tablename__ = "flashcards"

    card_id: Mapped[int] = mapped_column(primary_key=True)
    state: Mapped[int] = mapped_column(Integer, default=1)
    step: Mapped[Optional[int]] = mapped_column(Integer)
    stability: Mapped[Optional[float]] = mapped_column(Float)
    difficulty: Mapped[Optional[float]] = mapped_column(Float)
    due: Mapped[str] = mapped_column(String(64))
    last_review: Mapped[Optional[str]] = mapped_column(String(64))

    word_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("user_words.id"),
        unique=True
    )
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    word: Mapped["UserWord"] = relationship(back_populates="flashcard")
    user: Mapped["User"] = relationship(back_populates="flashcards")

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