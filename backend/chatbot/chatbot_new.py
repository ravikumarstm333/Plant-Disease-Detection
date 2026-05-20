import os
import requests
from dotenv import load_dotenv

NON_FARM_HINT = "I can only help with farming, plants, crops, soil, fertilizer, pest and agriculture related questions."

load_dotenv()

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")


def is_farming_question(q: str):
    q = q.lower()
    keywords = [
        "plant", "crop", "farm", "leaf", "disease", "pest", "soil",
        "fertilizer", "irrigation", "seed", "harvest", "fungus",
        "tomato", "rice", "wheat", "insect", "compost", "agriculture"
    ]
    return any(k in q for k in keywords)


def call_gemini(question, disease_name=None, disease_data=None):
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()

    if not api_key:
        return None

    prompt = f"""
You are an expert agricultural AI assistant.

RULES:
- Only answer farming/agriculture questions
- Be simple and practical for farmers
- Prefer organic solutions first
- If disease is provided, prioritize it
- If plant is healthy → say no fertilizer needed

Disease: {disease_name}
Disease Data: {disease_data}
User Question: {question}

Answer clearly in 4-6 lines max.
"""

    model = GEMINI_MODEL if GEMINI_MODEL.startswith("models/") else f"models/{GEMINI_MODEL}"
    url = f"https://generativelanguage.googleapis.com/v1beta/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    try:
        res = requests.post(url, json=payload, timeout=20)
        if res.status_code != 200:
            print("Gemini HTTP error:", res.status_code, res.text[:300])
            return None

        data = res.json()
        candidates = data.get("candidates", [])
        if not candidates:
            print("Gemini returned no candidates:", data)
            return None

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            print("Gemini returned empty parts:", data)
            return None

        text = parts[0].get("text", "").strip()
        print("Gemini success")
        return text or None

    except Exception as e:
        print("Gemini error:", e)
        return None


def local_fallback(q):
    q = q.lower()

    if "fertilizer" in q:
        return "Use compost or vermicompost first. Chemical fertilizer only if soil test demands."

    if "pest" in q:
        return "Use neem oil spray + sticky traps first. Avoid strong chemicals initially."

    if "water" in q:
        return "Water at root zone in morning. Avoid overwatering."

    return "Please ask a farming-related question."


def get_chatbot_response(question, disease_name=None, disease_data=None):

    question = (question or "").strip()

    if not question:
        return "Ask me a farming or plant-related question."

    # Non farming filter
    if not is_farming_question(question) and not disease_name and not disease_data:
        return NON_FARM_HINT

    # Step 1: Try Gemini FIRST (important fix)
    ai_response = call_gemini(question, disease_name, disease_data)
    if ai_response:
        return ai_response

    # Step 2: fallback
    print("Gemini failed, using local fallback")
    return local_fallback(question)
