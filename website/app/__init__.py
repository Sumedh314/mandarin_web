from flask import Flask


def create_app():
    app = Flask(__name__)

    from config import Config
    app.config.from_object(Config)
    
    from .extensions import db, migrate, jwt
    db.init_app(app)
    migrate.init_app(app)
    jwt.init_app(app)

    from .modules.pages import pages_bp
    from .modules.auth.routes import auth_bp
    app.register_blueprint(pages_bp)
    app.register_blueprint(auth_bp)
    
    from .modules.words.routes import words_bp
    from .modules.sentences.routes import sentences_bp
    from .modules.videos.routes import videos_bp
    from .modules.transcripts.routes import transcripts_bp
    from .modules.flashcards.routes import flashcards_bp
    from .modules.language_processing.routes import language_bp
    app.register_blueprint(words_bp)
    app.register_blueprint(sentences_bp)
    app.register_blueprint(videos_bp)
    app.register_blueprint(transcripts_bp)
    app.register_blueprint(flashcards_bp)
    app.register_blueprint(language_bp)
    
    return app