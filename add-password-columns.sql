-- Add password columns to existing table
ALTER TABLE file_metadata 
ADD COLUMN has_password BOOLEAN DEFAULT FALSE,
ADD COLUMN password_hash TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'file_metadata';