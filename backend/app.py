from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from otp_routes import otp_bp

import os
import numpy as np
import base64
from werkzeug.utils import secure_filename

# your modules
from predict import predict_disease
from disease_info import disease_info

from auth import auth_bp
from market import market_bp
from database import db


# ---------------- APP INIT ----------------
load_dotenv() # Load environment variables from .env

app = Flask(__name__)
CORS(app)

# JWT config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
jwt = JWTManager(app)


# ---------------- REGISTER ROUTES ----------------
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(market_bp, url_prefix="/market")

app.register_blueprint(otp_bp, url_prefix="/auth")



# ---------------- UPLOAD CONFIG ----------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ---------------- MONGODB STATUS CHECK ----------------
@app.route("/db-status")
def db_status():
    try:
        db.client.admin.command("ping")
        return jsonify({
            "status": "success",
            "mongodb": "connected"
        })
    except Exception as e:
        return jsonify({
            "status": "failed",
            "mongodb": "not connected",
            "error": str(e)
        }), 500



# ---------------- HOME ----------------
@app.route("/")
def home():
    return jsonify({
        "message": "Plant Disease AI API Running",
        "status": "ok",
        "routes": [
            "/auth",
            "/market",
            "/predict",
            "/chat",
            "/history",
            "/db-status"
        ]
    })

# ================= PREDICT =================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image"}), 400

        file = request.files["image"]

        if file.filename == "" or not allowed_file(file.filename):
            return jsonify({"error": "Invalid file"}), 400

        path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
        file.save(path)

        result = predict_disease(path)

        if result["status"] == "error":
            return jsonify(result), 500

        if result["status"] == "rejected":
            return jsonify(result), 200

        info = disease_info.get(result["disease"], {})

        with open(path, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode()

        os.remove(path)

        return jsonify({
            "status": "success",
            "disease": result["disease"],
            "confidence": result["confidence"],
            "treatment": info.get("treatment", ""),
            "fertilizer": info.get("fertilizer", ""),
            "image": img_base64
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= AUTH PREDICT =================
@app.route("/predict/auth", methods=["POST"])
@jwt_required()
def predict_auth():
    try:
        user_id = get_jwt_identity()

        if "image" not in request.files:
            return jsonify({"error": "No image"}), 400

        file = request.files["image"]

        path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
        file.save(path)

        result = predict_disease(path)

        if result["status"] == "error":
            return jsonify(result), 500

        if result["status"] == "rejected":
            return jsonify(result), 200

        info = disease_info.get(result["disease"], {})

        with open(path, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode()

        os.remove(path)

        db.save_disease_history({
            "userId": user_id,
            "disease": result["disease"],
            "confidence": result["confidence"],
            "image": img_base64
        })

        return jsonify({
            "status": "success",
            "disease": result["disease"],
            "confidence": result["confidence"],
            "treatment": info.get("treatment", "")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ---------------- HISTORY ----------------
@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    try:
        user_id = get_jwt_identity()
        data = db.get_user_disease_history(user_id)

        for item in data:
            item["_id"] = str(item["_id"])

        return jsonify({"history": data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- CHAT ----------------
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        question = data.get("question")
        disease = data.get("disease")

        info = disease_info.get(disease, {})

        return jsonify({
            "answer": f"Processed question: {question}",
            "disease": disease,
            "treatment": info.get("treatment", ""),
            "fertilizer": info.get("fertilizer", "")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- DISEASE INFO ----------------
@app.route("/diseaseInfo")
def disease_info_api():
    return jsonify(disease_info)


# ---------------- START SERVER ----------------
if __name__ == "__main__":
    try:
        db.client.admin.command("ping")
        print("✅ MongoDB Connected Successfully")
    except Exception as e:
        print("❌ MongoDB Connection Failed:", e)

    app.run(host="0.0.0.0", port=7860)