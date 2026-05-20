import base64
import os
import uuid

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database import db
from disease_info import disease_info
from modules import create_app
from predict import predict_disease
from chatbot.chatbot_new import get_chatbot_response


app = create_app()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/db-status")
def db_status():
    try:
        db.client.admin.command("ping")
        return jsonify({"status": "success", "mongodb": "connected"})
    except Exception as exc:
        return jsonify({"status": "failed", "mongodb": "not connected", "error": str(exc)}), 500


@app.route("/")
def home():
    return jsonify(
        {
            "message": "Plant Disease AI API Running",
            "status": "ok",
            "routes": [
                "/auth",
                "/market",
                "/orders",
                "/prices",
                "/admin",
                "/manager",
                "/geolocation",
                "/predict",
                "/predict/auth",
                "/history",
            ],
        }
    )


@app.route("/config/map", methods=["GET"])
def map_config():
    provider = app.config.get("MAP_PROVIDER", "leaflet_osm")
    return jsonify(
        {
            "provider": provider,
            "tileUrl": app.config.get("MAP_TILE_URL"),
            "attribution": "&copy; OpenStreetMap contributors",
        }
    ), 200


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files["image"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file"}), 400

    filename = f"{uuid.uuid4()}.jpg"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)
    result = predict_disease(path)

    if result["status"] == "error":
        return jsonify(result), 500
    if result["status"] == "rejected":
        os.remove(path)
        return jsonify(result), 200

    info = disease_info.get(result["disease"], {})
    with open(path, "rb") as image_file:
        img_base64 = base64.b64encode(image_file.read()).decode()
    os.remove(path)

    return jsonify(
    {
        "status": "success",
        "disease": result["disease"],
        "confidence": result["confidence"],
        "treatment": info.get("treatment", ""),
        "fertilizer": info.get("fertilizer", ""),
        "fertilizer_links": info.get("fertilizer_links", []),  # ✅ ADD THIS
        "prevention": info.get("prevention", ""),
        "image": img_base64,
    }
)


@app.route("/predict/auth", methods=["POST"])
@jwt_required()
def predict_auth():
    user_id = get_jwt_identity()
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files["image"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file"}), 400

    filename = f"{uuid.uuid4()}.jpg"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)
    result = predict_disease(path)

    if result["status"] == "error":
        return jsonify(result), 500
    if result["status"] == "rejected":
        os.remove(path)
        return jsonify(result), 200

    info = disease_info.get(result["disease"], {})
    with open(path, "rb") as image_file:
        img_base64 = base64.b64encode(image_file.read()).decode()
    os.remove(path)

    db.save_disease_history(
        {
            "userId": user_id,
            "disease": result["disease"],
            "confidence": result["confidence"],
            "treatment": info.get("treatment", ""),
            "fertilizer": info.get("fertilizer", ""),
            "prevention": info.get("prevention", ""),
            "image": img_base64,
        }
    )

    return jsonify(
    {
        "status": "success",
        "disease": result["disease"],
        "confidence": result["confidence"],
        "treatment": info.get("treatment", ""),
        "fertilizer": info.get("fertilizer", ""),
        "fertilizer_links": info.get("fertilizer_links", []),  # ✅ ADD THIS
        "prevention": info.get("prevention", ""),
        "image": img_base64,
    }
)


@app.route("/diseaseInfo")
def disease_info_api():
    return jsonify(disease_info)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    question = data.get("question", "")
    disease = data.get("disease")
    info = disease_info.get(disease, {})
    answer = get_chatbot_response(question=question, disease_name=disease, disease_data=info)

    return jsonify(
        {
            "answer": answer,
            "disease": disease,
            "treatment": info.get("treatment", ""),
            "fertilizer": info.get("fertilizer", ""),
            "prevention": info.get("prevention", ""),
        }
    )


@app.route("/api/chatbot", methods=["POST"])
def api_chatbot():
    data = request.json or {}
    message = data.get("message", "")
    disease_name = data.get("diseaseName")
    disease_data = data.get("diseaseData") or {}

    print("[/api/chatbot] request received", {"message": message, "diseaseName": disease_name})
    try:
        if not disease_data and disease_name:
            disease_data = disease_info.get(disease_name, {})

        reply = get_chatbot_response(
            question=message,
            disease_name=disease_name,
            disease_data=disease_data,
        )
        print("[/api/chatbot] gemini/local success")
    except Exception as exc:
        print("[/api/chatbot] gemini/local failed:", str(exc))
        reply = "Please ask a farming-related question."

    print("[/api/chatbot] final response sent", {"reply": reply[:120]})
    return jsonify({"reply": reply}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)
