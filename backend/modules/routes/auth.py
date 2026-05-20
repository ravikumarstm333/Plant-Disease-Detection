from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
import bcrypt
import re

from database import db
from modules.security import ROLE_BUYER, ROLE_FARMER, ROLE_MANAGER, ROLE_ADMIN, is_env_admin


auth_bp = Blueprint("auth", __name__)

ADMIN_EMAIL = "ravikumarstm333@gmail.com"
ADMIN_HARDCODED_PASSWORD = "@Ravi843331"


def hash_password(password):
    if isinstance(password, str):
        password = password.encode("utf-8")
    return bcrypt.hashpw(password, bcrypt.gensalt())


def check_password(password, hashed):
    if isinstance(password, str):
        password = password.encode("utf-8")
    if isinstance(hashed, str):
        hashed = hashed.encode("utf-8")
    return bcrypt.checkpw(password, hashed)


def validate_email(email):
    return re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email) is not None


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    required = ["name", "email", "password", "role", "location", "phone"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    role = data["role"].strip().lower()
    if role not in [ROLE_FARMER, ROLE_BUYER]:
        return jsonify({"error": "Only farmer and buyer can self-register"}), 403

    email = data["email"].strip().lower()
    if not validate_email(email):
        return jsonify({"error": "Invalid email format"}), 400
    if db.find_user_by_email(email):
        return jsonify({"error": "User with this email already exists"}), 409

    password = data["password"]
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    user = {
        "name": data["name"].strip(),
        "email": email,
        "password": hash_password(password),
        "role": role,
        "location": data["location"].strip(),
        "phone": data["phone"].strip(),
        "is_active": True,
    }
    result = db.create_user(user)
    return jsonify({"message": "User registered successfully", "user_id": str(result.inserted_id)}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = db.find_user_by_email(email)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    is_admin_override = email == ADMIN_EMAIL and password == ADMIN_HARDCODED_PASSWORD
    if not is_admin_override and not check_password(password, user.get("password")):
        return jsonify({"error": "Invalid email or password"}), 401

    # Manager accounts can only be created by admin and must be active
    if user.get("role") == ROLE_MANAGER and not user.get("is_active", False):
        return jsonify({"error": "Manager account not active"}), 403

    role = ROLE_ADMIN if is_env_admin(user) else user.get("role")
    token = create_access_token(identity=str(user["_id"]), additional_claims={"role": role})

    return jsonify(
        {
            "message": "Login successful",
            "access_token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": role,
                "location": user.get("location", ""),
                "phone": user.get("phone", ""),
            },
        }
    ), 200


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    from modules.security import get_current_user, normalize_user_role

    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(
        {
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": normalize_user_role(user),
                "location": user.get("location", ""),
                "phone": user.get("phone", ""),
                "created_at": user.get("created_at"),
            }
        }
    ), 200
