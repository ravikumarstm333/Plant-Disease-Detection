
import requests

API_KEY ="2b10uL73FZ87jg0OqexjKvTaO"

url = f"https://my-api.plantnet.org/v2/identify/all?api-key={API_KEY}"

files = {
    "images": open("nonleaf.png", "rb")
}

data = {
    "organs": "leaf"
}

response = requests.post(url, files=files, data=data)

result = response.json()

# ---------- LEAF / NON LEAF CHECK ----------

try:
    organ_score = result["predictedOrgans"][0]["score"]
    species_score = result["results"][0]["score"]

    if organ_score > 0.5 and species_score > 0.1:
        print("Leaf")
        print("Plant:", result["bestMatch"])

    else:
        print("Non Leaf")

except:
    print("Non Leaf")