-- Drop legacy views that pose security risks
-- These views were marked as "do not reference from application code"
-- and create potential security vulnerabilities with SECURITY DEFINER

DROP VIEW IF EXISTS public.archived_legacy_orders;
DROP VIEW IF EXISTS public.archived_legacy_simple_orders;

-- If you need these views for read-only historical access, 
-- recreate them with SECURITY INVOKER to enforce current user's RLS policies:
-- 
-- CREATE OR REPLACE VIEW public.archived_legacy_orders 
-- WITH (security_invoker = true) AS
-- SELECT * FROM orders;
--
-- CREATE OR REPLACE VIEW public.archived_legacy_simple_orders
-- WITH (security_invoker = true) AS  
-- SELECT * FROM simple_orders;