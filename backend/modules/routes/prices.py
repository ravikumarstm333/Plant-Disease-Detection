from flask import Blueprint, jsonify, request

from database import db
from modules.security import ROLE_ADMIN, ROLE_MANAGER, get_current_user, role_required


prices_bp = Blueprint("prices", __name__)


def _to_market_key(lat, lon):
    return f"{round(float(lat), 4)},{round(float(lon), 4)}"


@prices_bp.route("", methods=["GET"])
def get_prices():
    prices = db.get_market_prices()
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if lat is not None and lon is not None:
        try:
            market_key = _to_market_key(lat, lon)
            prices = [p for p in prices if p.get("marketKey") == market_key]
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid lat/lon"}), 400
    return jsonify({"prices": prices}), 200


@prices_bp.route("", methods=["POST"])
@role_required(ROLE_MANAGER, ROLE_ADMIN)
def upsert_price():
    user = get_current_user()
    data = request.get_json() or {}
    if "vegetableName" not in data:
        return jsonify({"error": "vegetableName is required"}), 400

    # Support both legacy `price` and canonical `pricePerKg` from clients.
    raw_price = data.get("pricePerKg", data.get("price"))
    if raw_price is None:
        return jsonify({"error": "pricePerKg is required"}), 400

    vegetable_name = str(data["vegetableName"]).strip()
    if not vegetable_name:
        return jsonify({"error": "vegetableName cannot be empty"}), 400

    try:
        price_per_kg = float(raw_price)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid price value"}), 400

    if price_per_kg <= 0:
        return jsonify({"error": "pricePerKg must be greater than 0"}), 400

    lat = data.get("lat")
    lon = data.get("lon")
    market_name = str(data.get("marketName", "")).strip()
    if lat is None or lon is None or not market_name:
        return jsonify({"error": "marketName, lat and lon are required"}), 400

    try:
        market_key = _to_market_key(lat, lon)
        lat = float(lat)
        lon = float(lon)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid lat/lon"}), 400

    db.upsert_market_price(
        {
            "vegetableName": vegetable_name,
            "pricePerKg": price_per_kg,
            "marketName": market_name,
            "marketKey": market_key,
            "location": {"type": "Point", "coordinates": [lon, lat]},
            "updatedBy": str(user["_id"]),
            "updatedByName": user["name"],
        }
    )
    return jsonify({"message": "Market price updated"}), 200
