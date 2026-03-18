FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir \
    flask==2.2.5 \
    flask-cors==4.0.0 \
    werkzeug==2.2.3 \
    numpy==1.24.3 \
    scipy==1.10.1 \
    scikit-learn==1.2.2 \
    joblib==1.3.2 \
    shap==0.42.1 \
    pandas==2.0.3 \
    xgboost==1.7.6 \
    requests==2.31.0

COPY backend/app.py .
COPY ml_models/ ./ml_models/
COPY datasets/ ./datasets/

ENV BASE_DIR=/app

EXPOSE 5000

CMD ["python", "app.py"]