from flask import Blueprint, render_template, redirect, url_for
from flask_jwt_extended import jwt_required


pages_bp = Blueprint('pages', __name__)


@pages_bp.get('/')
def redirect_to_index():
    """Redirect user to index page if no path"""
    return redirect(url_for('pages.index'))


@pages_bp.get('/index')
@jwt_required()
def index():
    """Home page for site"""
    return render_template('index.html')


@pages_bp.get('/words')
@jwt_required()
def words():
    """Page to show user's data related to words"""
    return render_template('words.html')