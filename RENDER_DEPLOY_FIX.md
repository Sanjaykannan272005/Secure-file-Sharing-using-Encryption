# Render Deployment Fix

## Issue Fixed
Added missing "build" script to backend package.json

## Deploy Each Service Separately

### Backend Service
1. Create Web Service in Render
2. Connect GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Add all backend environment variables from RENDER_ENV_VARIABLES.md

### Frontend Service  
1. Create another Web Service
2. Connect same GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - Add all frontend environment variables from RENDER_ENV_VARIABLES.md

## Updated Files
- backend/package.json now has build script
- render.yaml updated with proper rootDir configuration