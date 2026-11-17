# ==========================================
# app.py : Leaf Disease Detection API
# Production-ready for Render + Vercel deployment
# ==========================================

import os
import sys
import sqlite3
import uuid
import datetime
import traceback

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Lazy TensorFlow import — only load when prediction is actually needed.
# This prevents cold-start failures on serverless platforms (Vercel/Render)
# where the model file may exceed size limits or cause timeouts.
tf = None
np = None
Image = None
cv2 = None
cm = None
model = None
grad_model = None
last_conv_layer_name = None
_model_loading = False
_model_load_error = None

app = Flask(__name__)

# ── CORS ──────────────────────────────────────────────────────────────────
# Allow the deployed frontend (Vercel) + localhost dev.  Update with your
# production domain(s) as needed.
_cors_origins = os.getenv("CORS_ORIGINS", "*")
CORS(app, resources={r"/*": {"origins": _cors_origins.split(",") if _cors_origins != "*" else "*"}})

# ── Register AI blueprint ─────────────────────────────────────────────────
from routes.ai import ai_bp
app.register_blueprint(ai_bp)

# ── Rate Limiter ──────────────────────────────────────────────────────────
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per minute"],
    storage_uri="memory://"
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

# ── Load .env natively ────────────────────────────────────────────────────
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

print("[OK] Running app.py from:", os.path.abspath(__file__))

# ── Configuration ─────────────────────────────────────────────────────────
MODEL_PATH = os.getenv("MODEL_PATH", "model/leaf_disease_model.keras")
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
DATABASE_PATH = os.getenv("DATABASE_PATH", "database.db")

# Max content length: 16 MB (override via env if needed)
try:
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", "16777216"))
except ValueError:
    app.config["MAX_CONTENT_LENGTH"] = 16777216

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── Ensure database tables exist ──────────────────────────────────────────
def init_db():
    try:
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
        for col_def in ["location TEXT", "profile_image TEXT"]:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_def}")
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
        print("[OK] Database initialized")
    except Exception as e:
        print(f"[WARN] Database init failed: {e}")

init_db()

# ── Lazy model loader ────────────────────────────────────────────────────
def _load_model():
    """Load TensorFlow model lazily on first prediction request."""
    global tf, np, Image, cv2, cm, model, grad_model, last_conv_layer_name, _model_loading, _model_load_error

    if model is not None:
        return True
    if _model_load_error:
        return False
    if _model_loading:
        return False  # Already loading, wait

    _model_loading = True
    try:
        import tensorflow as tf_mod
        import numpy as np_mod
        from PIL import Image as Image_mod
        import cv2 as cv2_mod
        import matplotlib.cm as cm_mod

        tf = tf_mod
        np = np_mod
        Image = Image_mod
        cv2 = cv2_mod
        cm = cm_mod

        if not os.path.exists(MODEL_PATH):
            _model_load_error = f"Model file not found at {MODEL_PATH}"
            print(f"[WARN] {_model_load_error}")
            return False

        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"[OK] Model loaded from {MODEL_PATH}")

        last_conv_layer_name = _find_last_conv_layer(model)
        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[model.get_layer(last_conv_layer_name).output, model.output]
        )
        print("[OK] Grad-CAM explainability model initialized")
        return True
    except Exception as e:
        _model_load_error = str(e)
        print(f"[WARN] Model loading failed: {e}")
        traceback.print_exc()
        return False
    finally:
        _model_loading = False

def _find_last_conv_layer(model_obj):
    for layer in reversed(model_obj.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
    for layer in reversed(model_obj.layers):
        name = layer.name.lower()
        if 'conv' in name and 'bn' not in name and 'batch' not in name:
            return layer.name
    for layer in reversed(model_obj.layers):
        if len(layer.output_shape) == 4:
            return layer.name
    raise ValueError("No convolutional layer found in the model.")

# ── Class names (38 PlantVillage classes) ─────────────────────────────────
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

# ── Routes ────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({
        "message": "🌿 Leaf Disease Detection API Running",
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    })

@app.route("/health")
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model_loading_error": _model_load_error
    })

# ── Leaf quality gate ────────────────────────────────────────────────────

def is_likely_leaf(img):
    """Validate that the uploaded image is actually a plant leaf."""
    import cv2 as cv2_mod
    import numpy as np_mod

    img_small = img.resize((224, 224))
    img_cv = cv2_mod.cvtColor(np_mod.array(img_small), cv2_mod.COLOR_RGB2BGR)
    gray = cv2_mod.cvtColor(img_cv, cv2_mod.COLOR_BGR2GRAY)

    # 1. Exposure / Luminance
    mean_lum = float(np_mod.mean(gray))
    if mean_lum < 22.0:
        return False, "The image is too dark. Please take a photo with adequate lighting. / படம் மிகவும் இருட்டாக உள்ளது. போதுமான வெளிச்சத்தில் படம் எடுக்கவும்."
    if mean_lum > 248.0:
        return False, "The image is washed out by glare. Please retake the photo without direct flash. / படம் அதிக வெளிச்சமாக உள்ளது."

    # 2. Blur detection
    variance = float(cv2_mod.Laplacian(gray, cv2_mod.CV_64F).var())
    if variance < 25.0:
        return False, "The image is too blurry. Please hold steady and focus on the leaf. / படம் மிகவும் மங்கலாக உள்ளது. தெளிவாகப் படமெடுக்கவும்."

    # 3. Human skin / face detection
    ycrcb = cv2_mod.cvtColor(img_cv, cv2_mod.COLOR_BGR2YCrCb)
    skin_mask = cv2_mod.inRange(ycrcb, np_mod.array([0, 133, 77]), np_mod.array([255, 173, 127]))
    skin_ratio = cv2_mod.countNonZero(skin_mask) / (224 * 224)

    hsv = cv2_mod.cvtColor(img_cv, cv2_mod.COLOR_BGR2HSV)
    lower_green = np_mod.array([25, 35, 35])
    upper_green = np_mod.array([95, 255, 255])
    mask_green = cv2_mod.inRange(hsv, lower_green, upper_green)

    lower_yellow = np_mod.array([14, 70, 50])
    upper_yellow = np_mod.array([35, 255, 255])
    mask_yellow = cv2_mod.inRange(hsv, lower_yellow, upper_yellow)

    lower_dark_brown = np_mod.array([8, 60, 25])
    upper_dark_brown = np_mod.array([24, 255, 160])
    mask_dark_brown = cv2_mod.inRange(hsv, lower_dark_brown, upper_dark_brown)

    mask_plant = cv2_mod.bitwise_or(mask_green, cv2_mod.bitwise_or(mask_yellow, mask_dark_brown))
    total_pixels = 224 * 224
    plant_ratio = cv2_mod.countNonZero(mask_plant) / total_pixels

    if skin_ratio > 0.45 and np_mod.mean(mask_green) < 0.05 and plant_ratio < 0.15:
        return False, "The image appears to contain human skin or a portrait rather than plant foliage. Please photograph only the crop leaf. / இது மனிதர் அல்லது தோல் படமாக உள்ளது. பயிர் இலையை மட்டும் படம் எடுக்கவும்."

    if plant_ratio < 0.06:
        return False, "🌿 No plant foliage detected. Please capture a clear, close-up photo of the affected plant leaf. / 🌿 இது இலை படம் போல தெரியவில்லை. நோய் பாதிக்கப்பட்ட அல்லது ஆரோக்கியமான தாவர இலையை மட்டும் தெளிவாக படம் எடுத்து மீண்டும் முயற்சி செய்யுங்கள்."

    num_labels, labels, stats, centroids = cv2_mod.connectedComponentsWithStats(mask_plant, connectivity=8)
    if num_labels > 1:
        max_area = max(stats[1:, cv2_mod.CC_STAT_AREA])
        if max_area / total_pixels < 0.025:
            return False, "🌿 The detected foliage is too small or scattered. Please position the leaf centrally in the frame. / 🌿 இலை மிகச்சிறியதாக உள்ளது. இலையை மையத்தில் வைத்து தெளிவாக படம் எடுக்கவும்."

    return True, "Valid leaf"

# ── Grad-CAM ─────────────────────────────────────────────────────────────

def make_gradcam_heatmap(img_array, grad_model, pred_index=None):
    import tensorflow as tf_mod
    with tf_mod.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf_mod.argmax(preds[0])
        class_channel = preds[:, pred_index]
    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf_mod.reduce_mean(grads, axis=(0, 1, 2))
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf_mod.newaxis]
    heatmap = tf_mod.squeeze(heatmap)
    heatmap = tf_mod.maximum(heatmap, 0)
    max_val = tf_mod.math.reduce_max(heatmap)
    if max_val > 0:
        heatmap = heatmap / max_val
    return heatmap.numpy()

def save_and_display_gradcam(img_path, heatmap, cam_path, alpha=0.4):
    import cv2 as cv2_mod
    import numpy as np_mod
    import matplotlib
    img = cv2_mod.imread(img_path)
    heatmap = np_mod.uint8(255 * heatmap)
    jet = matplotlib.colormaps.get_cmap("jet")
    jet_colors = jet(np.arange(256))[:, :3]
    jet_colors = np_mod.uint8(255 * jet_colors)
    colorized_heatmap = jet_colors[heatmap]
    colorized_heatmap = cv2_mod.resize(colorized_heatmap, (img.shape[1], img.shape[0]))
    superimposed_img = colorized_heatmap * alpha + img
    superimposed_img = np_mod.clip(superimposed_img, 0, 255).astype(np_mod.uint8)
    cv2_mod.imwrite(cam_path, superimposed_img)

# ── Prediction endpoint ──────────────────────────────────────────────────

@app.route("/predict", methods=["POST"])
@limiter.limit("20 per minute")
def predict():
    # Lazy-load model on first request
    if not _load_model():
        return jsonify({
            "success": False,
            "error": "AI model is not available on this server. Please contact support."
        }), 503

    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image uploaded"}), 400

    file = request.files["image"]
    if file.filename == '':
        return jsonify({"success": False, "error": "No image selected"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        return jsonify({"success": False, "error": "Unsupported file format. Please upload JPG, PNG, or WEBP."}), 400

    safe_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename) if file.filename else 'upload'}{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, safe_filename)

    try:
        file.save(filepath)

        try:
            img = Image.open(filepath).convert("RGB")
            img.thumbnail((1024, 1024))
        except Exception:
            return jsonify({"success": False, "error": "Invalid or corrupted image file."}), 400

        is_leaf, leaf_msg = is_likely_leaf(img)
        if not is_leaf:
            return jsonify({"success": False, "error": leaf_msg}), 400

        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array, verbose=0)

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

        severity = "Healthy"
        if not is_healthy:
            if confidence > 90: severity = "Severe"
            elif confidence > 65: severity = "Moderate"
            else: severity = "Mild"

        top_diff = (prediction[0][top_indices[0]] - prediction[0][top_indices[1]]) * 100 if len(top_indices) > 1 else confidence

        if confidence < 50.0:
            return jsonify({
                "success": False,
                "error": f"Low prediction confidence ({confidence}%). The image might not clearly match any of the 38 supported crop leaf conditions, or may be out of focus. / போதுமான உறுதியுடன் இலை நோயை கண்டறிய முடியவில்லை ({confidence}%). ஆதரிக்கப்படும் தாவர இலையை தெளிவாக படம் எடுக்கவும்."
            }), 400

        if confidence < 60.0 and top_diff < 7.5:
            return jsonify({
                "success": False,
                "error": f"Ambiguous condition detected between {top_predictions[0]['formatted_name']} ({confidence}%) and {top_predictions[1]['formatted_name']} ({top_predictions[1]['confidence']}%). Please capture the leaf closer under uniform lighting."
            }), 400

        gradcam_url = None
        try:
            heatmap = make_gradcam_heatmap(img_array, grad_model, pred_index=int(top_indices[0]))
            gradcam_filename = f"gradcam_{safe_filename}"
            gradcam_path = os.path.join(UPLOAD_FOLDER, gradcam_filename)
            save_and_display_gradcam(filepath, heatmap, gradcam_path)
            gradcam_url = f"/uploads/{gradcam_filename}"
        except Exception as cam_err:
            print("Grad-CAM generation failed:", cam_err)

        username = request.form.get("username", "Guest")
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO scans (username, timestamp, filename, disease, confidence) VALUES (?, ?, ?, ?, ?)",
                (username, timestamp, safe_filename, disease_raw, confidence)
            )
            conn.commit()
            conn.close()
        except Exception as db_err:
            print("DB save failed:", db_err)

        return jsonify({
            "success": True,
            "disease": disease_raw,
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


# ── Auth & Database (same as before, with init_db already called) ─────────

from werkzeug.security import generate_password_hash, check_password_hash

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


@app.route("/api/history", methods=["GET"])
def history():
    username = request.args.get("username", "Guest")
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"[OK] Starting Leaf Disease API Server on http://0.0.0.0:{port}")
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
