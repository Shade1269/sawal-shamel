-- ⚠️ CRITICAL SECURITY FIX: Prevent public access to sensitive user data
-- 
-- The "Limited public profile access" policy was exposing emails, phone numbers, 
-- and WhatsApp numbers to unauthenticated users. This fix restricts access to:
-- 1. Users can only see their own sensitive data
-- 2. Admins can see all data
-- 3. The safe_profiles view should be used for public profile viewing

-- Drop the dangerous public access policy
DROP POLICY IF EXISTS "Limited public profile access" ON public.profiles;

-- Keep the secure policies that require authentication
-- These policies already exist and are correct:
-- - "Secure profile access" - allows users to see their own profile or admins to see all
-- - "Users can read own profile by phone" - allows reading by phone match
-- - "Users can update own profile by phone" - allows updates
-- - "Users can insert profile by phone" - allows inserts

-- Add explicit comment about using safe_profiles view for public data
COMMENT ON VIEW public.safe_profiles IS 
'Use this view for public profile access. It masks sensitive fields (email, phone, whatsapp, auth_user_id) and only exposes them to the profile owner. Never query the profiles table directly for public-facing features.';

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;