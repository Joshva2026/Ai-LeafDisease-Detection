# ==========================================
# app.py : Leaf Disease Detection API
# ==========================================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
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
CORS(app)

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

def is_likely_leaf(img):
    # Convert PIL image to HSV
    img_hsv = img.convert("HSV")
    h, s, v = img_hsv.split()
    h_array = np.array(h)
    s_array = np.array(s)
    v_array = np.array(v)
    
    total_pixels = h_array.size
    
    # Relaxed check for green plant color index
    # Green Hue is roughly 30 to 135 degrees -> 20 to 95 in PIL (0-255)
    # Saturation > 25 (filters out neutral grays/whites/blacks)
    # Value > 25 (filters out pitch black shadows)
    green_mask = (h_array >= 20) & (h_array <= 95) & (s_array > 25) & (v_array > 25)
    green_pixel_count = np.sum(green_mask)
    
    green_ratio = green_pixel_count / total_pixels
    return green_ratio > 0.05 # At least 5% of the image must contain green plant pixels


def find_last_conv_layer(model):
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
    # Fallback search if no standard conv class
    for layer in reversed(model.layers):
        name = layer.name.lower()
        if 'conv' in name and 'bn' not in name and 'batch' not in name:
            return layer.name
    # General fallback
    for layer in reversed(model.layers):
        if len(layer.output_shape) == 4: # Typically a 2D feature map
            return layer.name
    raise ValueError("No convolutional layer found in the model.")

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    grad_model = tf.keras.models.Model(
        inputs=model.input,
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )
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
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        # Load and verify image
        img = Image.open(filepath).convert("RGB")
        
        # Leaf Heuristics Validation
        if not is_likely_leaf(img):
            return jsonify({
                "success": False,
                "error": "The uploaded image does not appear to be a plant leaf. Please upload a clear crop leaf image."
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
            top_predictions.append({
                "disease": class_names[idx],
                "confidence": round(float(prediction[0][idx] * 100), 2)
            })

        primary_match = top_predictions[0]
        confidence = primary_match["confidence"]

        # Confidence validation (standard thresholding)
        if confidence < 45.0:
            return jsonify({
                "success": False,
                "error": "Low prediction confidence. The image might not be a supported plant leaf."
            }), 400

        disease = primary_match["disease"]

        # Generate Grad-CAM image
        try:
            last_conv_layer = find_last_conv_layer(model)
            heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer, pred_index=int(top_indices[0]))
            gradcam_filename = f"gradcam_{file.filename}"
            gradcam_path = os.path.join(UPLOAD_FOLDER, gradcam_filename)
            save_and_display_gradcam(filepath, heatmap, gradcam_path)
            gradcam_url = f"http://{request.host}/uploads/{gradcam_filename}"
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
            (username, timestamp, file.filename, disease, confidence)
        )
        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "disease": disease,
            "confidence": confidence,
            "top_predictions": top_predictions,
            "gradcam_url": gradcam_url,
            "original_url": f"http://{request.host}/uploads/{file.filename}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing image: {str(e)}"}), 500


@app.route("/uploads/<filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


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
            history_list.append({
                "timestamp": row[0],
                "filename": row[1],
                "disease": row[2],
                "confidence": row[3]
            })
        return jsonify({"success": True, "history": history_list})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==========================================
# GEMINI AI CHATBOT ROUTE
# ==========================================
@app.route("/api/chat", methods=["POST"])
@limiter.limit("20 per minute")
def chat():
    data = request.json or {}
    message = data.get("message")
    context = data.get("context", "") # E.g., current diagnosed disease info

    if not message:
        return jsonify({"success": False, "error": "Message content is required"}), 400

    gemini_api_key = os.getenv("GEMINI_API_KEY", "")

    # System instruction tailored for the agri-bot
    system_prompt = (
        "You are LeafGuard AI, an expert agricultural bot and plant pathologist. "
        "Provide accurate, actionable, and helpful suggestions regarding leaf diseases, "
        "soil care, pesticides, organic farming methods, and general crop health. "
        "Keep your advice clear, friendly, and structured. "
    )
    if context:
        system_prompt += f"Context: The user's plant was just diagnosed with '{context}'."

    if gemini_api_key:
        models_to_try = [
            "gemini-3.5-flash",
            "gemini-3.6-flash",
            "gemini-2.5-flash-lite",
            "gemini-1.5-flash"
        ]
        last_error = None
        for model_name in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent?key={gemini_api_key}"
                headers = {
                    "Content-Type": "application/json"
                }
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [
                                {"text": f"{system_prompt}\n\nUser Question: {message}"}
                            ]
                        }
                    ]
                }
                response = requests.post(url, json=payload, headers=headers, timeout=10)
                if response.status_code == 200:
                    reply = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return jsonify({"success": True, "reply": reply})
                else:
                    last_error = f"API Error ({response.status_code}) for model {model_name}: {response.text}"
            except Exception as e:
                last_error = f"Request error for model {model_name}: {str(e)}"
        
        return jsonify({
            "success": False,
            "error": f"All Gemini model attempts failed. Last error: {last_error}"
        }), 500
    else:
        # Fallback Mock/Static Response if Gemini API Key is not set yet
        msg_lower = message.lower()
        if "rust" in msg_lower or "spot" in msg_lower or "blight" in msg_lower or "rot" in msg_lower:
            reply = (
                "🌿 **LeafGuard Assistant (Offline Mode):**\n\n"
                "It looks like you are asking about a fungal/bacterial leaf disease (like Blight, Rot, or Spot).\n"
                "Here are some immediate recommendation rules:\n"
                "1. **Isolate Affected Plants**: Remove the diseased leaves immediately to prevent the spores from spreading.\n"
                "2. **Water at the Base**: Avoid overhead sprinkler watering. Wet leaves invite fungal growth.\n"
                "3. **Fungicide**: For severe infections, apply copper-based or sulfur-based fungicides early in the morning.\n"
                "4. **Sanitation**: Clean your pruning tools with rubbing alcohol between plants.\n\n"
                "*Configure your `GEMINI_API_KEY` in the environment to unlock full LLM-powered chats!*"
            )
        elif "fertilizer" in msg_lower or "soil" in msg_lower or "compost" in msg_lower:
            reply = (
                "🌱 **LeafGuard Assistant (Offline Mode):**\n\n"
                "For soil health and nourishment:\n"
                "- Use rich organic compost to enhance micro-nutrient availability.\n"
                "- Add balanced N-P-K fertilizer appropriate for your specific crop type (e.g. nitrogen for leafy growth, phosphorus for root development).\n\n"
                "*Configure your `GEMINI_API_KEY` to chat dynamically with the AI.*"
            )
        else:
            reply = (
                "👋 **Welcome to LeafGuard AI Assistant!**\n\n"
                "I can help you with plant care tips, pesticide choices, and disease treatments.\n\n"
                "*(Please set the `GEMINI_API_KEY` environment variable on the host computer to enable full AI chat capability!)*"
            )
        return jsonify({"success": True, "reply": reply})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )