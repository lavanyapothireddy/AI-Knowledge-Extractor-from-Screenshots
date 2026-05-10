# 🧠 AI Knowledge Extractor from Screenshots

> Extract insights, text, data, and code from any screenshot using Claude AI Vision.

![Tech Stack](https://img.shields.io/badge/Claude-AI%20Vision-7c3aed?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-3.1-green?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square)

---

## ✨ Features

- **6 Extraction Modes**: Full Analysis, Text Only, Summary, JSON Output, Code Extract, Custom Prompt
- **Drag & Drop or Paste** screenshots directly (Ctrl+V)
- **Rendered Markdown** output with syntax highlighting
- **Batch Processing** — up to 5 screenshots at once
- **Download Results** as `.md` or `.json`
- **Token Usage Tracking**
- **Powered by Claude claude-opus-4-5** (best vision model)

---

## 🗂️ Project Structure

```
ai-knowledge-extractor/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Environment variables template
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js / Header.css
│   │   │   ├── ImageDropzone.js / ImageDropzone.css
│   │   │   ├── ExtractionOptions.js / ExtractionOptions.css
│   │   │   └── ResultDisplay.js / ResultDisplay.css
│   │   ├── pages/
│   │   │   ├── ExtractorPage.js
│   │   │   └── ExtractorPage.css
│   │   ├── App.js / App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.example
│
├── render.yaml                # Render deployment config
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-knowledge-extractor.git
cd ai-knowledge-extractor
```

### 2. Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Linux/Mac
# venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the backend
python app.py
# → Runs on http://localhost:5000
```

### 3. Frontend setup (new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Copy env example
cp .env.example .env
# Leave REACT_APP_API_URL empty for local (proxy in package.json handles it)

# Start frontend
npm start
# → Runs on http://localhost:3000
```

---

## ☁️ Deploy on Render

### Method 1: One-Click with render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` and creates both services
5. Set `ANTHROPIC_API_KEY` in the backend service's Environment Variables
6. Click **Apply** — both services deploy automatically!

---

### Method 2: Manual Deployment (Step-by-Step)

#### Deploy Backend (Flask API)

```bash
# 1. Log in to Render and create a new Web Service
# 2. Connect your GitHub repo
# 3. Configure:
#    - Name: ai-knowledge-extractor-api
#    - Runtime: Python 3
#    - Root Directory: backend
#    - Build Command: pip install -r requirements.txt
#    - Start Command: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
#
# 4. Add Environment Variables:
#    ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxx
#    FLASK_ENV = production
#
# 5. Click "Create Web Service"
# → Your API will be at: https://ai-knowledge-extractor-api.onrender.com
```

#### Deploy Frontend (React)

```bash
# 1. Create another new Web Service on Render
# 2. Configure:
#    - Name: ai-knowledge-extractor-frontend
#    - Runtime: Static Site
#    - Root Directory: frontend
#    - Build Command: npm install && npm run build
#    - Publish Directory: build
#
# 3. Add Environment Variables:
#    REACT_APP_API_URL = https://ai-knowledge-extractor-api.onrender.com
#
# 4. Add Redirect/Rewrite Rules:
#    Source: /*   Destination: /index.html   Action: Rewrite
#
# 5. Click "Create Static Site"
# → Your app will be at: https://ai-knowledge-extractor-frontend.onrender.com
```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic API key |
| `FLASK_ENV` | No | `development` or `production` |
| `PORT` | No | Port number (default: 5000) |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | Production only | Backend URL (e.g. `https://api.onrender.com`) |

---

## 📡 API Endpoints

### `GET /health`
Health check endpoint.

### `POST /api/extract`
Extract knowledge from a single screenshot.

**Form Data:**
| Field | Type | Description |
|---|---|---|
| `file` | File | Image file (PNG/JPG/WEBP/GIF/BMP) |
| `extraction_type` | String | `full`, `text`, `summary`, `structured`, `code`, `custom` |
| `custom_prompt` | String | Required when `extraction_type=custom` |

**Response:**
```json
{
  "success": true,
  "result": "Extracted content...",
  "extraction_type": "full",
  "filename": "screenshot.png",
  "tokens_used": 1234,
  "model": "claude-opus-4-5"
}
```

### `POST /api/batch-extract`
Extract from up to 5 screenshots simultaneously.

---

## 🧪 Test the API

```bash
# Health check
curl https://your-api.onrender.com/health

# Extract from screenshot
curl -X POST https://your-api.onrender.com/api/extract \
  -F "file=@screenshot.png" \
  -F "extraction_type=full"
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| AI Vision | Anthropic Claude claude-opus-4-5 |
| Backend | Python, Flask, Flask-CORS |
| Frontend | React 18, react-dropzone, react-markdown |
| Deployment | Render (Python + Static Site) |
| Fonts | Syne + Space Mono |

---

## 📄 License

MIT License — free to use and modify.
