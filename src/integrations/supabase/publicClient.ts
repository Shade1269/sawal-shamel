import { supabase } from './client'

// Re-export a single shared Supabase client to avoid multiple GoTrue instances
export { supabase }
export const supabasePublic = supabase
