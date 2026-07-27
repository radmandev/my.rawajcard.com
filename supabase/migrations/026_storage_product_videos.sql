-- Create the product-videos storage bucket (public read, authenticated write)
-- Lets admins upload a short product video (mp4/webm/mov) from the admin panel.
-- This migration is idempotent: safe to run multiple times.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-videos',
  'product-videos',
  true,
  104857600,  -- 100 MB per file
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE
  SET public             = true,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage objects (already on by default, but ensures it)
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies so this migration is safe to rerun

-- 1. Authenticated users can upload
DROP POLICY IF EXISTS "product_videos_insert_authenticated" ON storage.objects;
CREATE POLICY "product_videos_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-videos');

-- 2. Public can read / stream
DROP POLICY IF EXISTS "product_videos_select_public" ON storage.objects;
CREATE POLICY "product_videos_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-videos');

-- 3. Authenticated users can update files (replace)
DROP POLICY IF EXISTS "product_videos_update_authenticated" ON storage.objects;
CREATE POLICY "product_videos_update_authenticated"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-videos');

-- 4. Authenticated users can delete files
DROP POLICY IF EXISTS "product_videos_delete_authenticated" ON storage.objects;
CREATE POLICY "product_videos_delete_authenticated"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-videos');
