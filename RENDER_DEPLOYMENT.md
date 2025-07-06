# Render Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- Supabase project (free tier available)
- Firebase project setup

## Deployment Steps

## Setup Supabase Storage

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Go to Storage → Create bucket named `secure-files`
4. Set bucket to public or configure RLS policies
5. Get your project URL and API keys from Settings → API

### 1. Backend Deployment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `secure-file-sharing-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-jwt-secret
   URL_EXPIRATION_SECONDS=3600
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   JWT_SECRET=your-jwt-secret
   URL_EXPIRATION_SECONDS=3600
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

### 2. Frontend Deployment

1. Create another Web Service
2. Configure:
   - **Name**: `secure-file-sharing-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. Add Environment Variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
   ```

### 3. Update CORS Configuration

After deployment, update the backend's CORS_ORIGIN environment variable with your frontend URL.

## Important Notes

- Free tier services sleep after 15 minutes of inactivity
- Use environment variables for all sensitive data
- Update Firebase Auth domains to include your Render URLs
- Configure S3 bucket CORS policy for your frontend domain

## Troubleshooting

- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure Firebase service account key is properly formatted
- Test API endpoints after deployment