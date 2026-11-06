import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_ID = '86177767-e1f2-4356-b98b-e43503cab0da';
const ADMIN_EMAILS = ['vaggelisbobonhs@gmail.com', 'vaggelismpomponis@gmail.com', 'ebomponis@gmail.com'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller identity
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userEmailLower = (user.email ?? '').toLowerCase();
    const isAdminById = user.id === ADMIN_ID;
    const isAdminByEmail = ADMIN_EMAILS.some(e => e.toLowerCase() === userEmailLower);

    if (!isAdminById && !isAdminByEmail) {
      return new Response(JSON.stringify({ error: "Unauthorized. Admin only." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "Target User ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (targetUserId === ADMIN_ID || targetUserId === user.id) {
      return new Response(JSON.stringify({ error: "Cannot delete master admin account" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Delete associated data from public tables
    await Promise.allSettled([
      supabase.from('transactions').delete().eq('user_id', targetUserId),
      supabase.from('recurring_transactions').delete().eq('user_id', targetUserId),
      supabase.from('budgets').delete().eq('user_id', targetUserId),
      supabase.from('goals').delete().eq('user_id', targetUserId),
      supabase.from('sessions').delete().eq('user_id', targetUserId),
      supabase.from('feedback').delete().eq('user_id', targetUserId),
      supabase.from('sentry_errors').delete().eq('user_id', targetUserId),
      supabase.from('profiles').delete().eq('id', targetUserId),
    ]);

    // 2. Delete user from auth.users via Admin API (service role)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(targetUserId);
    if (deleteAuthError) {
      console.warn("Auth delete notice (user may already be purged from auth):", deleteAuthError.message);
    }

    return new Response(JSON.stringify({ success: true, deletedUserId: targetUserId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Admin delete user error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

