from flask import Flask
from flask_login import LoginManager, UserMixin


def create_app():
    app = Flask(__name__)

    from config import Config
    app.config.from_object(Config)
    
    from .extensions import db, migrate
    db.init_app(app)
    migrate.init_app(app)

    from .routes.pages import pages_bp
    app.register_blueprint(pages_bp)
    
    from .routes.api.words import words_bp
    from .routes.api.sentences import sentences_bp
    from .routes.api.videos import videos_bp
    from .routes.api.transcripts import transcripts_bp
    from .routes.api.flashcards import flashcards_bp
    from .routes.api.language_processing import language_bp
    app.register_blueprint(words_bp)
    app.register_blueprint(sentences_bp)
    app.register_blueprint(videos_bp)
    app.register_blueprint(transcripts_bp)
    app.register_blueprint(flashcards_bp)
    app.register_blueprint(language_bp)

    # login = LoginManager(app)
    
    return app