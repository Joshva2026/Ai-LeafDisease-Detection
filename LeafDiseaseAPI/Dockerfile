FROM python:3.10-slim

# Install system dependencies required for OpenCV
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create uploads directories just in case
RUN mkdir -p uploads

# Command to run the gunicorn server on Render port with a longer timeout for ML models
CMD gunicorn -b 0.0.0.0:${PORT:-10000} --timeout 120 --workers 1 --threads 2 app:app
