-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests if not already enabled  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs every 30 minutes to refresh Zoho tokens
SELECT cron.schedule(
  'refresh-zoho-tokens-every-30-minutes',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/refresh-zoho-token',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Create a table to log cron job executions for monitoring
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on cron job logs (admin access only)
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Only admins can view cron job logs" ON public.cron_job_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
  )
);