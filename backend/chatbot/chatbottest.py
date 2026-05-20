from dotenv import load_dotenv
import os
from chatbot_new import get_chatbot_response

load_dotenv()

print(get_chatbot_response("My tomato leaves have yellow spots", "tomato_blight", {
    "treatment": "spray copper fungicide",
    "fertilizer": "compost"
}))