from flask import Flask
from app.routes.language_processing import language_bp
from app.routes.user_data import user_data_bp


def create_app():
    app = Flask(__name__)

    app.register_blueprint(language_bp)
    app.register_blueprint(user_data_bp)

    return app