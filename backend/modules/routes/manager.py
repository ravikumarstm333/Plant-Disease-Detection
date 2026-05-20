from flask import Blueprint, jsonify

from database import db
from modules.security import ROLE_ADMIN, ROLE_MANAGER, role_required


manager_bp = Blueprint("manager", __name__)


@manager_bp.route("/activity", methods=["GET"])
@role_required(ROLE_MANAGER, ROLE_ADMIN)
def activity():
    summary = db.get_platform_activity_summary()
    return jsonify(summary), 200
