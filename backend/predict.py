import os
import numpy as np
import requests
from dotenv import load_dotenv
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Load env
load_dotenv()

API_KEY = os.getenv("PLANTNET_API_KEY")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DISEASE_MODEL_PATH = os.path.join(BASE_DIR, "model", "plant_disease_model.h5")

# Load disease model only
disease_model = load_model(DISEASE_MODEL_PATH, compile=False)

print("✅ Disease model loaded")

# class map
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
    img_array = np.expand_dims(img_array, axis=0)
    # Ensure float32 and normalize to [0, 1]
    return img_array.astype('float32') / 255.0


# ---------------------------
# PLANTNET LEAF CHECK
# ---------------------------
def is_leaf(img_path):
    try:
        url = f"https://my-api.plantnet.org/v2/identify/all?api-key={API_KEY}"

        with open(img_path, "rb") as f:
            files = {"images": f}
            data = {"organs": "leaf"}

            res = requests.post(url, files=files, data=data)
            result = res.json()

        organs = result.get("predictedOrgans", [])

        if not organs:
            return False, 0.0

        return organs[0]["organ"] == "leaf" and organs[0]["score"] > 0.5, organs[0]["score"]

    except:
        return False, 0.0


# ---------------------------
# MAIN PREDICTION
# ---------------------------
def predict_disease(img_path):
    try:
        # STEP 1: GATE CHECK
        leaf, conf = is_leaf(img_path)

        if not leaf:
            return {
                "status": "rejected",
                "message": "Not a leaf image",
                "leaf_confidence": round(conf * 100, 2)
            }

        # STEP 2: ONLY LEAF → MODEL RUN
        img_array = preprocess_image(img_path)

        prediction = disease_model.predict(img_array, verbose=0)[0]

        index = np.argmax(prediction)
        confidence = np.max(prediction)

        # SAFE mapping (important fix)
        if index < len(class_map):
            disease = class_map[index]
        else:
            disease = "Unknown (model mismatch)"

        return {
            "status": "success",
            "leaf_detected": True,
            "disease": disease,
            "confidence": round(confidence * 100, 2),
            "leaf_confidence": round(conf * 100, 2)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }