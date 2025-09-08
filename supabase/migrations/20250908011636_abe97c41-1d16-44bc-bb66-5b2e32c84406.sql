-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to sync Zoho products every 5 minutes
SELECT cron.schedule(
    'zoho-auto-sync-5min',
    '*/5 * * * *', -- Every 5 minutes
    $$
    SELECT
      net.http_post(
          url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/scheduled-zoho-sync',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA"}'::jsonb,
          body:='{"scheduled": true}'::jsonb
      ) as request_id;
    $$
);

-- Log the cron job creation
INSERT INTO event_log (event, data) VALUES ('cron_job_created', '{"job_name": "zoho-auto-sync-5min", "schedule": "*/5 * * * *", "description": "Auto sync Zoho products every 5 minutes"}');