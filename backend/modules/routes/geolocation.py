from flask import Blueprint, jsonify, request

from database import db


geolocation_bp = Blueprint("geolocation", __name__)
INDIA_BOUNDS = {
    "min_lat": 6.4626999,
    "max_lat": 35.513327,
    "min_lon": 68.1097,
    "max_lon": 97.395561,
}


@geolocation_bp.route("/nearby-listings", methods=["GET"])
def nearby_listings():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        range_km = float(request.args.get("rangeKm", 10))
    except (TypeError, ValueError):
        return jsonify({"error": "lat, lon and numeric rangeKm are required"}), 400

    if range_km <= 0:
        return jsonify({"error": "rangeKm must be > 0"}), 400
    if not (INDIA_BOUNDS["min_lat"] <= lat <= INDIA_BOUNDS["max_lat"] and INDIA_BOUNDS["min_lon"] <= lon <= INDIA_BOUNDS["max_lon"]):
        return jsonify({"error": "Buyer location must be inside India"}), 400

    listings = db.get_nearby_listings(
        lat=lat,
        lon=lon,
        max_distance_meters=int(range_km * 1000),
    )
    return jsonify({"listings": listings, "radius_km": range_km}), 200
