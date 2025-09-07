-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add additional secrets columns to zoho_integration table for refresh token support
ALTER TABLE zoho_integration 
ADD COLUMN IF NOT EXISTS client_id text,
ADD COLUMN IF NOT EXISTS client_secret text;

-- Schedule Zoho token refresh every 45 minutes
SELECT cron.schedule(
  'refresh-zoho-tokens-every-45-minutes',
  '*/45 * * * *', -- every 45 minutes
  $$
  SELECT
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/refresh-zoho-token',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Insert automatic sync settings for existing shops if they don't exist
INSERT INTO zoho_sync_settings (shop_id, auto_sync_enabled, sync_frequency)
SELECT DISTINCT zi.shop_id, true, 'hourly'
FROM zoho_integration zi
WHERE zi.is_enabled = true
AND NOT EXISTS (
  SELECT 1 FROM zoho_sync_settings zss 
  WHERE zss.shop_id = zi.shop_id
);