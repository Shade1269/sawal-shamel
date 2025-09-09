-- Update cron job to run every 15 minutes instead of current schedule
SELECT cron.unschedule('zoho-refresh-token');
SELECT cron.unschedule('zoho-sync-products');

-- Schedule token refresh every 15 minutes (to keep tokens fresh)
SELECT cron.schedule(
  'zoho-refresh-token',
  '*/15 * * * *',
  $$
  select
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/refresh-zoho-token',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Nzg2NzYsImV4cCI6MjA0MTE1NDY3Nn0.T-4yqCHdgLjtJHzhXcdPpGFPYJLKvNdSiqxJmKSDxFk"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule product sync every 15 minutes
SELECT cron.schedule(
  'zoho-sync-products',
  '*/15 * * * *',
  $$
  select
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/scheduled-zoho-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Nzg2NzYsImV4cCI6MjA0MTE1NDY3Nn0.T-4yqCHdgLjtJHzhXcdPpGFPYJLKvNdSiqxJmKSDxFk"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);