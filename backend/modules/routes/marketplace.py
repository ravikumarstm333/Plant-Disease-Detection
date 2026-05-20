import os
import uuid
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from database import db
from modules.security import ROLE_ADMIN, ROLE_FARMER, ROLE_MANAGER, get_current_user, role_required


marketplace_bp = Blueprint("marketplace", __name__)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
INDIA_BOUNDS = {
    "min_lat": 6.4626999,
    "max_lat": 35.513327,
    "min_lon": 68.1097,
    "max_lon": 97.395561,
}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _inside_india(lat, lon):
    return (
        INDIA_BOUNDS["min_lat"] <= lat <= INDIA_BOUNDS["max_lat"]
        and INDIA_BOUNDS["min_lon"] <= lon <= INDIA_BOUNDS["max_lon"]
    )


@marketplace_bp.route("/listings", methods=["POST"])
@role_required(ROLE_FARMER)
def create_listing():
    user = get_current_user()
    payload = dict(request.form) if request.form else (request.get_json() or {})
    required = ["vegetableName", "pricePerKg", "quantityKg", "lat", "lon", "location", "description"]
    for field in required:
        if field not in payload:
            return jsonify({"error": f"{field} is required"}), 400

    image_url = payload.get("imageUrl", "")
    if "image" in request.files:
        image = request.files["image"]
        if image.filename and _allowed(image.filename):
            filename = f"{uuid.uuid4()}-{secure_filename(image.filename)}"
            image.save(os.path.join(UPLOAD_FOLDER, filename))
            image_url = f"/uploads/{filename}"

    lat = float(payload["lat"])
    lon = float(payload["lon"])
    if not _inside_india(lat, lon):
        return jsonify({"error": "Location must be inside India"}), 400

    listing = {
        "farmerId": str(user["_id"]),
        "farmerName": user["name"],
        "vegetableName": payload["vegetableName"].strip(),
        "quantityKg": float(payload["quantityKg"]),
        "pricePerKg": float(payload["pricePerKg"]),
        "imageUrl": image_url,
        "locationName": payload["location"].strip(),
        "description": payload["description"].strip(),
        "location": {"type": "Point", "coordinates": [lon, lat]},
        "status": "active",
    }
    result = db.create_listing(listing)
    return jsonify({"message": "Listing created", "listing_id": str(result.inserted_id)}), 201


@marketplace_bp.route("/listings/my", methods=["GET"])
@role_required(ROLE_FARMER)
def my_listings():
    user = get_current_user()
    listings = db.get_listings_by_farmer(str(user["_id"]))
    return jsonify({"listings": listings}), 200


@marketplace_bp.route("/listings", methods=["GET"])
@jwt_required(optional=True)
def get_listings():
    listings = db.get_active_listings()
    return jsonify({"listings": listings}), 200


@marketplace_bp.route("/listings/<listing_id>", methods=["PUT"])
@role_required(ROLE_FARMER, ROLE_MANAGER, ROLE_ADMIN)
def update_listing(listing_id):
    user = get_current_user()
    data = request.get_json() or {}
    listing = db.get_listing_by_id(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404

    # Farmer can update only own listing
    if user.get("role") == ROLE_FARMER and listing.get("farmerId") != str(user["_id"]):
        return jsonify({"error": "Forbidden"}), 403

    allowed = ["quantityKg", "pricePerKg", "description", "status"]
    patch = {k: data[k] for k in allowed if k in data}
    db.update_listing(listing_id, patch)
    return jsonify({"message": "Listing updated"}), 200


@marketplace_bp.route("/listings/<listing_id>", methods=["DELETE"])
@role_required(ROLE_FARMER, ROLE_MANAGER, ROLE_ADMIN)
def delete_listing(listing_id):
    user = get_current_user()
    listing = db.get_listing_by_id(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
    if user.get("role") == ROLE_FARMER and listing.get("farmerId") != str(user["_id"]):
        return jsonify({"error": "Forbidden"}), 403

    db.delete_listing(listing_id)
    return jsonify({"message": "Listing deleted"}), 200
