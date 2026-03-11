# Database Migration: Supabase to SQLite

Your Supabase database is paused. This guide helps you migrate to local SQLite.

## What Was Done

1. **Created SQLite schema** (`backend/init-sqlite.sql`)
   - `file_metadata` table
   - `temp_codes` table  
   - `user_2fa` table

2. **Created database utility** (`backend/src/utils/database.js`)
   - SQLite connection and query helpers

3. **Updated file model** (`backend/src/models/file.js`)
   - Replaced in-memory storage with SQLite

4. **Added sqlite3 dependency** to `backend/package.json`

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database is Auto-Initialized

The database will be created automatically when you start the server.

### 3. Start Backend

```bash
npm run dev
```

## Database Location

- **File**: `backend/database.sqlite`
- **Schema**: `backend/init-sqlite.sql`

## Notes

- Your backup file contains Supabase auth tables (not needed with Firebase Auth)
- File storage remains in-memory (encrypted files in RAM)
- To persist files, configure S3/MinIO in `.env`

## Optional: View Database

Install SQLite browser:
```bash
# Windows
winget install DB.Browser.for.SQLite

# Or download from: https://sqlitebrowser.org/
```

Open `backend/database.sqlite` to view data.
