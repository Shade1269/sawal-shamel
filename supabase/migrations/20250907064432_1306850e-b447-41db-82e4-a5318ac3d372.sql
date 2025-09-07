-- Update cron job to sync every 30 minutes instead of 45 minutes
SELECT cron.unschedule('refresh-zoho-tokens-every-45-minutes');

-- Schedule Zoho token refresh every 30 minutes  
SELECT cron.schedule(
  'refresh-zoho-tokens-every-30-minutes',
  '*/30 * * * *', -- every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/refresh-zoho-token',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MVg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Schedule automatic product sync every 30 minutes for enabled integrations
SELECT cron.schedule(
  'sync-zoho-products-every-30-minutes',
  '*/30 * * * *', -- every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/scheduled-zoho-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MVg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);