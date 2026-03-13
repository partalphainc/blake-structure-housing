import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SETUP_KEY = "CBE-ADMIN-BOOTSTRAP-2025";
const ALLOWED_DOMAINS = ["@cblakeent.com"];
const ALLOWED_BACKUP = "partalphaincorporation@gmail.com";

function isAuthorizedEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return (
    lower === ALLOWED_BACKUP.toLowerCase() ||
    ALLOWED_DOMAINS.some((d) => lower.endsWith(d))
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { email?: string; password?: string; key?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { email, password, key } = body;

  // Validate setup key
  if (key !== SETUP_KEY) {
    return new Response(JSON.stringify({ error: "Invalid setup key" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate email domain
  if (!email || !isAuthorizedEmail(email)) {
    return new Response(JSON.stringify({ error: "Unauthorized email domain" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!password || password.length < 8) {
    return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if user already exists
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    return new Response(JSON.stringify({ error: listError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const existing = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;

  if (existing) {
    // Update existing user: set new password + confirm email
    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    userId = existing.id;
  } else {
    // Create new user with confirmed email
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError || !newUser?.user) {
      return new Response(JSON.stringify({ error: createError?.message ?? "Failed to create user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    userId = newUser.user.id;
  }

  // Assign admin role (upsert — safe to call multiple times)
  const { error: roleError } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

  // Non-fatal if role upsert fails (table may not have unique constraint yet)
  if (roleError) {
    // Try plain insert with duplicate guard
    await admin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" })
      .select();
  }

  return new Response(
    JSON.stringify({
      success: true,
      action: existing ? "updated" : "created",
      message: existing
        ? `Password updated for ${email}. You can now sign in.`
        : `Account created for ${email}. You can now sign in.`,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
