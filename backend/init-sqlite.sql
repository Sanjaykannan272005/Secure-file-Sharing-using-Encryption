-- SQLite migration from Supabase backup
-- Tables: file_metadata, temp_codes, user_2fa

CREATE TABLE IF NOT EXISTS file_metadata (
    id TEXT PRIMARY KEY NOT NULL,
    original_name TEXT NOT NULL,
    original_type TEXT,
    original_size INTEGER,
    download_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    owner_id TEXT NOT NULL,
    owner_email TEXT,
    sharing_link TEXT,
    scan_result TEXT
);

CREATE TABLE IF NOT EXISTS temp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    phone TEXT,
    code TEXT NOT NULL,
    file_id TEXT,
    type TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME
);

CREATE TABLE IF NOT EXISTS user_2fa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    totp_secret TEXT,
    is_enabled INTEGER DEFAULT 0,
    method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    enabled_at DATETIME,
    disabled_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_file_metadata_owner ON file_metadata(owner_id);
CREATE INDEX IF NOT EXISTS idx_temp_codes_file ON temp_codes(file_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_user ON user_2fa(user_id);
