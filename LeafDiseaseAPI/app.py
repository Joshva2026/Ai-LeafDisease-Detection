# ==========================================
# app.py : Leaf Disease Detection API
# ==========================================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import cv2
import matplotlib.cm as cm

# Initialize Flask App
app = Flask(__name__)
# Removed 10 MB limit to allow high-res images
CORS(app)

from routes.ai import ai_bp
app.register_blueprint(ai_bp)

# Initialize Rate Limiter
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["60 per minute"]
)

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "success": False,
        "error": "Rate limit exceeded. Please wait a moment before sending more requests."
    }), 429

@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({
        "success": False,
        "error": "File too large."
    }), 413

# Load .env file natively if it exists
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            if line.strip() and not line.startswith("#") and "=" in line:
                key, val = line.strip().split("=", 1)
                os.environ[key.strip()] = val.strip()

print("[OK] Running app.py from:", os.path.abspath(__file__))


# Model Load
MODEL_PATH = "model/leaf_disease_model.keras"

model = tf.keras.models.load_model(MODEL_PATH)
print("[OK] Model Loaded Successfully")

def find_last_conv_layer(model):
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
    for layer in reversed(model.layers):
        name = layer.name.lower()
        if 'conv' in name and 'bn' not in name and 'batch' not in name:
            return layer.name
    for layer in reversed(model.layers):
        if len(layer.output_shape) == 4:
            return layer.name
    raise ValueError("No convolutional layer found in the model.")

last_conv_layer_name = find_last_conv_layer(model)
grad_model = tf.keras.models.Model(
    inputs=model.input,
    outputs=[model.get_layer(last_conv_layer_name).output, model.output]
)
print("[OK] Grad-CAM Explainability Model Initialized")

# Classes

class_names = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]


UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# Home API

@app.route("/")
def home():
    return jsonify({
        "message": "🌿 Leaf Disease Detection API Running"
    })

import uuid

@app.route("/health")
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

def is_likely_leaf(img):
    # Convert PIL image to HSV
    img_hsv = img.convert("HSV")
    h, s, v = img_hsv.split()
    h_array = np.array(h)
    s_array = np.array(s)
    v_array = np.array(v)
    
    total_pixels = h_array.size
    
    # Relaxed check for green plant color index
    green_mask = (h_array >= 20) & (h_array <= 95) & (s_array > 25) & (v_array > 25)
    green_ratio = np.sum(green_mask) / total_pixels
    
    # Also check variance/edges to prevent plain green screens
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # Need some texture (variance) + some green color, or high texture if damaged
    if variance < 50.0:
        return False, "Image is too blurry or lacks structure."
    
    if green_ratio < 0.02 and variance < 200.0:
        return False, "The image does not appear to contain a plant leaf."
        
    return True, "Valid leaf"


def make_gradcam_heatmap(img_array, grad_model, pred_index=None):
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        class_channel = preds[:, pred_index]
    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0)
    max_val = tf.math.reduce_max(heatmap)
    if max_val > 0:
        heatmap = heatmap / max_val
    return heatmap.numpy()

def save_and_display_gradcam(img_path, heatmap, cam_path, alpha=0.4):
    img = cv2.imread(img_path)
    heatmap = np.uint8(255 * heatmap)
    import matplotlib
    jet = matplotlib.colormaps.get_cmap("jet")
    jet_colors = jet(np.arange(256))[:, :3]
    jet_colors = np.uint8(255 * jet_colors)
    colorized_heatmap = jet_colors[heatmap]
    colorized_heatmap = cv2.resize(colorized_heatmap, (img.shape[1], img.shape[0]))
    superimposed_img = colorized_heatmap * alpha + img
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)
    cv2.imwrite(cam_path, superimposed_img)


# Prediction API
@app.route("/predict", methods=["POST"])
@limiter.limit("20 per minute")
def predict():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image uploaded"}), 400

    file = request.files["image"]
    if file.filename == '':
        return jsonify({"success": False, "error": "No image selected"}), 400
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        return jsonify({"success": False, "error": "Unsupported file format. Please upload JPG, PNG, or WEBP."}), 400

    # Generate safe unique filename
    safe_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename) if file.filename else 'upload'}{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, safe_filename)
    file.save(filepath)

    try:
        # Load and verify image
        try:
            img = Image.open(filepath).convert("RGB")
            # Downscale large images immediately to save memory
            img.thumbnail((1024, 1024))
        except Exception as e:
            return jsonify({"success": False, "error": "Invalid or corrupted image file."}), 400
        
        # Leaf Heuristics Validation
        is_leaf, leaf_msg = is_likely_leaf(img)
        if not is_leaf:
            return jsonify({
                "success": False,
                "error": leaf_msg
            }), 400

        # Resize and process for deep model
        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Run model prediction
        prediction = model.predict(img_array)
        
        # Extract Top-3 predictions
        top_indices = np.argsort(prediction[0])[-3:][::-1]
        top_predictions = []
        for idx in top_indices:
            raw_class = class_names[idx]
            parts = raw_class.split('___')
            plant_name = parts[0].replace('_', ' ') if len(parts) > 1 else raw_class
            condition_name = parts[1].replace('_', ' ') if len(parts) > 1 else ""
            
            top_predictions.append({
                "disease": raw_class,
                "formatted_name": f"{plant_name} — {condition_name}" if condition_name else plant_name,
                "confidence": round(float(prediction[0][idx] * 100), 2)
            })

        primary_match = top_predictions[0]
        confidence = primary_match["confidence"]
        disease_raw = primary_match["disease"]
        
        parts = disease_raw.split('___')
        plant = parts[0].replace('_', ' ') if len(parts) > 1 else disease_raw
        disease_formatted = parts[1].replace('_', ' ') if len(parts) > 1 else ""
        is_healthy = "healthy" in disease_formatted.lower()
        health_status = "Healthy" if is_healthy else "Diseased"

        # Severity Estimation
        severity = "Healthy"
        if not is_healthy:
            if confidence > 90: severity = "Severe"
            elif confidence > 65: severity = "Moderate"
            else: severity = "Mild"

        # Confidence validation
        if confidence < 45.0:
            return jsonify({
                "success": False,
                "error": "Low prediction confidence. The image might not be a supported plant leaf."
            }), 400

        # Generate Grad-CAM image
        try:
            heatmap = make_gradcam_heatmap(img_array, grad_model, pred_index=int(top_indices[0]))
            gradcam_filename = f"gradcam_{safe_filename}"
            gradcam_path = os.path.join(UPLOAD_FOLDER, gradcam_filename)
            save_and_display_gradcam(filepath, heatmap, gradcam_path)
            gradcam_url = f"/uploads/{gradcam_filename}"
        except Exception as cam_err:
            print("Grad-CAM generation failed:", cam_err)
            gradcam_url = None

        # Save scan history to database
        username = request.form.get("username", "Guest")
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO scans (username, timestamp, filename, disease, confidence) VALUES (?, ?, ?, ?, ?)",
            (username, timestamp, safe_filename, disease_raw, confidence)
        )
        conn.commit()
        conn.close()

        # Try to delete original and gradcam image after generating base64 if needed, 
        # but we need to keep history working. History reads from UPLOAD_FOLDER so we keep it.
        # Alternatively, we rely on a cron/cleanup job. For now, we will leave it as per previous implementation to support history API.

        return jsonify({
            "success": True,
            "disease": disease_raw,  # preserve exact string for frontend compatibility
            "plant": plant,
            "health_status": health_status,
            "disease_formatted": disease_formatted if not is_healthy else "No disease detected",
            "severity": severity,
            "confidence": confidence,
            "top_predictions": top_predictions,
            "gradcam_url": gradcam_url,
            "original_url": f"/uploads/{safe_filename}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing image: {str(e)}"}), 500


@app.route("/uploads/<filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/api/image/get_base64/<filename>")
def get_image_base64(filename):
    import base64
    path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(path):
        try:
            with open(path, "rb") as f:
                encoded = base64.b64encode(f.read()).decode('utf-8')
                ext = os.path.splitext(filename)[1].lower().replace('.', '')
                mime = f"image/{ext}" if ext in ['png', 'jpg', 'jpeg', 'webp'] else "image/jpeg"
                return jsonify({"success": True, "base64": f"data:{mime};base64,{encoded}"})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
    return jsonify({"success": False, "error": "File not found"}), 404


# ==========================================
# SQLITE AUTHENTICATION & DATABASE
# ==========================================
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import requests

DATABASE_PATH = "database.db"

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            location TEXT,
            profile_image TEXT
        )
    """)
    # Run dynamic alters to prevent errors for pre-existing DBs
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN location TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
    except sqlite3.OperationalError:
        pass

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            timestamp TEXT NOT NULL,
            filename TEXT,
            disease TEXT NOT NULL,
            confidence REAL NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Initialize DB on load
init_db()

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    location = data.get("location", "")
    profile_image = data.get("profile_image", "")

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400

    hashed_pw = generate_password_hash(password)

    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password_hash, location, profile_image) VALUES (?, ?, ?, ?)",
            (username, hashed_pw, location, profile_image)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "User registered successfully"})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Username already exists"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400

    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, password_hash, location, profile_image FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[1], password):
            return jsonify({
                "success": True,
                "user": {
                    "id": user[0],
                    "username": username,
                    "location": user[2] or "",
                    "profile_image": user[3] or ""
                }
            })
        else:
            return jsonify({"success": False, "error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/auth/update", methods=["POST"])
def update_profile():
    data = request.json or {}
    username = data.get("username")
    location = data.get("location", "")
    profile_image = data.get("profile_image", "")

    if not username:
        return jsonify({"success": False, "error": "Username is required"}), 400

    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        if profile_image:
            cursor.execute(
                "UPDATE users SET location = ?, profile_image = ? WHERE username = ?",
                (location, profile_image, username)
            )
        else:
            cursor.execute(
                "UPDATE users SET location = ? WHERE username = ?",
                (location, username)
            )
        conn.commit()
        conn.close()

        # Fetch updated user info
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, location, profile_image FROM users WHERE username = ?", (username,))
        user_row = cursor.fetchone()
        conn.close()

        return jsonify({
            "success": True,
            "user": {
                "id": user_row[0],
                "username": username,
                "location": user_row[1] or "",
                "profile_image": user_row[2] or ""
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==========================================
# HISTORY LOGS ENDPOINT
# ==========================================
@app.route("/api/history", methods=["GET"])
def history():
    username = request.args.get("username", "Guest")
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        # Retrieve last 10 scans for this specific user
        cursor.execute(
            "SELECT timestamp, filename, disease, confidence FROM scans WHERE username = ? ORDER BY id DESC LIMIT 10",
            (username,)
        )
        rows = cursor.fetchall()
        conn.close()

        history_list = []
        for row in rows:
            filename = row[1]
            history_list.append({
                "timestamp": row[0],
                "filename": filename,
                "disease": row[2],
                "confidence": row[3],
                "original_url": "/uploads/" + filename,
                "gradcam_url": "/uploads/gradcam_" + filename
            })
        return jsonify({"success": True, "history": history_list})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==========================================
# NVIDIA & GEMINI AI INTEGRATION
# ==========================================
def call_nvidia_ai(user_prompt, system_prompt):
    nvidia_key = os.getenv("NVIDIA_API_KEY", "").strip()
    if not nvidia_key or nvidia_key in ("YOUR_NVIDIA_KEY_HERE", "YOUR_API_KEY_HERE"):
        return None

    try:
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {nvidia_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "meta/llama-3.1-70b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 1024
        }
        res = requests.post(url, json=payload, headers=headers, timeout=12)
        if res.status_code == 200:
            data = res.json()
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]["content"]
    except Exception as e:
        print("NVIDIA AI API request failed:", e)
    return None

def call_gemini_ai(user_prompt, system_prompt):
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not gemini_key or gemini_key in ("YOUR_API_KEY_HERE", ""):
        return None

    models = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"]
    for model_name in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent?key={gemini_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{system_prompt}\n\nUser Question: {user_prompt}"}]
                    }
                ]
            }
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                return res.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"Gemini model {model_name} failed:", e)
    return None


@app.route("/api/ai/farmer-report", methods=["POST"])
@limiter.limit("20 per minute")
def farmer_report():
    data = request.json or {}
    disease = data.get("disease", "")
    plant = data.get("plant", "")
    confidence = data.get("confidence", 0)
    lang = data.get("lang", "en")

    if not disease:
        return jsonify({"success": False, "error": "Disease identification is required"}), 400

    is_ta = (lang == "ta")

    if is_ta:
        system_prompt = (
            "You are LeafGuard AI Farmer Specialist. The user's crop was diagnosed by MobileNetV2. "
            "You MUST generate the entire report strictly in Tamil (தமிழ்). "
            "Never contradict the predicted disease or change confidence. "
            "Output clear, actionable agronomic advice including summary, symptoms, causes, immediate treatment, and prevention."
        )
        user_prompt = (
            f"பயிர்: {plant}, நோய்: {disease}, நம்பிக்கை: {confidence}%. "
            "இந்த நோய்க்கான விரிவான விவசாயி அறிக்கையை தமிழில் வழங்கவும்."
        )
    else:
        system_prompt = (
            "You are LeafGuard AI Farmer Specialist. The crop was diagnosed by MobileNetV2. "
            "Never contradict the predicted disease or change confidence. "
            "Output clear, structured agronomic advice including summary, symptoms, causes, immediate treatment, and prevention."
        )
        user_prompt = (
            f"Crop: {plant}, Condition: {disease}, Confidence: {confidence}%. "
            "Provide a detailed farmer advice report."
        )

    # Try NVIDIA AI first, then Gemini AI
    ai_reply = call_nvidia_ai(user_prompt, system_prompt)
    provider = "nvidia_ai"
    if not ai_reply:
        ai_reply = call_gemini_ai(user_prompt, system_prompt)
        provider = "gemini_ai"

    if ai_reply:
        return jsonify({
            "success": True,
            "provider": provider,
            "report": ai_reply
        })
    else:
        # Fallback offline structured report
        if is_ta:
            fallback_report = (
                f"🌾 **LeafGuard விவசாயி அறிக்கை (ஆஃப்லைன் பயன்முறை)**\n\n"
                f"**பயிற்சி கண்டறிதல்:** {plant} — {disease}\n"
                f"**நம்பிக்கை:** {confidence}%\n\n"
                "**உடனடி நடவடிக்கைகள்:**\n"
                "1. பாதிக்கப்பட்ட இலையை அகற்றி தனியாக வைக்கவும்.\n"
                "2. இலையின் மேல் தண்ணீர் தெளிப்பதைத் தவிர்க்கவும்.\n"
                "3. தேவைப்பட்டால் தாமிர அடிப்படையிலான பூசணக்கொல்லியைப் பயன்படுத்தவும்.\n"
                "4. கருவிகளைப் பயன்படுத்திய பின் கிருமி நீக்கம் செய்யவும்."
            )
        else:
            fallback_report = (
                f"🌾 **LeafGuard Agronomic Advisory (Offline Mode)**\n\n"
                f"**Diagnosed Condition:** {plant} — {disease}\n"
                f"**AI Confidence:** {confidence}%\n\n"
                "**Action Plan:**\n"
                "1. **Isolate infected leaves** immediately to block spore dispersion.\n"
                "2. **Water at the soil base** rather than sprinkling over leaves.\n"
                "3. **Apply recommended organic or copper-based fungicides** early in the morning.\n"
                "4. **Disinfect pruning shears** between plant cuts."
            )
        return jsonify({
            "success": True,
            "provider": "offline_rules",
            "report": fallback_report
        })


@app.route("/api/chat", methods=["POST"])
@limiter.limit("20 per minute")
def chat():
    data = request.json or {}
    message = data.get("message")
    context = data.get("context", "")
    lang = data.get("lang", "en")

    if not message:
        return jsonify({"success": False, "error": "Message content is required"}), 400

    is_ta = (lang == "ta")

    if is_ta:
        system_prompt = (
            "You are LeafGuard AI, an expert agricultural bot and plant pathologist. "
            "You MUST reply in Tamil (தமிழ்). "
            "Provide accurate, actionable, and helpful suggestions regarding leaf diseases, soil care, pesticides, and organic farming methods."
        )
    else:
        system_prompt = (
            "You are LeafGuard AI, an expert agricultural bot and plant pathologist. "
            "Provide accurate, actionable, and helpful suggestions regarding leaf diseases, soil care, pesticides, and organic farming methods."
        )

    if context:
        system_prompt += f" Context: Current diagnosed condition is '{context}'."

    # Try NVIDIA AI first
    reply = call_nvidia_ai(message, system_prompt)
    if not reply:
        # Fallback to Gemini AI
        reply = call_gemini_ai(message, system_prompt)

    if reply:
        return jsonify({"success": True, "reply": reply})

    # Offline expert fallback
    msg_lower = message.lower()
    if is_ta:
        reply = (
            "🌿 **LeafGuard AI உதவி (ஆஃப்லைன்):**\n\n"
            "உங்கள் பயிர் பாதுகாப்பு தொடர்பான கேள்விகளுக்கு பதில் அளிக்கத் தயார்.\n"
            "1. பாதிக்கப்பட்ட இலைகளை உடனடியாக அகற்றவும்.\n"
            "2. வேர்களுக்கு மட்டும் நீர் பாய்ச்சவும்.\n"
            "3. இயற்கை உரம் மற்றும் பூச்சிக்கொல்லிகளைப் பயன்படுத்தவும்."
        )
    else:
        if "rust" in msg_lower or "spot" in msg_lower or "blight" in msg_lower or "rot" in msg_lower:
            reply = (
                "🌿 **LeafGuard AI Assistant (Offline Mode):**\n\n"
                "1. **Isolate Affected Plants**: Remove diseased leaves immediately to prevent spore dispersion.\n"
                "2. **Water at the Soil Base**: Avoid overhead foliage sprinkler watering.\n"
                "3. **Targeted Treatment**: Apply copper or sulfur-based organic fungicides early in the morning."
            )
        else:
            reply = (
                "👋 **Welcome to LeafGuard AI Assistant!**\n\n"
                "I am ready to help you with plant pathology, soil care, and crop protection advice."
            )

    return jsonify({"success": True, "reply": reply})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )