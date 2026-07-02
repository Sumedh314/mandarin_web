from flask import Flask


def create_app():
    app = Flask(__name__)

    from config import DatabaseConfig
    app.config.from_object(DatabaseConfig)
    
    from .extensions import db, migrate
    db.init_app(app)
    migrate.init_app(app)

    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    return app