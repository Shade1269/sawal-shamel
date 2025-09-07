-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a scheduled job to sync Zoho products every hour
SELECT cron.schedule(
  'zoho-product-sync-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/scheduled-zoho-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Add a sync settings table to control sync frequency
CREATE TABLE IF NOT EXISTS public.zoho_sync_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    sync_frequency text NOT NULL DEFAULT 'hourly', -- hourly, daily, manual
    last_auto_sync_at timestamp with time zone,
    auto_sync_enabled boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(shop_id)
);

-- Enable RLS on sync settings
ALTER TABLE public.zoho_sync_settings ENABLE ROW LEVEL SECURITY;

-- Allow shop owners to manage their sync settings
CREATE POLICY "Shop owners can manage sync settings"
ON public.zoho_sync_settings
FOR ALL
USING (shop_id IN (
  SELECT s.id 
  FROM shops s
  JOIN profiles p ON p.id = s.owner_id
  WHERE p.auth_user_id = auth.uid()
));

-- Allow admins to manage all sync settings
CREATE POLICY "Admins can manage all sync settings"
ON public.zoho_sync_settings
FOR ALL
USING (get_current_user_role() = 'admin');

-- Create trigger to update updated_at column
CREATE TRIGGER update_zoho_sync_settings_updated_at
BEFORE UPDATE ON public.zoho_sync_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();