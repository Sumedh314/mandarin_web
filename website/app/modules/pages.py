from flask import Blueprint, render_template, redirect, url_for
from flask_jwt_extended import jwt_required


pages_bp = Blueprint('pages', __name__)


@pages_bp.get('/')
def redirect_to_learn():
    """Redirect user to learn page if no path"""
    return redirect(url_for('pages.learn'))


@pages_bp.get('/learn')
@jwt_required()
def learn():
    """Home page for site"""
    return render_template('learn.html')


@pages_bp.get('/words')
@jwt_required()
def words():
    """Page to show user's data related to words"""
    return render_template('words.html')