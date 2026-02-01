from flask import Blueprint, jsonify
from flask_wtf.csrf import generate_csrf

bp = Blueprint('csrf', __name__, url_prefix='/api')

@bp.route('/csrf-token', methods=['GET'])
def get_csrf_token():
    """
    Return a CSRF token for the frontend to use in subsequent state-changing requests.
    """
    token = generate_csrf()
    return jsonify({'csrf_token': token})
