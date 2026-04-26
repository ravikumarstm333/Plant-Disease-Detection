from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

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
app = Flask(__name__)
CORS(app)

# JWT config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
jwt = JWTManager(app)


# ---------------- REGISTER ROUTES ----------------
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(market_bp, url_prefix="/market")


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


## ---------------- PREDICT IMAGE ----------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({
                "status": "failed",
                "error": "No image uploaded"
            }), 400

        file = request.files["image"]

        if file.filename == "" or not allowed_file(file.filename):
            return jsonify({
                "status": "failed",
                "error": "Invalid file type"
            }), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # AI Prediction
        result = predict_disease(filepath)

        if result["status"] != "success":
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify(result), 500

        disease_name = result["disease"]
        confidence = result["confidence"]

        info = disease_info.get(disease_name, {})

        # Convert image to base64
        with open(filepath, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode("utf-8")

        # Cleanup
        if os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({
            "status": "success",
            "disease": disease_name,
            "confidence": confidence,
            "treatment": info.get("treatment", ""),
            "fertilizer": info.get("fertilizer", ""),
            "fertilizer_links": info.get("fertilizer_links", []),
            "image": img_base64
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500


# ---------------- AUTH PREDICT (SAVE HISTORY) ----------------
@app.route("/predict/auth", methods=["POST"])
@jwt_required()
def predict_auth():
    try:
        user_id = get_jwt_identity()

        if "image" not in request.files:
            return jsonify({
                "status": "failed",
                "error": "No image uploaded"
            }), 400

        file = request.files["image"]

        if file.filename == "" or not allowed_file(file.filename):
            return jsonify({
                "status": "failed",
                "error": "Invalid file type"
            }), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # AI Prediction
        result = predict_disease(filepath)

        if result["status"] != "success":
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify(result), 500

        disease_name = result["disease"]
        confidence = result["confidence"]

        info = disease_info.get(disease_name, {})

        # Convert image to base64
        with open(filepath, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode("utf-8")

        # Cleanup
        if os.path.exists(filepath):
            os.remove(filepath)

        # Save to MongoDB
        db.save_disease_history({
            "userId": user_id,
            "disease": disease_name,
            "confidence": confidence,
            "image": img_base64,
            "fertilizer": info.get("fertilizer", "")
        })

        return jsonify({
            "status": "success",
            "disease": disease_name,
            "confidence": confidence,
            "treatment": info.get("treatment", ""),
            "fertilizer": info.get("fertilizer", ""),
            "fertilizer_links": info.get("fertilizer_links", [])
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500
    
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