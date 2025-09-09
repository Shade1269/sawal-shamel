-- Ensure product-images bucket is public for displaying Zoho images
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- Create RLS policies for product-images bucket if they don't exist
DO $$
BEGIN
  -- Policy to allow public read access to images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for product images'
  ) THEN
    CREATE POLICY "Public read access for product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;

  -- Policy to allow authenticated users to upload images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
  END IF;

  -- Policy to allow service role to manage images (for Zoho sync)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Service role can manage product images'
  ) THEN
    CREATE POLICY "Service role can manage product images"
    ON storage.objects FOR ALL
    USING (bucket_id = 'product-images' AND (auth.jwt() ->> 'role'::text) = 'service_role'::text);
  END IF;
END $$;