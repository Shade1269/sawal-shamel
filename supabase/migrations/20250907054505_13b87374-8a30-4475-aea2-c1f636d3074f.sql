-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Shop owners can manage sync settings" ON public.zoho_sync_settings;
DROP POLICY IF EXISTS "Admins can manage all sync settings" ON public.zoho_sync_settings;

-- Create policies for sync settings
CREATE POLICY "Shop owners can manage sync settings"
ON public.zoho_sync_settings
FOR ALL
USING (shop_id IN (
  SELECT s.id 
  FROM shops s
  JOIN profiles p ON p.id = s.owner_id
  WHERE p.auth_user_id = auth.uid()
));

CREATE POLICY "Admins can manage all sync settings"
ON public.zoho_sync_settings
FOR ALL
USING (get_current_user_role() = 'admin');