from dotenv import load_dotenv
from flask import Flask


def create_app():
    load_dotenv()
    
    app = Flask(__name__)

    from config import Config
    app.config.from_object(Config)
    
    from .extensions import db, migrate, jwt
    db.init_app(app)
    migrate.init_app(app)
    jwt.init_app(app)

    from .modules.pages import pages_bp
    from .modules.auth.routes import auth_bp
    from .modules.words.routes import words_bp
    from .modules.videos.routes import videos_bp
    from .modules.spaced_repetition.routes import srs_bp
    app.register_blueprint(pages_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(words_bp)
    app.register_blueprint(videos_bp)
    app.register_blueprint(srs_bp)
    
    return app