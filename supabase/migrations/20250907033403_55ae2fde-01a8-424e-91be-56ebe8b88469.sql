-- Allow admins to manage Zoho integration records regardless of shop ownership

-- Admin policies for zoho_integration
CREATE POLICY IF NOT EXISTS "Admin can view zoho integration"
ON public.zoho_integration
FOR SELECT
USING (public.get_current_user_role() = 'admin');

CREATE POLICY IF NOT EXISTS "Admin can insert zoho integration"
ON public.zoho_integration
FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY IF NOT EXISTS "Admin can update zoho integration"
ON public.zoho_integration
FOR UPDATE
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY IF NOT EXISTS "Admin can delete zoho integration"
ON public.zoho_integration
FOR DELETE
USING (public.get_current_user_role() = 'admin');

-- Admin policies for zoho_product_mapping
CREATE POLICY IF NOT EXISTS "Admin can view zoho product mapping"
ON public.zoho_product_mapping
FOR SELECT
USING (public.get_current_user_role() = 'admin');

CREATE POLICY IF NOT EXISTS "Admin can insert zoho product mapping"
ON public.zoho_product_mapping
FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY IF NOT EXISTS "Admin can update zoho product mapping"
ON public.zoho_product_mapping
FOR UPDATE
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY IF NOT EXISTS "Admin can delete zoho product mapping"
ON public.zoho_product_mapping
FOR DELETE
USING (public.get_current_user_role() = 'admin');