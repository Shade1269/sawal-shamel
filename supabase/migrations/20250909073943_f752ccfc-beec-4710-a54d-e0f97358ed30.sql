-- Create cron jobs for automated Zoho sync every 15 minutes

-- Schedule token refresh every 15 minutes (to keep tokens fresh)
SELECT cron.schedule(
  'zoho-refresh-token-15min',
  '*/15 * * * *',
  $$
  select
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/refresh-zoho-token',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule product sync every 15 minutes
SELECT cron.schedule(
  'zoho-sync-products-15min',
  '*/15 * * * *',
  $$
  select
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/scheduled-zoho-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);