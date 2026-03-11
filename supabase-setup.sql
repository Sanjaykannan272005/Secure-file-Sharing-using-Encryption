-- Run this in your new Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- Table: file_metadata
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

-- Table: temp_codes
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

-- Table: user_2fa
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_file_metadata_owner ON public.file_metadata(owner_id);
CREATE INDEX IF NOT EXISTS idx_temp_codes_file ON public.temp_codes(file_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_user ON public.user_2fa(user_id);

-- Enable Row Level Security
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file_metadata
CREATE POLICY "Users can view own files" ON public.file_metadata
    FOR SELECT USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can insert own files" ON public.file_metadata
    FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own files" ON public.file_metadata
    FOR UPDATE USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own files" ON public.file_metadata
    FOR DELETE USING (auth.uid()::text = owner_id);
