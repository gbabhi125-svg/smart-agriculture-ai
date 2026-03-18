from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import shap
import threading
import subprocess
import sys
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

BASE_DIR = os.environ.get("BASE_DIR", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATA_GOV_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"

def load_models():
    global crop_model, risk_model, harvest_model, explainer
    crop_model    = joblib.load(os.path.join(BASE_DIR, "ml_models", "crop_model.pkl"))
    risk_model    = joblib.load(os.path.join(BASE_DIR, "ml_models", "risk_model.pkl"))
    harvest_model = joblib.load(os.path.join(BASE_DIR, "ml_models", "harvest_model.pkl"))
    explainer     = shap.TreeExplainer(crop_model)
    print("Models loaded successfully.")

load_models()

FEATURES = ['N','P','K','temperature','humidity','ph','rainfall']
retraining_status = {"status":"idle","message":""}

def get_features(data):
    return np.array([[
        float(data['N']), float(data['P']),   float(data['K']),
        float(data['temperature']), float(data['humidity']),
        float(data['ph']),  float(data['rainfall'])
    ]])

# ── Crop name mapping for mandi API ──────────────────────────
CROP_MANDI_NAMES = {
    "rice":"Rice", "wheat":"Wheat", "maize":"Maize",
    "tomato":"Tomato", "potato":"Potato", "onion":"Onion",
    "sugarcane":"Sugarcane", "cotton":"Cotton", "soybean":"Soybean",
    "groundnut":"Groundnut", "banana":"Banana", "mango":"Mango",
    "turmeric":"Turmeric", "ginger":"Ginger", "coffee":"Coffee",
    "mustard":"Mustard", "chickpea":"Gram", "lentil":"Lentil",
    "garlic":"Garlic", "chilli":"Chilli", "papaya":"Papaya",
    "coconut":"Coconut", "jute":"Jute", "blackgram":"Black Gram",
    "mungbean":"Moong", "pigeonpeas":"Arhar/Tur",
    "kidneybeans":"Rajma", "lemon":"Lemon",
    "grapes":"Grapes", "watermelon":"Water Melon",
    "apple":"Apple", "orange":"Orange",
    "pomegranate":"Pomegranate", "brinjal":"Brinjal",
    "cabbage":"Cabbage", "cauliflower":"Cauliflower",
    "carrot":"Carrot", "peas":"Peas"
}

# ── Fallback prices (used if API fails) ───────────────────────
FALLBACK_PRICES = {
    "rice":2200,"wheat":2350,"maize":1850,"tomato":1200,
    "potato":800,"onion":1500,"sugarcane":350,"cotton":6200,
    "soybean":4200,"groundnut":5800,"banana":1800,"mango":4500,
    "turmeric":8500,"ginger":7200,"coffee":18000,"mustard":5200,
    "chickpea":5500,"lentil":6800,"garlic":4200,"chilli":9500,
    "default":2000
}


@app.route("/")
def home():
    return "Smart Agriculture AI API Running"


# ── Crop Recommendation ───────────────────────────────────────
@app.route("/predict-crop", methods=["POST"])
def predict_crop():
    data       = request.json
    features   = get_features(data)
    prediction = crop_model.predict(features)[0]
    proba      = crop_model.predict_proba(features)[0]
    confidence = round(float(np.max(proba)) * 100, 2)
    shap_values = explainer.shap_values(features)
    class_index = list(crop_model.classes_).index(prediction)
    shap_result = {
        name: round(float(val), 4)
        for name, val in zip(FEATURES, shap_values[class_index][0])
    }
    return jsonify({
        "recommended_crop": prediction,
        "confidence":       confidence,
        "shap_values":      shap_result
    })


# ── Soil Health ───────────────────────────────────────────────
@app.route("/predict-soil", methods=["POST"])
def predict_soil():
    data  = request.json
    N     = float(data['N'])
    P     = float(data['P'])
    K     = float(data['K'])
    score = round((N + P + K) / 3, 2)
    if score > 80:   status = "Healthy"
    elif score > 50: status = "Moderate"
    else:            status = "Poor"
    return jsonify({"soil_health_score": score, "status": status})


# ── Crop Failure Risk ─────────────────────────────────────────
@app.route("/predict-failure", methods=["POST"])
def predict_failure():
    data       = request.json
    features   = get_features(data)
    risk       = risk_model.predict(features)[0]
    proba      = risk_model.predict_proba(features)[0]
    confidence = round(float(np.max(proba)) * 100, 2)
    color = {"Low":"success","Medium":"warning","High":"danger"}.get(risk,"secondary")
    return jsonify({"failure_risk":risk,"confidence":confidence,"color":color})


# ── Harvest Time ──────────────────────────────────────────────
@app.route("/predict-harvest", methods=["POST"])
def predict_harvest():
    data     = request.json
    features = get_features(data)
    days     = int(round(harvest_model.predict(features)[0]))
    if days < 60:    season = "Short season crop"
    elif days < 120: season = "Medium season crop"
    else:            season = "Long season crop"
    return jsonify({"harvest_days":days,"season_type":season})


# ── Fertilizer Recommender ────────────────────────────────────
@app.route("/predict-fertilizer", methods=["POST"])
def predict_fertilizer():
    data = request.json
    N    = float(data['N'])
    P    = float(data['P'])
    K    = float(data['K'])
    ph   = float(data['ph'])
    crop = crop_model.predict(get_features(data))[0]

    fertilizers = []
    if N < 40:
        fertilizers.append({"nutrient":"Nitrogen","status":"Low","advice":"Apply Urea 50kg/acre","color":"danger"})
    elif N < 80:
        fertilizers.append({"nutrient":"Nitrogen","status":"Moderate","advice":"Apply Urea 25kg/acre","color":"warning"})
    else:
        fertilizers.append({"nutrient":"Nitrogen","status":"Good","advice":"No action needed","color":"success"})

    if P < 30:
        fertilizers.append({"nutrient":"Phosphorus","status":"Low","advice":"Apply SSP 40kg/acre","color":"danger"})
    elif P < 60:
        fertilizers.append({"nutrient":"Phosphorus","status":"Moderate","advice":"Apply SSP 20kg/acre","color":"warning"})
    else:
        fertilizers.append({"nutrient":"Phosphorus","status":"Good","advice":"No action needed","color":"success"})

    if K < 30:
        fertilizers.append({"nutrient":"Potassium","status":"Low","advice":"Apply MOP 30kg/acre","color":"danger"})
    elif K < 60:
        fertilizers.append({"nutrient":"Potassium","status":"Moderate","advice":"Apply MOP 15kg/acre","color":"warning"})
    else:
        fertilizers.append({"nutrient":"Potassium","status":"Good","advice":"No action needed","color":"success"})

    if ph < 5.5:
        ph_advice = "Soil is too acidic — apply Agricultural Lime"
        ph_color  = "danger"
    elif ph > 7.5:
        ph_advice = "Soil is too alkaline — apply Gypsum or Sulphur"
        ph_color  = "warning"
    else:
        ph_advice = "pH level is ideal for most crops"
        ph_color  = "success"

    return jsonify({
        "crop":        crop,
        "fertilizers": fertilizers,
        "ph_advice":   ph_advice,
        "ph_color":    ph_color,
        "summary":     f"Fertilizer plan generated for {crop}"
    })


# ── Real Mandi Market Prices ──────────────────────────────────
@app.route("/market-price/<crop_name>", methods=["GET"])
def market_price(crop_name):
    mandi_name = CROP_MANDI_NAMES.get(crop_name.lower(), crop_name.capitalize())
    fallback   = FALLBACK_PRICES.get(crop_name.lower(), FALLBACK_PRICES["default"])

    try:
        url = (
            f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
            f"?api-key={DATA_GOV_API_KEY}"
            f"&format=json"
            f"&limit=5"
            f"&filters[commodity]={mandi_name}"
        )
        response = requests.get(url, timeout=8)
        data     = response.json()

        records = data.get("records", [])

        if records:
            prices = []
            for r in records:
                try:
                    modal = float(r.get("modal_price", 0))
                    if modal > 0:
                        prices.append(modal)
                except:
                    pass

            if prices:
                avg_price = round(sum(prices) / len(prices))
                market    = records[0].get("market", "India")
                state     = records[0].get("state", "")
                date      = records[0].get("arrival_date", datetime.now().strftime("%d/%m/%Y"))

                return jsonify({
                    "crop":       crop_name,
                    "price":      avg_price,
                    "unit":       "per quintal",
                    "market":     market,
                    "state":      state,
                    "date":       date,
                    "source":     "Live — Agmarknet (data.gov.in)",
                    "is_live":    True
                })

        # Fallback if no records
        raise ValueError("No records found")

    except Exception as e:
        print(f"Market API error for {crop_name}: {e}")
        return jsonify({
            "crop":    crop_name,
            "price":   fallback,
            "unit":    "per quintal",
            "market":  "National Average",
            "state":   "India",
            "date":    datetime.now().strftime("%d/%m/%Y"),
            "source":  "Estimated MSP (API unavailable)",
            "is_live": False
        })


# ── Model Retraining ──────────────────────────────────────────
@app.route("/retrain-status", methods=["GET"])
def retrain_status():
    return jsonify(retraining_status)


@app.route("/retrain", methods=["POST"])
def retrain():
    if retraining_status["status"] == "running":
        return jsonify({"message":"Retraining already in progress."}), 400

    def run_training():
        global retraining_status
        retraining_status = {"status":"running","message":"Retraining started..."}
        try:
            train_script = os.path.join(BASE_DIR, "ml_models", "train_model.py")
            result = subprocess.run(
                [sys.executable, train_script],
                capture_output=True, text=True, timeout=300
            )
            if result.returncode == 0:
                load_models()
                retraining_status = {
                    "status":  "success",
                    "message": "All 3 models retrained and reloaded successfully!"
                }
            else:
                retraining_status = {
                    "status":  "error",
                    "message": f"Training failed: {result.stderr[:200]}"
                }
        except Exception as e:
            retraining_status = {"status":"error","message":f"Error: {str(e)}"}

    threading.Thread(target=run_training).start()
    return jsonify({"message":"Retraining started in background."})


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)