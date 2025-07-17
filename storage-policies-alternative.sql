-- Alternative approach for Storage RLS Policies
-- This uses Supabase Dashboard UI approach

-- IMPORTANT: Since we cannot modify storage.objects table directly,
-- you need to configure this through Supabase Dashboard:

-- Option 1: Disable RLS temporarily (Quick fix)
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Storage
-- 3. Click on 'documents' bucket
-- 4. Go to Configuration tab
-- 5. Turn OFF "Enable Row Level Security"
-- 6. Save changes

-- Option 2: Configure RLS through Dashboard (Recommended)
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Storage
-- 3. Click on 'documents' bucket
-- 4. Go to Policies tab
-- 5. Create new policies with these settings:

-- Policy 1: "Allow authenticated uploads"
-- - Allowed operation: INSERT
-- - Target roles: authenticated
-- - WITH CHECK expression: true

-- Policy 2: "Allow authenticated downloads"
-- - Allowed operation: SELECT
-- - Target roles: authenticated
-- - USING expression: true

-- Policy 3: "Allow users to delete their files"
-- - Allowed operation: DELETE
-- - Target roles: authenticated
-- - USING expression: (storage.foldername(name))[1] = auth.uid()::text

-- Note: If you're admin on Supabase project, you can also run this
-- in SQL Editor with elevated permissions:

-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- View existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';