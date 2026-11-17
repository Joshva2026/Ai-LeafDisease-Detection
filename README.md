# 🌿 LeafGuard AI - Intelligent Plant Disease Detection

> **Empowering farmers with AI-powered plant health diagnostics. Built for village users with bilingual (English/Tamil) support, offline-first architecture, and explainable AI.**

[![Deploy Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel)](https://vercel.com)
[![Deploy Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

### 🎯 Core Detection
- **38 Plant Diseases** across 14 major crops (Tomato, Potato, Apple, Grape, etc.)
- **MobileNetV2** neural network optimized for mobile inference
- **Grad-CAM Heatmaps** - Visual explainability showing exactly where the AI looked
- **Real-time Camera** with leaf alignment guide for perfect captures

### 🤖 AI Farmer Advisory
- **NVIDIA NIM** powered structured agricultural reports
- **9-section reports**: Diagnosis, Summary, Symptoms, Causes, Immediate Actions, Treatment, Prevention, Monitoring, Farmer Advice
- **Tiered fallback**: NVIDIA → Gemini → Offline knowledge base (always works)
- **Bilingual**: Full English + Tamil support with Google Translate + NVIDIA translation

### 🌾 Village-Friendly Design
- **High contrast** colors for outdoor sunlight visibility
- **Large touch targets** (48px minimum) for thick fingers/gloves
- **RTL support** for Tamil script
- **Text-to-Speech** audio readout in Tamil & English
- **Offline-capable** with cached reports
- **System fonts only** - no external dependencies for slow connections

### 📱 Multi-Platform
- **Web App** - Vercel (React 19 + Vite 8)
- **Android App** - Capacitor (Google Play ready)
- **iOS App** - Capacitor (App Store ready)
- **PWA Support** - Installable on any device

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEAFGUARD AI                              │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND (LeafDiseaseApp)          BACKEND (LeafDiseaseAPI)    │
│  ┌─────────────────────────┐       ┌─────────────────────────┐  │
│  │ React 19 + Vite 8       │       │ Flask + TensorFlow 2.21 │  │
│  │ CSS Variables (Design)  │◄─────►│ MobileNetV2 (38 classes)│  │
│  │ Lucide React Icons      │  API  │ Grad-CAM Explainability │  │
│  │ Framer Motion           │       │ SQLite + Auth           │  │
│  │ Capacitor (Mobile)      │       │ NVIDIA NIM / Gemini     │  │
│  └─────────────────────────┘       └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker (optional)

### 1. Backend Setup
```bash
cd LeafDiseaseAPI
cp .env.example .env
# Edit .env with your API keys

# Option A: Docker (Recommended)
docker build -t leafguard-api .
docker run -p 10000:10000 --env-file .env leafguard-api

# Option B: Native
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:10000 --workers 1 --threads 2 app:app
```

### 2. Frontend Setup
```bash
cd LeafDiseaseApp
cp .env.example .env.local
# Edit VITE_API_URL to your backend URL

npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Mobile Build
```bash
cd LeafDiseaseApp
npm run build
npx cap add android
npx cap copy android
npx cap open android
# Build APK/AAB in Android Studio
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd LeafDiseaseApp
npm run build
vercel --prod
```
Set `VITE_API_URL` in Vercel dashboard.

### Backend → Render
1. Connect GitHub repo
2. Root Directory: `LeafDiseaseAPI`
3. Runtime: Docker
4. Add environment variables (see `.env.example`)

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.

---

## 📁 Project Structure

```
Leaf Disease Prediction/
├── LeafDiseaseApp/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar/          # Desktop + Mobile nav
│   │   │   ├── Chatbot/         # AI chat assistant
│   │   │   ├── Footer/          # Village-friendly footer
│   │   │   └── Onboarding/      # First-time user guide
│   │   ├── pages/               # Page components
│   │   │   ├── Home/            # Landing with journey
│   │   │   ├── Scan/            # Camera + Upload + AI
│   │   │   ├── Diagnosis/       # Results + Grad-CAM + TTS
│   │   │   ├── History/         # Past scans timeline
│   │   │   ├── MyPlants/        # Plant collection
│   │   │   ├── PlantGuide/      # Disease encyclopedia
│   │   │   ├── Profile/         # User settings
│   │   │   └── About/           # Tech documentary
│   │   ├── data/                # Translations, disease data
│   │   ├── styles/              # CSS Variables + Global
│   │   └── utils/               # Helpers (compression, URLs)
│   ├── public/models/           # TFLite model (mobile)
│   └── vite.config.js
│
├── LeafDiseaseAPI/              # Backend (Flask + TF)
│   ├── app.py                   # Main Flask app
│   ├── routes/                  # API routes
│   │   └── ai.py               # AI Farmer Report endpoints
│   ├── services/                # AI integrations
│   │   ├── nvidia_service.py   # NVIDIA NIM
│   │   ├── gemini_service.py   # Google Gemini
│   │   └── google_translate.py # Translation
│   ├── utils/                   # Validators, disease data
│   ├── model/                   # Trained .keras model
│   ├── Dockerfile
│   └── requirements.txt
│
├── DEPLOYMENT.md                # Complete deployment guide
└── README.md
```

---

## 🎨 Design System

### Village-Friendly Principles
| Principle | Implementation |
|-----------|----------------|
| **Sunlight Readable** | High contrast (#fff on #0b1209), no low-contrast grays |
| **Large Touch Targets** | 48px minimum, 56px comfortable |
| **Bilingual First** | All strings in `translations.js` with Tamil |
| **RTL Support** | `dir="rtl"` for Tamil, mirrored layouts |
| **Offline Ready** | Cached reports, graceful degradation |
| **No External Fonts** | System font stack only |
| **Audio Accessibility** | TTS with Tamil/English voice selection |

### CSS Variables (Key Tokens)
```css
:root {
  --primary: #22c55e;           /* Vibrant green for actions */
  --primary-dark: #14532d;      /* Text on primary */
  --bg-primary: #0b1209;        /* Deep earth black */
  --touch-min: 48px;            /* Minimum touch target */
  --touch-comfortable: 56px;    /* Comfortable touch target */
  --radius-lg: 30px;            /* Friendly rounded corners */
}
```

---

## 🤖 AI Integration

### Farmer Report Pipeline
```
User Scan → Backend Prediction → 
  Tier 1: NVIDIA NIM (llama-3.1-nemotron-70b) → 
  Tier 2: Google Gemini Flash → 
  Tier 3: Curated Offline Knowledge Base
→ Structured 9-Key JSON → Tamil Translation → Frontend
```

### Supported Languages
- **English** (Primary)
- **Tamil** (தமிழ்) - Full UI + AI Reports + TTS

### Translation Quality
- Google Translate API (primary)
- NVIDIA NIM with Tamil prompts (fallback)
- Strict validation: No Devanagari/Chinese/Japanese/Korean/Arabic contamination
- Scientific names preserved in English

---

## 📊 Supported Crops & Diseases

| Crop | Diseases | Healthy |
|------|----------|---------|
| Tomato | 10 (Blight, Spot, Virus, Mold, Mites) | ✓ |
| Potato | 2 (Early/Late Blight) | ✓ |
| Apple | 3 (Scab, Black Rot, Cedar Rust) | ✓ |
| Grape | 3 (Black Rot, Esca, Leaf Blight) | ✓ |
| Corn | 3 (Gray Spot, Rust, Northern Blight) | ✓ |
| Pepper | 1 (Bacterial Spot) | ✓ |
| ... | ... | ... |

**Total**: 38 classes across 14 crops

---

## 🔧 Configuration

### Frontend (.env.local)
```env
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (.env)
```env
PORT=10000
CORS_ORIGINS=https://your-frontend.vercel.app
MODEL_PATH=model/leaf_disease_model.keras
DATABASE_PATH=database.db
NVIDIA_API_KEY=your-key
NVIDIA_MODEL=nvidia/llama-3.1-nemotron-70b-instruct
GEMINI_API_KEY=your-key (optional)
```

---

## 🧪 Testing

```bash
# Frontend
cd LeafDiseaseApp
npm run lint

# Backend
cd LeafDiseaseAPI
python -m pytest test_api.py -v
```

---

## 📱 Mobile App Store

### Android (Google Play)
1. `npx cap build android`
2. Generate signed AAB in Android Studio
3. Upload to Play Console

### iOS (App Store)
1. `npx cap build ios`
2. Archive in Xcode
3. Upload to App Store Connect

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style
- ESLint + Prettier (Frontend)
- Black + isort (Backend)
- Conventional Commits

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **PlantVillage Dataset** - Training data for 38 disease classes
- **MobileNetV2** - Efficient mobile neural architecture
- **Grad-CAM** - Visual explainability method
- **NVIDIA NIM** - Production AI inference
- **Google Gemini** - Fallback AI service
- **Farmers of Tamil Nadu** - Inspiration for village-friendly design

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@leafguard.ai

---

<div align="center">

**Built with 💚 for farmers everywhere**

*LeafGuard AI - Your Pocket Plant Doctor*

</div>