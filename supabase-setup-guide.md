# Supabase Setup Guide for File Sharing App

Follow these steps to set up Supabase for your file sharing application:

## 1. Create a Supabase Account and Project

1. Go to [Supabase](https://supabase.com/) and sign up for a free account
2. Create a new project
3. Choose a name for your project (e.g., "file-sharing-app")
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to Settings > API
2. Copy the "URL" and "anon public" key
3. Paste these values in your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## 3. Create a Storage Bucket

1. Go to Storage in the left sidebar
2. Click "Create a new bucket"
3. Name it "files"
4. Choose "Public" bucket type (for easy file sharing)
5. Click "Create bucket"

## 4. Set Up Storage Permissions

1. Go to Storage > Policies
2. For the "files" bucket, add these policies:

### For file uploads (INSERT):
- Policy name: "Allow authenticated uploads"
- Policy definition: `true` (or customize as needed)

### For file downloads (SELECT):
- Policy name: "Allow public downloads"
- Policy definition: `true`

## 5. Create Database Tables

1. Go to SQL Editor in the left sidebar
2. Run the following SQL to create the file metadata table:

```sql
CREATE TABLE file_metadata (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  original_type TEXT NOT NULL,
  original_size BIGINT NOT NULL,
  download_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id TEXT NOT NULL,
  owner_email TEXT,
  sharing_link JSONB,
  scan_result JSONB
);

-- Add indexes for better performance
CREATE INDEX idx_file_metadata_owner_id ON file_metadata(owner_id);
```

## 6. Update Your Application

1. Make sure you've installed the Supabase client:
   ```
   npm install @supabase/supabase-js
   ```

2. Use the `supabaseStorage.js` utility file for file operations

3. Update your components to use Supabase instead of Firebase or mock storage:
   - In `FileUploader.js`: Change import to `import { uploadFile } from '../utils/supabaseStorage';`
   - In `FileList.js`: Change import to `import { createSharingLink } from '../utils/supabaseStorage';`
   - In `dashboard.js`: Change import to `import { getFiles } from '../utils/supabaseStorage';`
   - In `[token].js`: Change import to `import { getSharedFile } from '../utils/supabaseStorage';`

## 7. Test Your Application

1. Start your development server:
   ```
   npm run dev
   ```

2. Try uploading, listing, and sharing files to verify everything works correctly

## Troubleshooting

- If uploads fail, check your storage bucket permissions
- If database operations fail, check your table structure and permissions
- Check browser console for specific error messages