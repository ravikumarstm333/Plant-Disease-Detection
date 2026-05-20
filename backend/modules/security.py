import os
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from database import db


ROLE_ADMIN = "admin"
ROLE_MANAGER = "manager"
ROLE_FARMER = "farmer"
ROLE_BUYER = "buyer"


def get_admin_email():
    return (os.getenv("GMAIL_USER") or "").strip().lower()


def get_current_user():
    user_id = get_jwt_identity()
    if not user_id:
        return None
    return db.find_user_by_id(user_id)


def is_env_admin(user):
    if not user:
        return False
    return user.get("email", "").strip().lower() == get_admin_email()


def normalize_user_role(user):
    if not user:
        return None
    if is_env_admin(user):
        return ROLE_ADMIN
    return user.get("role")


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({"error": "User not found"}), 404

            current_role = normalize_user_role(user)
            if current_role not in roles:
                return jsonify({"error": "Forbidden"}), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator
