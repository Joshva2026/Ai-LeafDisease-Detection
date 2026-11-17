# LeafGuard AI - Complete Deployment Guide

## 📋 Overview

This guide covers deploying the **LeafGuard AI** plant disease detection system to production:

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Python Flask + TensorFlow)
- **Database**: SQLite (ephemeral on Render - consider PostgreSQL for production)

---

## 🏗️ Architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────┐
│   Frontend      │ ◄─────────────► │    Backend       │
│   (Vercel)      │   API Calls     │   (Render)       │
│                 │                 │                  │
│  React + Vite   │                 │  Flask + TF      │
│  Tailwind-like  │                 │  MobileNetV2     │
│  CSS Variables  │                 │  Grad-CAM        │
└─────────────────┘                 └──────────────────┘
```

---

## 🚀 Frontend Deployment (Vercel)

### 1. Prepare Repository

```bash
cd LeafDiseaseApp
npm install
npm run build
```

### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

**Option B: GitHub Integration**
1. Push to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project" → Import from GitHub
4. Select `LeafDiseaseApp` folder as root directory
5. Framework Preset: **Vite**
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Add Environment Variables (see below)

### 3. Environment Variables (Vercel Dashboard)

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Yes |

---

## 🐍 Backend Deployment (Render)

### 1. Prepare for Render

**Option A: Docker (Recommended)**
```bash
cd LeafDiseaseAPI
# Test locally first
docker build -t leafguard-api .
docker run -p 10000:10000 --env-file .env leafguard-api
```

**Option B: Native Python**
```bash
cd LeafDiseaseAPI
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:10000 --workers 1 --threads 2 app:app
```

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `leafguard-api` |
| **Root Directory** | `LeafDiseaseAPI` |
| **Runtime** | `Docker` (or Python 3.11) |
| **Build Command** | `pip install -r requirements.txt` (if not Docker) |
| **Start Command** | `gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 2 app:app` |
| **Instance Type** | `Starter` (or higher for ML) |
| **Auto-Deploy** | Yes |

### 3. Environment Variables (Render Dashboard)

| Variable | Value | Required |
|----------|-------|----------|
| `PORT` | `10000` | Auto-set |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` | Yes |
| `MODEL_PATH` | `model/leaf_disease_model.keras` | Yes |
| `DATABASE_PATH` | `database.db` | Yes |
| `NVIDIA_API_KEY` | `your-nvidia-key` | For AI reports |
| `NVIDIA_MODEL` | `nvidia/llama-3.1-nemotron-70b-instruct` | Optional |
| `GEMINI_API_KEY` | `your-gemini-key` | Optional fallback |

---

## 🔑 API Keys Setup

### NVIDIA NIM API Key (Primary AI)
1. Go to [NVIDIA Build](https://build.nvidia.com/)
2. Sign in / Create account
3. Navigate to "API Keys" → "Create Key"
4. Copy key to `NVIDIA_API_KEY` in Render

### Google Gemini API Key (Fallback)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API Key
3. Copy to `GEMINI_API_KEY` in Render

---

## 📱 Mobile App Build (Capacitor)

### Android APK/AAB

```bash
cd LeafDiseaseApp

# Install Capacitor CLI
npm install -g @capacitor/cli

# Build web assets
npm run build

# Add Android platform
npx cap add android

# Copy web assets
npx cap copy android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Choose **Android App Bundle (.aab)** for Play Store
3. Sign with your keystore

### iOS (macOS only)

```bash
npx cap add ios
npx cap copy ios
npx cap open ios
```

---

## ⚠️ Important Considerations

### 1. Model File Size
- The `.keras` model (~50-100MB) must be in `LeafDiseaseAPI/model/`
- For Render: Include in repo or download at build time
- For Docker: COPY in Dockerfile (increases image size)

### 2. Ephemeral Storage
- **Render free tier**: Filesystem is ephemeral
- Database (`database.db`) and uploads reset on deploy
- **Solutions**:
  - Use Render Disk (paid)
  - Use external PostgreSQL (Supabase, Neon, Railway)
  - Use S3/R2 for image storage

### 3. Cold Starts
- Render free tier spins down after 15 min inactivity
- First request takes 30-60s (TensorFlow loading)
- Frontend handles this with "waking up" UI
- Consider paid plan for always-on

### 4. CORS Configuration
```python
# In app.py - Update CORS_ORIGINS for production
CORS_ORIGINS = "https://your-app.vercel.app,https://www.yourdomain.com"
```

### 5. File Upload Limits
```python
# In app.py
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB
```

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

**.github/workflows/deploy.yml**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd LeafDiseaseApp && npm ci && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
        working-directory: LeafDiseaseApp

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        uses: render/deploy-action@v1
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads at `https://your-app.vercel.app`
- [ ] API health check: `https://your-api.onrender.com/health`
- [ ] Test scan with a leaf photo
- [ ] Verify AI Farmer Report generates (English + Tamil)
- [ ] Test Grad-CAM heatmap displays
- [ ] Test Text-to-Speech (TTS) in Tamil/English
- [ ] Test chatbot functionality
- [ ] Verify mobile responsive design
- [ ] Check offline/error handling
- [ ] Test RTL layout for Tamil

---

## 🐛 Troubleshooting

### Frontend: "Unable to reach analysis server"
- Check `VITE_API_URL` is correct
- Verify backend is deployed and healthy
- Check CORS headers in browser DevTools

### Backend: Model not loading
- Verify `MODEL_PATH` exists
- Check TensorFlow version compatibility
- Ensure enough memory (1GB+ for TF)

### AI Reports: Always fallback to offline
- Verify `NVIDIA_API_KEY` is set
- Check NVIDIA API quota
- Verify model name in `NVIDIA_MODEL`

### Tamil: Text shows as boxes
- Ensure system has Tamil fonts
- Use web-safe fallback in CSS

---

## 📊 Monitoring

### Render Metrics
- CPU/Memory usage
- Request latency
- Error rates

### Vercel Analytics
- Page views
- Core Web Vitals
- Function invocations

---

## 📞 Support

For issues:
1. Check Render logs: `Dashboard → Your Service → Logs`
2. Check Vercel logs: `Dashboard → Your Project → Functions`
3. Browser DevTools → Network tab for API errors

---

*Last updated: 2026*
*LeafGuard AI - Empowering farmers with AI plant health*