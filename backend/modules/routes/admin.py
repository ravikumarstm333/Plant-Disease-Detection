from flask import Blueprint, request, jsonify
import bcrypt

from database import db
from modules.security import ROLE_ADMIN, ROLE_MANAGER, role_required, get_current_user


admin_bp = Blueprint("admin", __name__)


def hash_password(password):
    if isinstance(password, str):
        password = password.encode("utf-8")
    return bcrypt.hashpw(password, bcrypt.gensalt())


@admin_bp.route("/managers", methods=["POST"])
@role_required(ROLE_ADMIN)
def create_manager():
    data = request.get_json() or {}
    required = ["name", "email", "password", "location", "phone"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    email = data["email"].strip().lower()
    if db.find_user_by_email(email):
        return jsonify({"error": "User with this email already exists"}), 409

    admin_user = get_current_user()
    manager = {
        "name": data["name"].strip(),
        "email": email,
        "password": hash_password(data["password"]),
        "role": ROLE_MANAGER,
        "location": data["location"].strip(),
        "phone": data["phone"].strip(),
        "is_active": True,
        "created_by": str(admin_user["_id"]),
    }
    result = db.create_user(manager)
    return jsonify({"message": "Manager created successfully", "manager_id": str(result.inserted_id)}), 201
