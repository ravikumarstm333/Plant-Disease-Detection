from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from otp_service import generate_otp, send_email
from database import db
import bcrypt

otp_bp = Blueprint("otp", __name__)

# ================= SEND OTP =================
@otp_bp.route("/send-otp", methods=["POST"])
def send_otp():
    try:
        data = request.json
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email required"}), 400

        # Check if user already exists BEFORE sending OTP
        if db.find_user_by_email(email):
            return jsonify({"error": "User with this email already exists"}), 409

        otp = generate_otp()

        db.otps.update_one(
            {"email": email},
            {
                "$set": {
                    "otp": otp,
                    "createdAt": datetime.utcnow(),
                    "expiresAt": datetime.utcnow() + timedelta(minutes=5)
                }
            },
            upsert=True
        )

        success = send_email(email, otp)

        if success:
            return jsonify({"status": "success", "message": "OTP sent"})
        else:
            return jsonify({"status": "failed", "error": "SMTP server rejected the email. Check backend logs."}), 500

    except Exception as e:
        print(f"❌ Route Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ================= VERIFY OTP =================
@otp_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.json
        email = data.get("email")
        otp = data.get("otp")

        record = db.otps.find_one({"email": email})

        if not record:
            return jsonify({"error": "OTP not found"}), 400

        if datetime.utcnow() > record["expiresAt"]:
            return jsonify({"error": "OTP expired"}), 400

        if record["otp"] != otp:
            return jsonify({"error": "Invalid OTP"}), 400

        # We don't delete here so that reset-password can verify it again
        return jsonify({"status": "success"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= FORGOT PASSWORD =================
@otp_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.json
        email = data.get("email")

        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        otp = generate_otp()

        db.otps.update_one(
            {"email": email},
            {
                "$set": {
                    "otp": otp,
                    "createdAt": datetime.utcnow(),
                    "expiresAt": datetime.utcnow() + timedelta(minutes=5)
                }
            },
            upsert=True
        )

        success = send_email(email, otp)

        if success:
            return jsonify({"message": "OTP sent"})
        else:
            return jsonify({"error": "Email failed"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= RESET PASSWORD =================
@otp_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.json
        email = data.get("email")
        otp = data.get("otp")
        new_password = data.get("password")

        record = db.otps.find_one({"email": email})

        if not record or record["otp"] != otp:
            return jsonify({"error": "Invalid OTP"}), 400

        if datetime.utcnow() > record["expiresAt"]:
            return jsonify({"error": "OTP expired"}), 400

        hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())

        db.users.update_one(
            {"email": email},
            {"$set": {"password": hashed}}
        )

        db.otps.delete_one({"email": email})

        return jsonify({"message": "Password updated"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500