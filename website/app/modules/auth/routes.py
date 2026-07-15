from typing import cast

from flask import (
    Blueprint,
    request,
    jsonify,
    render_template,
    redirect,
    url_for,
    make_response
)
from flask_jwt_extended import (
    current_user,
    jwt_required,
    get_jwt_identity,
    create_access_token,
    set_access_cookies,
    unset_access_cookies
)

from app.models import User
import app.modules.auth.service as service
import app.modules.auth.repository as repository
from app.extensions import db, jwt


current_user = cast(User, current_user)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Page to register a new user"""
    if request.method == 'POST':
        data: dict = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = repository.get_user_by_username(db.session, username)
        if user is not None:
            return jsonify("Username already exists"), 401
        
        user = service.create_user(
            db.session,
            username=username,
            password=password
        )
        response = jsonify(
            {'msg': 'User created',
             'url': url_for('auth.login')}
        )

        return response, 201
    
    return render_template('auth/register.html')


@auth_bp.route('/login', methods=['GET', 'POST'])
@jwt_required(optional=True)
def login():
    """Login page"""
    if get_jwt_identity() is not None:
        return redirect(url_for('pages.learn'))
    if request.method == 'POST':
        data: dict = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = repository.get_user_by_username(db.session, username)
        if not user or not user.check_password(password):
            return jsonify("Incorrect username or password"), 401

        access_token = create_access_token(identity=user)
        response = jsonify({'url': url_for('pages.learn')})
        set_access_cookies(response, access_token)

        return response, 200

    return render_template('auth/login.html')


@auth_bp.get('/logout')
def logout():
    """Log user out"""
    response = make_response(redirect(url_for('auth.login')))
    unset_access_cookies(response)
    return response


@jwt.user_identity_loader
def user_identity_lookup(user: User):
    return str(user.id)


@jwt.user_lookup_loader
def user_lookup_callback(_, jwt_data):
    id = int(jwt_data['sub'])
    return repository.get_user_by_id(db.session, id)


@jwt.expired_token_loader
def expired_token(_jwt_header, jwt_payload):
    print(_jwt_header, jwt_payload)
    response = redirect(url_for('auth.login'))
    unset_access_cookies(response)
    return response


@jwt.unauthorized_loader
def unauthorized(msg: str):
    print(msg)
    response = redirect(url_for('auth.login'))
    unset_access_cookies(response)
    return response