# Quick Start Guide

## Prerequisites
- Node.js (v14+)
- npm

## Step 1: Setup Supabase Database

1. Go to https://supabase.com/dashboard/project/hvmqrdweipuanxffmngg
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Create tables
CREATE TABLE IF NOT EXISTS public.file_metadata (
    id TEXT PRIMARY KEY NOT NULL,
    original_name TEXT NOT NULL,
    original_type TEXT,
    original_size BIGINT,
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_id TEXT NOT NULL,
    owner_email TEXT,
    sharing_link JSONB,
    scan_result JSONB
);

CREATE TABLE IF NOT EXISTS public.temp_codes (
    id SERIAL PRIMARY KEY,
    email TEXT,
    phone TEXT,
    code TEXT NOT NULL,
    file_id TEXT,
    type TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.user_2fa (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    totp_secret TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    enabled_at TIMESTAMP WITH TIME ZONE,
    disabled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_file_metadata_owner ON public.file_metadata(owner_id);
CREATE INDEX IF NOT EXISTS idx_temp_codes_file ON public.temp_codes(file_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_user ON public.user_2fa(user_id);
```

5. Click **Run** (or press Ctrl+Enter)

## Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:3001

## Step 5: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:3000

## Done!

Open http://localhost:3000 in your browser.

## Troubleshooting

**Port already in use?**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Database connection error?**
- Check Supabase credentials in `.env` files
- Verify SQL tables were created successfully
