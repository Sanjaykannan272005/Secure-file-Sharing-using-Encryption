CREATE INDEX idx_file_metadata_owner_id ON file_metadata(owner_id);
-- Add encryption metadata columns to file_metadata table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE file_metadata 
ADD COLUMN IF NOT EXISTS encryption_key TEXT,
ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT FALSE;

-- Update existing records to have default values
UPDATE file_metadata 
SET has_password = FALSE 
WHERE has_password IS NULL;

-- Add virus scan tracking columns
ALTER TABLE file_metadata 
ADD COLUMN IF NOT EXISTS scan_status TEXT DEFAULT 'clean',
ADD COLUMN IF NOT EXISTS scan_date TIMESTAMP;

-- Add file-level 2FA requirement column
ALTER TABLE file_metadata 
ADD COLUMN IF NOT EXISTS requires_2fa BOOLEAN DEFAULT FALSE;

-- Create temporary codes table for email 2FA
CREATE TABLE IF NOT EXISTS temp_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  file_id TEXT,
  type TEXT DEFAULT 'email_2fa',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP
);

-- Create 2FA table
CREATE TABLE IF NOT EXISTS user_2fa (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  totp_secret TEXT,
  is_enabled BOOLEAN DEFAULT FALSE,
  method TEXT, -- 'totp', 'email', 'sms'
  created_at TIMESTAMP DEFAULT NOW(),
  enabled_at TIMESTAMP,
  disabled_at TIMESTAMP,
  UNIQUE(user_id)
);