from flask import Flask


def create_app():
    app = Flask(__name__)

    from config import DatabaseConfig
    app.config.from_object(DatabaseConfig)
    
    from .extensions import db, migrate
    db.init_app(app)
    migrate.init_app(app)

    from .old_routes.language_processing import language_bp
    from .old_routes.user_data import user_data_bp
    from .routes import main_bp
    app.register_blueprint(language_bp)
    app.register_blueprint(user_data_bp)
    app.register_blueprint(main_bp)
    
    return app