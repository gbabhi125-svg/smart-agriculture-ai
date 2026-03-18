# 🌾 Smart Agriculture AI

<div align="center">

![Smart Agriculture AI](https://img.shields.io/badge/Smart-Agriculture%20AI-2d6a4f?style=for-the-badge&logo=leaf&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-2.2-000000?style=for-the-badge&logo=flask&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![ML](https://img.shields.io/badge/Machine%20Learning-Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

**An end-to-end AI-powered farming assistant that helps farmers make data-driven decisions using Machine Learning, Explainable AI, and real-time data.**

[🚀 GitHub Repo](https://github.com/gbabhi125-svg/smart-agriculture-ai)

</div>

---

## 📌 Table of Contents

- [About The Project](#about-the-project)
- [SDG Goals](#sdg-goals)
- [Features](#features)
- [Architecture](#architecture)
- [ML Models](#ml-models)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Author](#author)

---

## 🌱 About The Project

Agriculture remains the backbone of India's economy, yet farmers continue to face significant challenges in selecting the right crop, managing soil health, and predicting yield outcomes. Lack of data-driven decision support leads to poor crop selection, excessive fertilizer usage, and ultimately reduced agricultural productivity.

**Smart Agriculture AI** is an end-to-end Artificial Intelligence system that provides farmers with intelligent, data-driven recommendations through a multilingual web dashboard.

### Problem Statement
> Farmers lack access to real-time, data-driven insights about which crops to grow based on their specific soil conditions and weather patterns — leading to poor yields, financial losses, and food insecurity.

### What We Predict
| Module | Output | Algorithm |
|--------|--------|-----------|
| Crop Recommendation | Best crop to grow | Random Forest |
| Soil Health | Score 0–100 + status | Rule-based scoring |
| Crop Failure Risk | Low / Medium / High | Gradient Boosting |
| Harvest Time | Days remaining | Linear Regression |
| Fertilizer Advisory | NPK recommendations | Rule-based + ML |

---

## 🌍 SDG Goals

This project directly targets:

| Goal | Description |
|------|-------------|
| **SDG 2 — Zero Hunger** | Improve crop yields and food security through AI-driven recommendations |
| **SDG 15 — Life on Land** | Promote sustainable land use and reduce soil degradation |

---

## ✨ Features

### 🤖 AI Modules
- **Crop Recommendation** — predicts the best crop with confidence percentage
- **Soil Health Analysis** — scores soil from 0–100 with NPK analysis
- **Crop Failure Risk** — predicts Low / Medium / High risk using Gradient Boosting
- **Harvest Time Predictor** — estimates days to harvest using Linear Regression
- **Fertilizer Advisor** — recommends exact fertilizer amounts based on NPK deficiency

### 🧠 Explainable AI (XAI)
- **SHAP values** — shows exactly why the AI recommended a specific crop
- **NPK Radar Chart** — compares your soil vs ideal soil with specific adjustment advice

### 📊 Data & Analytics
- **Live Market Prices** — real-time crop prices from Agmarknet (data.gov.in)
- **Seasonal Calendar** — shows all planting seasons for each crop
- **Prediction History** — tracks last 10 predictions in a table
- **Jupyter Notebook** — full EDA + 5 model comparison

### 🌐 User Experience
- **6 Languages** — English, Hindi, Tamil, Telugu, Kannada, Malayalam
- **Dark Mode** — full dark theme support
- **Weather Auto-fill** — auto-fills temperature, humidity, rainfall from your location
- **PDF Export** — download complete analysis as professional PDF report
- **Model Retraining** — retrain all 3 models from dashboard without stopping server
- **Animations** — floating particles, wave header, animated progress bars

### 🐳 DevOps
- **Docker** — entire app runs with single `docker-compose up` command

---

## 🏗 Architecture
```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  Module Selection → Farm Input → Results Dashboard  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST API
┌──────────────────────▼──────────────────────────────┐
│                  Flask Backend API                   │
│   /predict-crop  /predict-soil  /predict-failure    │
│   /predict-harvest  /predict-fertilizer  /retrain   │
│   /market-price  /retrain-status                    │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   crop_model.pkl  risk_model.pkl  harvest_model.pkl
   (Random Forest) (Grad.Boosting) (Linear Regression)
```

---

## 🤖 ML Models

### Model 1 — Crop Recommendation (Random Forest)
- **Algorithm:** Random Forest Classifier (300 trees)
- **Features:** N, P, K, Temperature, Humidity, pH, Rainfall
- **Output:** Crop name + Confidence %
- **Accuracy:** 99%+
- **Explainability:** SHAP TreeExplainer

### Model 2 — Crop Failure Risk (Gradient Boosting)
- **Algorithm:** Gradient Boosting Classifier (200 estimators)
- **Features:** N, P, K, Temperature, Humidity, pH, Rainfall
- **Output:** Low / Medium / High + Confidence %
- **Accuracy:** 97%+

### Model 3 — Harvest Time (Linear Regression)
- **Algorithm:** Linear Regression
- **Features:** N, P, K, Temperature, Humidity, pH, Rainfall
- **Output:** Days to harvest + Season type
- **R² Score:** 0.90+

### Dataset
| Property | Value |
|----------|-------|
| Name | Crop Recommendation Dataset |
| Source | [Kaggle](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) |
| Original Records | 2,200 |
| Augmented Records | 3,700+ |
| Total Crop Types | 120+ |
| Features | 7 (N, P, K, Temperature, Humidity, pH, Rainfall) |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.11 | Core language |
| Flask 2.2 | REST API framework |
| Scikit-learn 1.2 | ML models |
| SHAP 0.42 | Explainable AI |
| Pandas / NumPy | Data processing |
| Joblib | Model serialization |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Bootstrap 5 | Styling |
| Chart.js 4 | Bar + Radar charts |
| Framer Motion | Animations |
| Axios | API calls |
| jsPDF | PDF generation |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/smart-agriculture-ai.git
cd smart-agriculture-ai
```

**2. Set up Python virtual environment**
```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
```

**3. Install Python dependencies**
```bash
pip install flask==2.2.5 flask-cors==4.0.0 werkzeug==2.2.3
pip install numpy==1.24.3 scipy==1.10.1 scikit-learn==1.2.2
pip install joblib==1.3.2 shap==0.42.1 pandas==2.0.3 requests
```

**4. Train the ML models**
```bash
python ml_models/train_model.py
```

**5. Start the Flask backend**
```bash
python backend/app.py
```

**6. Install and start React frontend**
```bash
cd frontend
npm install
npm start
```

**7. Open your browser**
```
http://localhost:3000
```

---

## 🐳 Docker Setup

Run the entire application with a single command:
```bash
docker-compose up --build
```

This starts:
- Flask backend on `http://localhost:5000`
- React frontend on `http://localhost:3000`

Stop everything:
```bash
docker-compose down
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/predict-crop` | Crop recommendation + SHAP |
| POST | `/predict-soil` | Soil health score |
| POST | `/predict-failure` | Crop failure risk |
| POST | `/predict-harvest` | Harvest time estimate |
| POST | `/predict-fertilizer` | Fertilizer recommendations |
| GET | `/market-price/<crop>` | Live mandi price |
| POST | `/retrain` | Trigger model retraining |
| GET | `/retrain-status` | Check retraining status |

### Example Request
```bash
curl -X POST http://localhost:5000/predict-crop \
  -H "Content-Type: application/json" \
  -d '{"N":90,"P":42,"K":43,"temperature":20,"humidity":82,"ph":6.5,"rainfall":200}'
```

### Example Response
```json
{
  "recommended_crop": "rice",
  "confidence": 99.31,
  "shap_values": {
    "N": 0.1823,
    "P": 0.0412,
    "K": 0.0387,
    "temperature": -0.0215,
    "humidity": 0.2341,
    "ph": 0.0892,
    "rainfall": 0.3124
  }
}
```

---

## 📁 Project Structure
```
smart-agriculture-ai/
│
├── backend/
│   ├── app.py                 # Flask API with all endpoints
│   ├── Dockerfile             # Backend container
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── src/
│   │   └── App.js             # Complete React dashboard
│   ├── public/
│   ├── Dockerfile             # Frontend container
│   └── package.json
│
├── ml_models/
│   ├── train_model.py         # Training script (3 models)
│   ├── crop_model.pkl         # Random Forest (crop)
│   ├── risk_model.pkl         # Gradient Boosting (risk)
│   └── harvest_model.pkl      # Linear Regression (harvest)
│
├── datasets/
│   └── Crop_recommendation.csv
│
├── notebooks/
│   └── crop_analysis.ipynb    # EDA + 5 model comparison
│
├── docker-compose.yml
└── README.md
```

---

## 👨‍💻 Author

**GB Abhilash**
- Course: MCA
- Domain: Agriculture AI
- Dataset: [Kaggle — Crop Recommendation](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset)

---

## 📄 License

This project is for academic purposes under MCA program.

---

<div align="center">

**Built with ❤️ using Python · React · Machine Learning · SHAP · Docker**

*Targeting SDG 2 (Zero Hunger) and SDG 15 (Life on Land)*

</div>