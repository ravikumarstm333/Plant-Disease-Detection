from flask import Flask, request, jsonify
from predict import predict_disease
from disease_info import disease_info
import os
import numpy as np

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Example class names (replace with your full 38 classes later)
class_names = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___healthy"
]


@app.route("/")
def home():
    return "🌱 Plant Disease Detection API is running"


@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"})

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"})

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    prediction = predict_disease(filepath)

    predicted_class_index = np.argmax(prediction)
    confidence = float(np.max(prediction))

    disease_name = class_names[predicted_class_index]

    info = disease_info.get(disease_name, {})

    response = {
        "disease": disease_name,
        "confidence": round(confidence * 100, 2),
        "treatment": info.get("treatment", "No treatment info available"),
        "fertilizer": info.get("fertilizer", "No fertilizer info available")
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)