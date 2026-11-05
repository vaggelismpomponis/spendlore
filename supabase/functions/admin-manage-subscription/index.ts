import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Authorized admin identifiers
const ADMIN_ID = '86177767-e1f2-4356-b98b-e43503cab0da';
const ADMIN_EMAILS = ['vaggelisbobonhs@gmail.com', 'vaggelismpomponis@gmail.com', 'ebomponis@gmail.com'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify who is calling this function
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify admin by ID or email
    const userEmailLower = (user.email ?? '').toLowerCase();
    const isAdminById = user.id === ADMIN_ID;
    const isAdminByEmail = ADMIN_EMAILS.some(e => e.toLowerCase() === userEmailLower);

    if (!isAdminById && !isAdminByEmail) {
      return new Response(JSON.stringify({ error: "Unauthorized. Admin only." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Process request
    const { targetUserId, status } = await req.json();

    if (!targetUserId || !['pro', 'free'].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid parameters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Update the profile bypassing RLS using service role
    // Always clear subscription_expiry on manual grant/revoke so stale expired dates don't invalidate manual Pro
    const updatePayload: Record<string, any> = {
      subscription_status: status,
      subscription_expiry: null,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', targetUserId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, targetUserId, status }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Admin action error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
