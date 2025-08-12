-- Create file_metadata table if it doesn't exist
CREATE TABLE IF NOT EXISTS file_metadata (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  original_type TEXT,
  original_size BIGINT,
  download_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  owner_id TEXT,
  owner_email TEXT,
  sharing_link JSONB,
  has_password BOOLEAN DEFAULT FALSE,
  password_hash TEXT
);