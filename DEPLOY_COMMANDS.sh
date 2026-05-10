#!/bin/bash
# =============================================================
#   AI Knowledge Extractor — Render Deployment Commands
# =============================================================

# ── STEP 1: Initialize Git & push to GitHub ──────────────────

cd ai-knowledge-extractor

git init
git add .
git commit -m "Initial commit: AI Knowledge Extractor"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-knowledge-extractor.git
git branch -M main
git push -u origin main


# ── STEP 2: Install Render CLI ────────────────────────────────

npm install -g @render-com/cli
# or on Mac:
brew install render


# ── STEP 3: Login to Render ───────────────────────────────────

render login


# ── STEP 4: Deploy using render.yaml (Blueprint) ─────────────

render blueprint launch
# This reads render.yaml and deploys BOTH services at once.
# When prompted, set ANTHROPIC_API_KEY for the backend service.


# ── STEP 5: Check deployment status ──────────────────────────

render services list
render logs --service ai-knowledge-extractor-api --tail
render logs --service ai-knowledge-extractor-frontend --tail


# ── STEP 6: Update environment variables ─────────────────────

render env set ANTHROPIC_API_KEY=sk-ant-XXXXXX \
  --service ai-knowledge-extractor-api


# ── STEP 7: Manual deploy trigger (after code changes) ───────

git add .
git commit -m "Update: your change description"
git push origin main
# Render auto-deploys on every push to main!


# ── STEP 8: Verify deployment ─────────────────────────────────

# Replace with your actual Render URLs:
curl https://ai-knowledge-extractor-api.onrender.com/health
# Expected: {"service": "AI Knowledge Extractor", "status": "healthy"}


# ── LOCAL DEVELOPMENT (quick reference) ──────────────────────

# Terminal 1 — Backend:
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
ANTHROPIC_API_KEY=your_key_here python app.py

# Terminal 2 — Frontend:
cd frontend
npm install
npm start
# → Open http://localhost:3000


# ── USEFUL RENDER CLI COMMANDS ────────────────────────────────

render services list                    # List all services
render service info --name my-service   # Service details
render deploy --service my-service      # Trigger manual deploy
render logs --service my-service        # View logs
render shell --service my-service       # SSH into service
render env list --service my-service    # List env vars
