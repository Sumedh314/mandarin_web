from flask import Blueprint, render_template


pages_bp = Blueprint('pages', __name__)


@pages_bp.route('/')
def home():
    """Home page for site"""
    return render_template('index.html')


@pages_bp.route('/words')
def words():
    """Page to show user's data related to words"""
    return render_template('words.html')