from flask import Blueprint, jsonify, request

from database import db
from modules.security import ROLE_ADMIN, ROLE_BUYER, ROLE_FARMER, ROLE_MANAGER, get_current_user, role_required


orders_bp = Blueprint("orders", __name__)


@orders_bp.route("", methods=["POST"])
@role_required(ROLE_BUYER)
def place_order():
    user = get_current_user()
    data = request.get_json() or {}
    for field in ["listingId", "quantityKg"]:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    quantity = float(data["quantityKg"])
    if quantity <= 0:
        return jsonify({"error": "quantityKg must be positive"}), 400

    result = db.purchase_listing_quantity(
        listing_id=data["listingId"],
        buyer_id=str(user["_id"]),
        quantity_kg=quantity,
        buyer_location=data.get("buyerLocation"),
    )
    if not result["ok"]:
        return jsonify({"error": result["error"]}), 400

    return jsonify({"message": "Order placed", "order_id": result["order_id"], "remainingQtyKg": result["remaining"]}), 201


@orders_bp.route("/my", methods=["GET"])
@role_required(ROLE_BUYER, ROLE_FARMER, ROLE_MANAGER, ROLE_ADMIN)
def my_orders():
    user = get_current_user()
    role = user.get("role")
    if role == ROLE_BUYER:
        data = db.get_orders_by_buyer(str(user["_id"]))
    elif role == ROLE_FARMER:
        data = db.get_orders_by_farmer(str(user["_id"]))
    else:
        data = db.get_all_orders()
    return jsonify({"orders": data}), 200
