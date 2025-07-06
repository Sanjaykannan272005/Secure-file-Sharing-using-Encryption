# Pre-Deployment Checklist

## Before Deploying to Render

### 1. Code Preparation
- [ ] Push all code to GitHub repository
- [ ] Ensure both frontend and backend have proper package.json files
- [ ] Test locally with production-like environment variables

### 2. External Services Setup
- [ ] Supabase project created (database only, free tier)
- [ ] Firebase project setup with Authentication enabled
- [ ] Firebase service account key generated

### 3. Environment Variables Ready
- [ ] Supabase credentials (URL, anon key for database)
- [ ] Firebase configuration
- [ ] JWT secret generated
- [ ] CORS origins planned

### 4. Render Account
- [ ] Render account created
- [ ] GitHub repository connected

## Quick Deploy Commands

For manual deployment testing:

```bash
# Backend
cd backend
npm install
npm start

# Frontend  
cd frontend
npm install
npm run build
npm start
```

## Post-Deployment
- [ ] Test file upload functionality
- [ ] Verify authentication flow
- [ ] Check CORS configuration
- [ ] Test file sharing links