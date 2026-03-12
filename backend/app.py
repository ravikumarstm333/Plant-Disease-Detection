from flask import Flask, request, jsonify
from predict import predict_disease
from disease_info import disease_info
import os
import numpy as np

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# here the 38 classes of pant
class_names = [
    # Apple
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    
    # Blueberry
    "Blueberry___healthy",
    
    # Cherry
    "Cherry_(including_sour)___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    
    # Corn (Maize)
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___healthy",
    "Corn_(maize)___Northern_Leaf_Blight",
    
    # Grape
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___healthy",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    
    # Orange
    "Orange___Haunglongbing_(Citrus_greening)",
    
    # Peach
    "Peach___Bacterial_spot",
    "Peach___healthy",
    
    # Pepper
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    
    # Potato
    "Potato___Early_blight",
    "Potato___healthy",
    "Potato___Late_blight",
    
    # Raspberry
    "Raspberry___healthy",
    
    # Soybean
    "Soybean___healthy",
    
    # Squash
    "Squash___Powdery_mildew",
    
    # Strawberry
    "Strawberry___healthy",
    "Strawberry___Leaf_scorch",
    
    # Tomato
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___healthy",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus"
]


@app.route("/")
def home():
    return "Plant Disease Detection API is running"


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
        "fertilizer": info.get("fertilizer", "No fertilizer info available"),
        "fertilizer_links": info.get("fertilizer_links", [])
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)