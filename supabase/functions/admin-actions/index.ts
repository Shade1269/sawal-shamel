// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ALLOWED_ADMIN_EMAILS = new Set([
  "Shade199633@icloud.com",
]);

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

    if (!token) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    const requesterEmail = userData.user.email?.toLowerCase();
    if (!requesterEmail || !ALLOWED_ADMIN_EMAILS.has(userData.user.email!)) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    if (contentType.includes("application/json")) {
      body = await req.json();
    }

    const action = body.action || new URL(req.url).searchParams.get("action");

    // Create channel
    if (action === "create_channel") {
      const { name, description, type = "general" } = body;
      if (!name || typeof name !== "string") {
        return jsonResponse({ error: "name is required" }, 400);
      }
      const { data, error } = await supabase
        .from("channels")
        .insert({ name, description, type, is_active: true })
        .select("id, name, description, type, is_active, created_at")
        .single();
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ data });
    }

    // Assign moderator by email
    if (action === "assign_moderator") {
      const { email } = body;
      if (!email) return jsonResponse({ error: "email is required" }, 400);
      const { data: profile, error: findErr } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", email)
        .maybeSingle();
      if (findErr) return jsonResponse({ error: findErr.message }, 400);
      if (!profile) return jsonResponse({ error: "Profile not found" }, 404);
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: "moderator" })
        .eq("id", profile.id)
        .select("id, email, role")
        .single();
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ data });
    }

    // Revoke moderator by email
    if (action === "revoke_moderator") {
      const { email } = body;
      if (!email) return jsonResponse({ error: "email is required" }, 400);
      const { data: profile, error: findErr } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", email)
        .maybeSingle();
      if (findErr) return jsonResponse({ error: findErr.message }, 400);
      if (!profile) return jsonResponse({ error: "Profile not found" }, 404);
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: "affiliate" })
        .eq("id", profile.id)
        .select("id, email, role")
        .single();
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ data });
    }

    // Create user with role (admin only)
    if (action === "create_user") {
      const { email, password, role = "moderator", full_name } = body;
      if (!email || !password) return jsonResponse({ error: "email and password are required" }, 400);

      // Check if profile already exists
      const { data: existingProfile, error: findErr } = await supabase
        .from("profiles")
        .select("id, email, auth_user_id")
        .eq("email", email)
        .maybeSingle();

      if (findErr) return jsonResponse({ error: findErr.message }, 400);

      let authUserId: string;
      
      if (existingProfile && !existingProfile.auth_user_id) {
        // Profile exists but no auth user - create auth user and link
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: full_name ? { full_name } : undefined,
        });
        if (createErr) return jsonResponse({ error: createErr.message }, 400);
        
        authUserId = created.user!.id;
        
        // Update existing profile with auth_user_id
        const { data: updated, error: updateErr } = await supabase
          .from("profiles")
          .update({
            auth_user_id: authUserId,
            full_name: full_name || email,
            role,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id)
          .select("id, email, role")
          .single();
        if (updateErr) return jsonResponse({ error: updateErr.message }, 400);
        
        return jsonResponse({ 
          data: { user: created.user, profile: updated },
          message: "Existing profile linked to new auth user"
        });
      } else if (existingProfile && existingProfile.auth_user_id) {
        return jsonResponse({ error: "User already exists with auth account" }, 400);
      } else {
        // No existing profile - create everything new
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: full_name ? { full_name } : undefined,
        });
        if (createErr) return jsonResponse({ error: createErr.message }, 400);

        authUserId = created.user!.id;

        // Create new profile
        const { data: newProfile, error: upErr } = await supabase
          .from("profiles")
          .insert({
            auth_user_id: authUserId,
            email,
            full_name: full_name || email,
            role,
          })
          .select("id, email, role")
          .single();
        if (upErr) return jsonResponse({ error: upErr.message }, 400);

        return jsonResponse({ data: { user: created.user, profile: newProfile } });
      }
    }

    // List channels
    if (action === "list_channels") {
      const { data, error } = await supabase
        .from("channels")
        .select("id, name, description, type, is_active, created_at")
        .order("created_at", { ascending: false });
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ data });
    }

    // List users
    if (action === "list_users") {
      const { query } = body;
      let queryBuilder = supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at, is_active")
        .order("created_at", { ascending: false });

      if (query && typeof query === "string") {
        queryBuilder = queryBuilder.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder;
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ data });
    }

    return jsonResponse({ error: "Invalid action" }, 400);

  } catch (error: any) {
    console.error("Edge function error:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  }
});