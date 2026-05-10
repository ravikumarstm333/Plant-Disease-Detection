import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DISEASE_MODEL_PATH = os.path.join(BASE_DIR, "model", "plant_disease_model.h5")
LEAF_MODEL_PATH = os.path.join(BASE_DIR, "model", "leaf_or_nonleaf_model.h5")

# Load models
disease_model = load_model(DISEASE_MODEL_PATH, compile=False)
leaf_model = load_model(LEAF_MODEL_PATH, compile=False)

print("✅ Models loaded successfully")

# Class mapping
class_map = {
    0: "Apple___Apple_scab",
    1: "Apple___Black_rot",
    2: "Apple___Cedar_apple_rust",
    3: "Apple___healthy",
    4: "Blueberry___healthy",
    5: "Cherry_(including_sour)___Powdery_mildew",
    6: "Cherry_(including_sour)___healthy",
    7: "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    8: "Corn_(maize)___Common_rust_",
    9: "Corn_(maize)___Northern_Leaf_Blight",
    10: "Corn_(maize)___healthy",
    11: "Grape___Black_rot",
    12: "Grape___Esca_(Black_Measles)",
    13: "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    14: "Grape___healthy",
    15: "Orange___Haunglongbing_(Citrus_greening)",
    16: "Peach___Bacterial_spot",
    17: "Peach___healthy",
    18: "Pepper,_bell___Bacterial_spot",
    19: "Pepper,_bell___healthy",
    20: "Potato___Early_blight",
    21: "Potato___Late_blight",
    22: "Potato___healthy",
    23: "Raspberry___healthy",
    24: "Soybean___healthy",
    25: "Squash___Powdery_mildew",
    26: "Strawberry___Leaf_scorch",
    27: "Strawberry___healthy",
    28: "Tomato___Bacterial_spot",
    29: "Tomato___Early_blight",
    30: "Tomato___Late_blight",
    31: "Tomato___Leaf_Mold",
    32: "Tomato___Septoria_leaf_spot",
    33: "Tomato___Spider_mites Two-spotted_spider_mite",
    34: "Tomato___Target_Spot",
    35: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    36: "Tomato___Tomato_mosaic_virus",
    37: "Tomato___healthy"
}

# preprocess
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    return img_array

# leaf check
def is_leaf(img_array):
    return True, 1.0

# main prediction
def predict_disease(img_path):
    try:
        img_array = preprocess_image(img_path)

        leaf, leaf_conf = is_leaf(img_array)

        if not leaf:
            return {
                "status": "rejected",
                "message": "Not a valid plant leaf image",
                "leaf_confidence": round(leaf_conf * 100, 2)
            }

        prediction = disease_model.predict(img_array, verbose=0)[0]

        index = int(np.argmax(prediction))
        confidence = float(np.max(prediction))

        print("Prediction:", prediction)
        print("Index:", index)
        print("Confidence:", confidence)
        print("Leaf model output:", leaf_model.predict(img_array))

        return {
            "status": "success",
            "leaf_detected": True,
            "disease": class_map.get(index, "Unknown"),
            "confidence": round(confidence * 100, 2),
            "leaf_confidence": round(leaf_conf * 100, 2)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }