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
  "shade199633@icloud.com",
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
    
    // SECURITY: Enforce admin authentication - NO BYPASS
    let requesterEmail = null;
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authorization header required" }, 401);
    }
    
    const token = authHeader.split(" ")[1];
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    
    if (userErr || !userData?.user?.email) {
      return jsonResponse({ error: "Invalid or expired token" }, 401);
    }
    
    requesterEmail = userData.user.email.toLowerCase();
    
    // Verify admin privileges via database
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", userData.user.id)
      .single();
      
    if (profileErr || !profile || profile.role !== 'admin') {
      return jsonResponse({ error: "Forbidden - Admin privileges required" }, 403);
    }
    
    console.log(`[ADMIN ACTION] ${requesterEmail} performing action`);

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

    if (action === "assign_moderator") {
      const { email } = body;
      if (!email) return jsonResponse({ error: "email is required" }, 400);
      const normalizedEmail = String(email).toLowerCase().trim();
      const { data: profilesList, error: findErr } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", normalizedEmail)
        .order("created_at", { ascending: false });
      if (findErr) return jsonResponse({ error: findErr.message }, 400);
      const profile = profilesList?.[0];
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
      const normalizedEmail = String(email).toLowerCase().trim();
      const { data: profilesList, error: findErr } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", normalizedEmail)
        .order("created_at", { ascending: false });
      if (findErr) return jsonResponse({ error: findErr.message }, 400);
      const profile = profilesList?.[0];
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

    // Create user with role (admin only) - Robust linking and duplicates handling
    if (action === "create_user") {
      const { email, password, role = "moderator", full_name } = body;
      if (!email || !password) return jsonResponse({ error: "email and password are required" }, 400);

      const normalizedEmail = String(email).toLowerCase().trim();
      console.log(`[create_user] Start for ${normalizedEmail}`);

      // Fetch all profiles matching the email to gracefully handle duplicates
      const { data: matchingProfiles, error: listErr } = await supabase
        .from("profiles")
        .select("id, email, auth_user_id, role, created_at, full_name")
        .eq("email", normalizedEmail)
        .order("created_at", { ascending: false });

      if (listErr) {
        console.error("[create_user] list profiles error:", listErr);
        return jsonResponse({ error: listErr.message }, 400);
      }

      // Choose the best candidate profile (prefer one without auth_user_id)
      let existingProfile = matchingProfiles?.find((p: any) => !p.auth_user_id) || matchingProfiles?.[0] || null;

      const createAuthUser = async () => {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: full_name || "User" },
        });
        if (createErr) {
          // If user already exists in Auth, fetch their id and continue
          const msg = String(createErr.message || "").toLowerCase();
          if (msg.includes("already") || (createErr as any).status === 422) {
            try {
              // Try to find existing auth user by paging through users (small scale fallback)
              let page = 1;
              let found: any = null;
              while (!found && page <= 10) {
                const { data: usersPage, error: listErr } = await (supabase.auth.admin as any).listUsers({ page, perPage: 100 });
                if (listErr) break;
                found = usersPage?.users?.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
                if (!usersPage?.users || usersPage.users.length < 100) break;
                page++;
              }
              if (found) {
                console.log(`[create_user] Found existing auth user ${found.id} for ${normalizedEmail}`);
                return { user: { id: found.id } } as { user: { id: string } };
              }
            } catch (e) {
              console.error("[create_user] listUsers fallback failed:", e);
            }
          }
          console.error("[create_user] Auth creation error:", createErr);
          return { error: createErr };
        }
        return { user: created.user } as { user: { id: string } };
      };

      // Case A: We have a profile without an auth link -> create auth user and link it
      if (existingProfile && !existingProfile.auth_user_id) {
        console.log(`[create_user] Linking auth to existing profile ${existingProfile.id}`);
        const result = await createAuthUser();
        if ((result as any).error) return jsonResponse({ error: (result as any).error.message }, 400);
        const authUserId = (result as any).user.id as string;

        const { data: updated, error: updateErr } = await supabase
          .from("profiles")
          .update({
            auth_user_id: authUserId,
            full_name: full_name || normalizedEmail,
            role,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id)
          .select("id, email, role, auth_user_id")
          .single();
        if (updateErr) {
          console.error("[create_user] Profile update error:", updateErr);
          return jsonResponse({ error: updateErr.message }, 400);
        }

        console.log(`[create_user] Linked profile ${existingProfile.id} to auth ${authUserId}`);
        return jsonResponse({
          data: { user: { id: authUserId, email: normalizedEmail }, profile: updated },
          message: "Successfully created auth account and linked to existing profile",
        });
      }

      // Case B: Profiles exist and already linked -> just ensure role is set as requested
      if (existingProfile && existingProfile.auth_user_id) {
        console.log(`[create_user] Profile already linked (${existingProfile.id}), ensuring role=${role}`);
        const { data: ensured, error: ensureErr } = await supabase
          .from("profiles")
          .update({ role, updated_at: new Date().toISOString() })
          .eq("id", existingProfile.id)
          .select("id, email, role, auth_user_id")
          .single();
        if (ensureErr) return jsonResponse({ error: ensureErr.message }, 400);
        return jsonResponse({ data: { profile: ensured }, message: "User already existed; role ensured" });
      }

      // Case C: No profile exists -> create auth user then create profile
      console.log(`[create_user] No profile found, creating new user and profile`);
      const result = await createAuthUser();
      if ((result as any).error) return jsonResponse({ error: (result as any).error.message }, 400);
      const authUserId = (result as any).user.id as string;

      const { data: newProfile, error: upErr } = await supabase
        .from("profiles")
        .insert({
          auth_user_id: authUserId,
          email: normalizedEmail,
          full_name: full_name || normalizedEmail,
          role,
        })
        .select("id, email, role, auth_user_id")
        .single();
      if (upErr) {
        console.error("[create_user] New profile creation error:", upErr);
        return jsonResponse({ error: upErr.message }, 400);
      }

      console.log(`[create_user] Successfully created new user and profile`);
      return jsonResponse({ data: { user: { id: authUserId, email: normalizedEmail }, profile: newProfile } });
    }

    // Set or reset password by email
    if (action === "set_password_by_email") {
      const { email, password, role = "moderator", full_name } = body;
      if (!email || !password) return jsonResponse({ error: "email and password are required" }, 400);
      const normalizedEmail = String(email).toLowerCase().trim();

      // find auth user
      let existingAuthUser: any = null;
      try {
        let page = 1;
        while (!existingAuthUser && page <= 10) {
          const { data: usersPage, error: listErr } = await (supabase.auth.admin as any).listUsers({ page, perPage: 100 });
          if (listErr) break;
          existingAuthUser = usersPage?.users?.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
          if (!usersPage?.users || usersPage.users.length < 100) break;
          page++;
        }
      } catch (e) {
        console.error('[set_password_by_email] listUsers failed:', e);
      }
      if (!existingAuthUser?.id) {
        return jsonResponse({ error: "Auth user not found for email" }, 404);
      }

      const { error: updErr } = await supabase.auth.admin.updateUserById(existingAuthUser.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || 'User' },
      } as any);
      if (updErr) return jsonResponse({ error: updErr.message }, 400);

      // link profile if exists and not linked
      const { data: prof, error: pErr } = await supabase.from('profiles').select('id, auth_user_id').eq('email', normalizedEmail).maybeSingle();
      if (!pErr && prof && !prof.auth_user_id) {
        await supabase.from('profiles').update({ auth_user_id: existingAuthUser.id, role }).eq('id', prof.id);
      }

      return jsonResponse({ data: { success: true, auth_user_id: existingAuthUser.id } });
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

    // Clear all messages in a channel (admin/moderator only)
    if (action === "clear_channel_messages") {
      const { channel_id } = body;
      if (!channel_id) return jsonResponse({ error: "channel_id is required" }, 400);
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('channel_id', channel_id);
        
      if (error) {
        console.error('Clear messages error:', error);
        return jsonResponse({ error: error.message }, 400);
      }
      
      return jsonResponse({ data: { success: true, message: "Channel messages cleared" } });
    }

    // Update product visibility (admin only)
    if (action === "update_product_visibility") {
      const { product_id, is_active } = body;
      if (!product_id || typeof is_active !== 'boolean') {
        return jsonResponse({ error: "product_id and is_active are required" }, 400);
      }
      const { data, error } = await supabase
        .from('products')
        .update({ is_active })
        .eq('id', product_id)
        .select('id, is_active')
        .single();
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ data, message: 'Product visibility updated' });
    }

    return jsonResponse({ error: "Invalid action" }, 400);

  } catch (error: any) {
    console.error("Edge function error:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  }
});