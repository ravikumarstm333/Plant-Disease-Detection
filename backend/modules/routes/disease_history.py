from flask import Blueprint, jsonify
from modules.security import ROLE_ADMIN, ROLE_BUYER, ROLE_FARMER, ROLE_MANAGER, get_current_user, role_required
from database import db


history_bp = Blueprint("history", __name__)


@history_bp.route("", methods=["GET"])
@role_required(ROLE_FARMER, ROLE_BUYER, ROLE_MANAGER, ROLE_ADMIN)
def get_history():
    user = get_current_user()
    role = user.get("role")
    if role in [ROLE_MANAGER, ROLE_ADMIN]:
        history = db.get_all_disease_history()
    else:
        history = db.get_user_disease_history(str(user["_id"]))
    return jsonify({"history": history}), 200
