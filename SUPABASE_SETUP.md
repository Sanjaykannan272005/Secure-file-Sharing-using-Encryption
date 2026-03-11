# Connect to New Supabase Project

## Step 1: Create New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details and create

## Step 2: Run SQL Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste content from `supabase-setup.sql`
4. Click **Run**

This creates your 3 tables:
- `file_metadata`
- `temp_codes`
- `user_2fa`

## Step 3: Get Credentials

In Supabase Dashboard > Settings > API:

- **Project URL**: `https://xxxxx.supabase.co`
- **anon/public key**: `eyJhbGc...`

## Step 4: Update .env Files

### Backend (.env)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Step 5: Install & Run

```bash
cd backend
npm install
npm run dev
```

Done! Your app now uses the new Supabase database.
