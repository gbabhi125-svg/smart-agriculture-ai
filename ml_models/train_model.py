import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score
import joblib
import os

BASE_DIR     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dataset_path = os.path.join(BASE_DIR, "datasets", "Crop_recommendation.csv")

original = pd.read_csv(dataset_path)
print(f"Original dataset size: {len(original)}")

# ── 100+ Real crops from different regions ────────────────────
# Format: crop_name: {N, P, K, temperature, humidity, ph, rainfall}
# All ranges based on real agricultural data

crop_profiles = {
    # ── Cereals & Grains ──────────────────────────────────────
    "wheat":          {"N":(80,120), "P":(40,80),  "K":(30,60),  "temperature":(12,25), "humidity":(40,70), "ph":(6.0,7.5), "rainfall":(30,100)},
    "barley":         {"N":(60,100), "P":(30,60),  "K":(20,50),  "temperature":(10,25), "humidity":(40,70), "ph":(6.0,8.0), "rainfall":(30,100)},
    "sorghum":        {"N":(60,100), "P":(30,60),  "K":(20,50),  "temperature":(25,40), "humidity":(30,70), "ph":(5.5,8.0), "rainfall":(30,100)},
    "millets":        {"N":(40,80),  "P":(20,50),  "K":(20,40),  "temperature":(25,38), "humidity":(30,70), "ph":(5.5,7.5), "rainfall":(20,80)},
    "oats":           {"N":(60,100), "P":(30,60),  "K":(20,50),  "temperature":(10,22), "humidity":(50,80), "ph":(6.0,7.5), "rainfall":(50,120)},
    "rye":            {"N":(60,100), "P":(30,60),  "K":(20,50),  "temperature":(8,20),  "humidity":(50,80), "ph":(5.0,7.0), "rainfall":(40,100)},
    "pearl_millet":   {"N":(40,80),  "P":(20,50),  "K":(20,40),  "temperature":(25,40), "humidity":(30,65), "ph":(5.5,7.5), "rainfall":(20,80)},
    "finger_millet":  {"N":(30,70),  "P":(20,50),  "K":(20,40),  "temperature":(20,35), "humidity":(40,75), "ph":(5.5,8.0), "rainfall":(50,150)},
    "foxtail_millet": {"N":(30,60),  "P":(20,40),  "K":(15,35),  "temperature":(20,35), "humidity":(30,65), "ph":(5.5,7.5), "rainfall":(20,70)},
    "buckwheat":      {"N":(20,50),  "P":(20,50),  "K":(20,50),  "temperature":(12,22), "humidity":(50,80), "ph":(5.0,7.0), "rainfall":(50,150)},
    "quinoa":         {"N":(40,80),  "P":(30,60),  "K":(30,60),  "temperature":(15,25), "humidity":(40,75), "ph":(6.0,8.5), "rainfall":(30,100)},
    "amaranth":       {"N":(40,80),  "P":(30,60),  "K":(30,60),  "temperature":(20,35), "humidity":(40,75), "ph":(6.0,7.5), "rainfall":(30,100)},
    "teff":           {"N":(30,60),  "P":(20,50),  "K":(20,40),  "temperature":(15,30), "humidity":(30,65), "ph":(5.5,7.5), "rainfall":(30,80)},

    # ── Vegetables ────────────────────────────────────────────
    "tomato":         {"N":(80,120), "P":(60,100), "K":(80,120), "temperature":(18,30), "humidity":(50,80), "ph":(5.5,7.0), "rainfall":(40,100)},
    "potato":         {"N":(80,140), "P":(60,100), "K":(100,160),"temperature":(15,25), "humidity":(60,85), "ph":(5.0,6.5), "rainfall":(50,150)},
    "onion":          {"N":(60,100), "P":(40,80),  "K":(60,100), "temperature":(13,28), "humidity":(50,80), "ph":(6.0,7.5), "rainfall":(30,100)},
    "garlic":         {"N":(60,100), "P":(40,80),  "K":(60,100), "temperature":(12,24), "humidity":(50,75), "ph":(6.0,7.5), "rainfall":(30,80)},
    "cabbage":        {"N":(80,120), "P":(40,80),  "K":(60,100), "temperature":(10,22), "humidity":(60,85), "ph":(6.0,7.5), "rainfall":(40,100)},
    "cauliflower":    {"N":(80,120), "P":(40,80),  "K":(60,100), "temperature":(10,22), "humidity":(60,85), "ph":(6.0,7.5), "rainfall":(40,100)},
    "broccoli":       {"N":(80,120), "P":(40,80),  "K":(60,100), "temperature":(10,22), "humidity":(60,85), "ph":(6.0,7.5), "rainfall":(40,100)},
    "carrot":         {"N":(40,80),  "P":(40,80),  "K":(60,100), "temperature":(15,22), "humidity":(60,80), "ph":(5.5,7.0), "rainfall":(40,100)},
    "spinach":        {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(10,22), "humidity":(60,85), "ph":(6.0,7.5), "rainfall":(40,100)},
    "lettuce":        {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(10,22), "humidity":(60,85), "ph":(6.0,7.5), "rainfall":(40,100)},
    "cucumber":       {"N":(80,120), "P":(40,80),  "K":(60,100), "temperature":(18,30), "humidity":(60,85), "ph":(5.5,7.0), "rainfall":(40,100)},
    "pumpkin":        {"N":(60,100), "P":(40,80),  "K":(60,100), "temperature":(18,35), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(40,120)},
    "brinjal":        {"N":(80,120), "P":(40,80),  "K":(60,100), "temperature":(20,32), "humidity":(60,80), "ph":(5.5,7.0), "rainfall":(40,100)},
    "chilli":         {"N":(80,120), "P":(40,80),  "K":(60,100), "temperature":(20,32), "humidity":(50,80), "ph":(5.5,7.0), "rainfall":(40,120)},
    "capsicum":       {"N":(80,120), "P":(40,80),  "K":(60,100), "temperature":(18,30), "humidity":(55,80), "ph":(5.5,7.0), "rainfall":(40,100)},
    "beetroot":       {"N":(40,80),  "P":(30,60),  "K":(80,120), "temperature":(15,22), "humidity":(55,80), "ph":(6.0,7.5), "rainfall":(40,100)},
    "radish":         {"N":(40,80),  "P":(30,60),  "K":(40,80),  "temperature":(10,22), "humidity":(55,80), "ph":(5.5,7.0), "rainfall":(30,80)},
    "turnip":         {"N":(40,80),  "P":(30,60),  "K":(40,80),  "temperature":(10,22), "humidity":(55,80), "ph":(5.5,7.5), "rainfall":(30,80)},
    "sweetpotato":    {"N":(60,100), "P":(30,60),  "K":(80,120), "temperature":(20,30), "humidity":(60,85), "ph":(5.5,7.0), "rainfall":(50,150)},
    "yam":            {"N":(60,100), "P":(30,60),  "K":[60,100], "temperature":(22,35), "humidity":(70,90), "ph":(5.5,7.0), "rainfall":(100,250)},
    "peas":           {"N":(20,50),  "P":(50,100), "K":(40,80),  "temperature":(10,22), "humidity":(55,80), "ph":(6.0,7.5), "rainfall":(40,100)},
    "beans":          {"N":(20,50),  "P":(50,100), "K":(30,70),  "temperature":(15,28), "humidity":(55,80), "ph":(5.5,7.0), "rainfall":(40,120)},
    "okra":           {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(22,35), "humidity":(55,80), "ph":(6.0,7.5), "rainfall":(40,100)},
    "bittergourd":    {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(24,35), "humidity":(60,85), "ph":(5.5,7.0), "rainfall":(50,150)},
    "bottlegourd":    {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(24,35), "humidity":(60,85), "ph":(5.5,7.5), "rainfall":(50,150)},
    "ridgegourd":     {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(24,35), "humidity":(60,85), "ph":(5.5,7.5), "rainfall":(50,150)},
    "snakegourd":     {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(24,38), "humidity":(65,90), "ph":(5.5,7.0), "rainfall":(60,180)},
    "drumstick":      {"N":(20,60),  "P":(10,30),  "K":(20,50),  "temperature":(25,38), "humidity":(40,75), "ph":(6.0,8.5), "rainfall":(30,150)},
    "asparagus":      {"N":(60,100), "P":(40,80),  "K":(60,100), "temperature":(15,25), "humidity":(55,80), "ph":(6.0,7.5), "rainfall":(40,120)},
    "celery":         {"N":(80,120), "P":(40,80),  "K":(60,100), "temperature":(15,22), "humidity":(60,85), "ph":(6.0,7.5), "rainfall":(40,100)},

    # ── Fruits ────────────────────────────────────────────────
    "strawberry":     {"N":(40,80),  "P":(40,80),  "K":(40,80),  "temperature":(12,22), "humidity":(60,85), "ph":(5.5,6.5), "rainfall":(60,150)},
    "guava":          {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(20,35), "humidity":(50,80), "ph":(5.0,7.5), "rainfall":(50,200)},
    "lemon":          {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(15,30), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(50,180)},
    "lime":           {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(18,32), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(50,200)},
    "pineapple":      {"N":(40,80),  "P":(10,30),  "K":(80,140), "temperature":(20,32), "humidity":(70,90), "ph":(4.5,6.5), "rainfall":(100,280)},
    "papaya":         {"N":(40,80),  "P":(40,80),  "K":(30,60),  "temperature":(25,38), "humidity":(70,90), "ph":(5.5,7.0), "rainfall":(100,250)},
    "jackfruit":      {"N":(20,50),  "P":(10,30),  "K":(30,60),  "temperature":(22,35), "humidity":(70,90), "ph":(5.0,7.0), "rainfall":(100,280)},
    "litchi":         {"N":(20,50),  "P":(20,50),  "K":(30,60),  "temperature":(20,32), "humidity":(65,90), "ph":(5.5,7.0), "rainfall":(80,200)},
    "plum":           {"N":(20,60),  "P":(20,50),  "K":(30,60),  "temperature":(12,25), "humidity":(55,80), "ph":(5.5,7.5), "rainfall":(60,150)},
    "peach":          {"N":(20,60),  "P":(20,50),  "K":(30,60),  "temperature":(12,24), "humidity":(55,80), "ph":(6.0,7.5), "rainfall":(60,150)},
    "pear":           {"N":(20,60),  "P":(20,50),  "K":(30,60),  "temperature":(10,22), "humidity":(55,80), "ph":(6.0,7.5), "rainfall":(60,150)},
    "cherry":         {"N":(20,50),  "P":(20,50),  "K":(30,60),  "temperature":(10,20), "humidity":(55,80), "ph":(6.0,7.5), "rainfall":(60,150)},
    "fig":            {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(18,35), "humidity":(40,75), "ph":(6.0,8.0), "rainfall":(30,100)},
    "date_palm":      {"N":(20,50),  "P":(10,30),  "K":(30,60),  "temperature":(28,45), "humidity":(20,50), "ph":(7.0,9.0), "rainfall":(10,50)},
    "avocado":        {"N":(40,80),  "P":(20,50),  "K":(60,100), "temperature":(18,28), "humidity":(60,85), "ph":(6.0,7.5), "rainfall":(100,250)},
    "kiwi":           {"N":(40,80),  "P":(30,60),  "K":(40,80),  "temperature":(10,22), "humidity":(60,85), "ph":(5.5,7.0), "rainfall":(80,200)},
    "passion_fruit":  {"N":(40,80),  "P":(20,50),  "K":(40,80),  "temperature":(18,30), "humidity":(60,85), "ph":(5.5,7.0), "rainfall":(80,200)},
    "dragon_fruit":   {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(20,38), "humidity":(50,80), "ph":(6.0,7.5), "rainfall":(40,120)},
    "custard_apple":  {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(22,35), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(50,150)},
    "tamarind":       {"N":(10,30),  "P":(10,30),  "K":(20,50),  "temperature":(22,38), "humidity":(40,75), "ph":(5.5,7.5), "rainfall":(50,180)},
    "jamun":          {"N":(10,30),  "P":(10,30),  "K":(20,50),  "temperature":(22,38), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(80,200)},
    "mulberry":       {"N":(40,80),  "P":(20,50),  "K":(30,60),  "temperature":(18,30), "humidity":(55,85), "ph":(5.5,7.5), "rainfall":(60,200)},

    # ── Spices & Herbs ────────────────────────────────────────
    "turmeric":       {"N":(60,100), "P":(40,80),  "K":(60,100), "temperature":(20,35), "humidity":(70,90), "ph":(5.5,7.5), "rainfall":(100,250)},
    "ginger":         {"N":(60,100), "P":(40,80),  "K":(60,100), "temperature":(20,32), "humidity":(70,90), "ph":(5.5,7.5), "rainfall":(100,250)},
    "cardamom":       {"N":(40,80),  "P":(20,50),  "K":(40,80),  "temperature":(18,28), "humidity":(70,90), "ph":(5.0,6.5), "rainfall":(150,280)},
    "black_pepper":   {"N":(40,80),  "P":(20,50),  "K":(40,80),  "temperature":(20,32), "humidity":(70,90), "ph":(5.0,7.0), "rainfall":(150,280)},
    "cinnamon":       {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(20,32), "humidity":(70,90), "ph":(5.5,7.0), "rainfall":(100,250)},
    "clove":          {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(20,32), "humidity":(70,90), "ph":(5.5,7.0), "rainfall":(150,280)},
    "nutmeg":         {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(20,30), "humidity":(70,90), "ph":(5.5,7.0), "rainfall":(150,280)},
    "coriander":      {"N":(40,80),  "P":(20,50),  "K":(20,50),  "temperature":(15,28), "humidity":(40,75), "ph":(6.0,7.5), "rainfall":(30,80)},
    "cumin":          {"N":(20,50),  "P":(20,50),  "K":(20,50),  "temperature":(20,32), "humidity":(30,65), "ph":(6.5,8.0), "rainfall":(20,60)},
    "fenugreek":      {"N":(20,50),  "P":(20,50),  "K":(20,50),  "temperature":(15,28), "humidity":(40,75), "ph":(6.0,7.5), "rainfall":(20,80)},
    "mustard":        {"N":(60,100), "P":(30,60),  "K":(20,50),  "temperature":(10,25), "humidity":(40,75), "ph":(6.0,7.5), "rainfall":(25,80)},
    "sesame":         {"N":(40,80),  "P":(30,60),  "K":(20,50),  "temperature":(25,38), "humidity":(30,65), "ph":(5.5,7.5), "rainfall":(25,80)},
    "sunflower":      {"N":(60,100), "P":(40,80),  "K":(40,80),  "temperature":(20,32), "humidity":(40,75), "ph":(6.0,7.5), "rainfall":(40,120)},
    "saffron":        {"N":(20,50),  "P":(20,50),  "K":(20,50),  "temperature":(10,20), "humidity":(30,65), "ph":(6.0,8.0), "rainfall":(25,80)},
    "vanilla":        {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(20,30), "humidity":(70,90), "ph":(5.5,7.0), "rainfall":(150,280)},
    "lemongrass":     {"N":(40,80),  "P":(20,50),  "K":(30,60),  "temperature":(22,35), "humidity":(60,85), "ph":(5.5,7.5), "rainfall":(80,200)},
    "mint":           {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(15,28), "humidity":(60,85), "ph":(6.0,7.5), "rainfall":(60,180)},
    "basil":          {"N":(40,80),  "P":(20,50),  "K":(30,60),  "temperature":(18,30), "humidity":(55,85), "ph":(5.5,7.5), "rainfall":(40,120)},
    "curry_leaf":     {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(22,35), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(50,180)},

    # ── Cash Crops & Plantation ───────────────────────────────
    "sugarcane":      {"N":(100,140),"P":(40,80),  "K":(80,140), "temperature":(20,38), "humidity":(60,90), "ph":(6.0,8.0), "rainfall":(100,280)},
    "tobacco":        {"N":(40,80),  "P":(30,60),  "K":(60,100), "temperature":(18,32), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(40,120)},
    "rubber":         {"N":(40,80),  "P":(20,50),  "K":(40,80),  "temperature":(22,32), "humidity":(70,90), "ph":(4.5,6.5), "rainfall":(150,280)},
    "tea":            {"N":(40,80),  "P":(20,50),  "K":(20,50),  "temperature":(15,28), "humidity":(70,90), "ph":(4.5,6.0), "rainfall":(150,280)},
    "cocoa":          {"N":(40,80),  "P":(20,50),  "K":(40,80),  "temperature":(20,30), "humidity":(70,90), "ph":(5.0,7.0), "rainfall":(150,280)},
    "cashew":         {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(22,38), "humidity":(50,80), "ph":(5.0,7.5), "rainfall":(50,200)},
    "arecanut":       {"N":(40,80),  "P":(20,50),  "K":(40,80),  "temperature":(20,32), "humidity":(70,90), "ph":(5.5,7.5), "rainfall":(100,280)},
    "oilpalm":        {"N":(60,100), "P":(30,60),  "K":(80,140), "temperature":(22,32), "humidity":(70,90), "ph":(4.5,7.0), "rainfall":(150,280)},
    "groundnut":      {"N":(10,30),  "P":(40,80),  "K":(20,50),  "temperature":(22,35), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(40,120)},
    "soybean":        {"N":(10,30),  "P":(40,80),  "K":(20,50),  "temperature":(18,32), "humidity":(50,80), "ph":(6.0,7.5), "rainfall":(60,180)},
    "sunhemp":        {"N":(20,50),  "P":(20,50),  "K":(20,50),  "temperature":(20,35), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(40,150)},
    "safflower":      {"N":(40,80),  "P":(30,60),  "K":(20,50),  "temperature":(18,32), "humidity":(30,65), "ph":(6.0,8.0), "rainfall":(25,80)},
    "linseed":        {"N":(40,80),  "P":(30,60),  "K":(20,50),  "temperature":(10,22), "humidity":(40,75), "ph":(5.5,7.5), "rainfall":(30,100)},
    "castor":         {"N":(40,80),  "P":(30,60),  "K":(20,50),  "temperature":(20,38), "humidity":(40,75), "ph":(5.5,7.5), "rainfall":(30,100)},

    # ── Pulses & Legumes ──────────────────────────────────────
    "cowpea":         {"N":(10,30),  "P":(40,80),  "K":(20,50),  "temperature":(22,35), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(40,120)},
    "field_pea":      {"N":(10,30),  "P":(40,80),  "K":(20,50),  "temperature":(10,22), "humidity":(55,80), "ph":(6.0,7.5), "rainfall":(40,100)},
    "horse_gram":     {"N":(10,30),  "P":(30,60),  "K":(20,50),  "temperature":(20,35), "humidity":(40,75), "ph":(5.5,7.5), "rainfall":(30,100)},
    "cluster_bean":   {"N":(10,30),  "P":(30,60),  "K":(20,50),  "temperature":(25,38), "humidity":(30,65), "ph":(6.0,8.0), "rainfall":(20,80)},
    "winged_bean":    {"N":(10,30),  "P":(30,60),  "K":(20,50),  "temperature":(22,35), "humidity":(60,85), "ph":(5.5,7.5), "rainfall":(60,180)},
    "velvet_bean":    {"N":(10,30),  "P":(20,50),  "K":(20,50),  "temperature":(22,35), "humidity":(55,80), "ph":(5.5,7.5), "rainfall":(50,150)},

    # ── Flowers & Medicinal ───────────────────────────────────
    "rose":           {"N":(40,80),  "P":(30,60),  "K":(40,80),  "temperature":(15,28), "humidity":(55,80), "ph":(5.5,7.0), "rainfall":(40,120)},
    "jasmine":        {"N":(30,60),  "P":(20,50),  "K":(30,60),  "temperature":(18,32), "humidity":(55,85), "ph":(5.5,7.5), "rainfall":(40,150)},
    "marigold":       {"N":(40,80),  "P":(30,60),  "K":(30,60),  "temperature":(18,32), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":(40,100)},
    "chrysanthemum":  {"N":(40,80),  "P":(30,60),  "K":(30,60),  "temperature":(15,25), "humidity":(55,80), "ph":(5.5,7.0), "rainfall":(40,120)},
    "aloe_vera":      {"N":(10,30),  "P":(10,30),  "K":(20,50),  "temperature":(18,38), "humidity":(25,60), "ph":(6.0,8.0), "rainfall":(15,60)},
    "neem":           {"N":(10,30),  "P":(10,30),  "K":(10,30),  "temperature":(22,42), "humidity":(30,70), "ph":(6.0,8.5), "rainfall":(20,120)},
    "tulsi":          {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(18,35), "humidity":(50,80), "ph":(5.5,7.5), "rainfall":[30,120]},
    "ashwagandha":    {"N":(20,50),  "P":(10,30),  "K":(20,50),  "temperature":(20,35), "humidity":(30,65), "ph":(7.5,8.5), "rainfall":[30,80]},
    "stevia":         {"N":(40,80),  "P":(20,50),  "K":(30,60),  "temperature":(15,30), "humidity":(55,85), "ph":(6.5,7.5), "rainfall":[50,150]},
    "moringa":        {"N":(20,60),  "P":(10,30),  "K":(20,50),  "temperature":(25,38), "humidity":(40,75), "ph":(6.0,8.5), "rainfall":[30,150]},

    # ── Fodder & Green Manure ─────────────────────────────────
    "alfalfa":        {"N":(10,30),  "P":(40,80),  "K":(40,80),  "temperature":(15,30), "humidity":(40,75), "ph":(6.5,8.0), "rainfall":[40,150]},
    "napier_grass":   {"N":(80,140), "P":(30,60),  "K":(60,100), "temperature":(22,38), "humidity":[60,90], "ph":(5.5,7.5), "rainfall":[80,250]},
    "sudan_grass":    {"N":(60,100), "P":(30,60),  "K":(40,80),  "temperature":(25,38), "humidity":(40,75), "ph":(5.5,7.5), "rainfall":[30,100]},
    "sesbania":       {"N":(10,30),  "P":(20,50),  "K":(20,50),  "temperature":(22,38), "humidity":(60,85), "ph":(5.5,7.5), "rainfall":[60,200]},
}

np.random.seed(42)

# ── Generate synthetic records ────────────────────────────────
synthetic_rows = []
samples_per_crop = 15

for crop, profile in crop_profiles.items():
    for _ in range(samples_per_crop):
        row = {}
        for feat in ["N","P","K","temperature","humidity","ph","rainfall"]:
            low  = profile[feat][0]
            high = profile[feat][1]
            row[feat] = round(np.random.uniform(low, high), 2)
        row["label"] = crop
        synthetic_rows.append(row)

synthetic_df = pd.DataFrame(synthetic_rows)
print(f"New crops added        : {len(crop_profiles)}")
print(f"Synthetic records      : {len(synthetic_df)}")

# ── Combine datasets ──────────────────────────────────────────
data = pd.concat([original, synthetic_df], ignore_index=True)
data = data.sample(frac=1, random_state=42).reset_index(drop=True)
print(f"Total combined records : {len(data)}")
print(f"\nAll crop types ({data['label'].nunique()}):")
print(sorted(data['label'].unique()))

X = data[["N","P","K","temperature","humidity","ph","rainfall"]]
y = data["label"]

# ── Model 1: Crop Recommendation ─────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
crop_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_split=2,
    random_state=42,
    n_jobs=-1
)
crop_model.fit(X_train, y_train)
acc = accuracy_score(y_test, crop_model.predict(X_test))
print(f"\nCrop Model Accuracy     : {acc:.4f}")
joblib.dump(crop_model, os.path.join(BASE_DIR, "ml_models", "crop_model.pkl"))
print("crop_model.pkl saved")

# ── Model 2: Crop Failure Risk ────────────────────────────────
def assign_failure_risk(row):
    score = 0
    if row["ph"] < 5.0 or row["ph"] > 8.5:                 score += 2
    if row["rainfall"] < 40 or row["rainfall"] > 280:       score += 2
    if row["temperature"] > 42 or row["temperature"] < 10:  score += 2
    if row["humidity"] < 20:                                 score += 1
    if row["N"] < 10:                                        score += 1
    if score >= 4: return "High"
    if score >= 2: return "Medium"
    return "Low"

data["failure_risk"] = data.apply(assign_failure_risk, axis=1)
X_r = data[["N","P","K","temperature","humidity","ph","rainfall"]]
y_r = data["failure_risk"]
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X_r, y_r, test_size=0.2, random_state=42
)
risk_model = GradientBoostingClassifier(n_estimators=200, random_state=42)
risk_model.fit(X_train_r, y_train_r)
acc_r = accuracy_score(y_test_r, risk_model.predict(X_test_r))
print(f"Failure Risk Accuracy   : {acc_r:.4f}")
joblib.dump(risk_model, os.path.join(BASE_DIR, "ml_models", "risk_model.pkl"))
print("risk_model.pkl saved")

# ── Model 3: Harvest Time ─────────────────────────────────────
crop_days = {
    "rice":90,"maize":75,"chickpea":100,"kidneybeans":90,
    "pigeonpeas":150,"mothbeans":65,"mungbean":65,"blackgram":75,
    "lentil":95,"pomegranate":180,"banana":270,"mango":150,
    "grapes":150,"watermelon":80,"muskmelon":75,"apple":160,
    "orange":240,"papaya":180,"coconut":365,"cotton":160,
    "jute":120,"coffee":270,"wheat":110,"barley":90,"sorghum":110,
    "millets":75,"oats":100,"rye":100,"pearl_millet":75,
    "finger_millet":100,"foxtail_millet":75,"buckwheat":70,
    "quinoa":90,"amaranth":70,"teff":90,"tomato":70,"potato":90,
    "onion":120,"garlic":150,"cabbage":90,"cauliflower":90,
    "broccoli":80,"carrot":80,"spinach":45,"lettuce":45,
    "cucumber":60,"pumpkin":90,"brinjal":70,"chilli":90,
    "capsicum":80,"beetroot":70,"radish":30,"turnip":45,
    "sweetpotato":120,"yam":180,"peas":70,"beans":65,"okra":55,
    "bittergourd":70,"bottlegourd":70,"ridgegourd":70,
    "snakegourd":80,"drumstick":180,"asparagus":365,"celery":80,
    "strawberry":90,"guava":150,"lemon":240,"lime":240,
    "pineapple":540,"jackfruit":360,"litchi":120,"plum":150,
    "peach":150,"pear":150,"cherry":120,"fig":180,
    "date_palm":365,"avocado":365,"kiwi":300,"passion_fruit":240,
    "dragon_fruit":300,"custard_apple":180,"tamarind":365,
    "jamun":120,"mulberry":60,"turmeric":270,"ginger":240,
    "cardamom":365,"black_pepper":365,"cinnamon":365,"clove":365,
    "nutmeg":365,"coriander":45,"cumin":90,"fenugreek":90,
    "mustard":90,"sesame":80,"sunflower":90,"saffron":180,
    "vanilla":365,"lemongrass":90,"mint":60,"basil":60,
    "curry_leaf":365,"sugarcane":360,"tobacco":100,"rubber":365,
    "tea":365,"cocoa":365,"cashew":240,"arecanut":365,
    "oilpalm":365,"groundnut":120,"soybean":90,"sunhemp":60,
    "safflower":120,"linseed":100,"castor":150,"cowpea":75,
    "field_pea":90,"horse_gram":90,"cluster_bean":75,
    "winged_bean":90,"velvet_bean":90,"rose":365,"jasmine":365,
    "marigold":75,"chrysanthemum":90,"aloe_vera":365,
    "neem":365,"tulsi":90,"ashwagandha":180,"stevia":120,
    "moringa":365,"alfalfa":60,"napier_grass":60,
    "sudan_grass":75,"sesbania":60
}

def estimate_harvest(row):
    base = crop_days.get(row["label"], 100)
    adj  = 0
    if row["temperature"] > 30: adj -= 5
    if row["temperature"] < 15: adj += 8
    if row["rainfall"] > 200:   adj -= 3
    if row["rainfall"] < 60:    adj += 5
    return max(30, base + adj + np.random.randint(-3, 4))

data["harvest_days"] = data.apply(estimate_harvest, axis=1)
X_h = data[["N","P","K","temperature","humidity","ph","rainfall"]]
y_h = data["harvest_days"]
X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(
    X_h, y_h, test_size=0.2, random_state=42
)
harvest_model = LinearRegression()
harvest_model.fit(X_train_h, y_train_h)
print(f"Harvest Model R2 Score  : {harvest_model.score(X_test_h, y_test_h):.4f}")
joblib.dump(harvest_model, os.path.join(BASE_DIR, "ml_models", "harvest_model.pkl"))
print("harvest_model.pkl saved")

print(f"\nAll 3 models retrained successfully.")
print(f"Total crops: {data['label'].nunique()}")
print(f"Total records: {len(data)}")