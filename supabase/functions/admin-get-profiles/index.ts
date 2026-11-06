import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_ID = '86177767-e1f2-4356-b98b-e43503cab0da';
const ADMIN_EMAILS = ['vaggelisbobonhs@gmail.com', 'vaggelismpomponis@gmail.com', 'ebomponis@gmail.com'];

Deno.serve(async (req) => {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Use a USER-scoped client to validate the token (this is the correct pattern)
    const userClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth validation failed:", authError?.message ?? "No user");
      return new Response(JSON.stringify({ error: "Unauthorized. Could not validate token." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Case-insensitive email + ID check
    const userEmailLower = (user.email ?? '').toLowerCase();
    const isAdminById = user.id === ADMIN_ID;
    const isAdminByEmail = ADMIN_EMAILS.some(e => e.toLowerCase() === userEmailLower);

    console.log(`Admin check: email=${user.email}, id=${user.id}, byId=${isAdminById}, byEmail=${isAdminByEmail}`);

    if (!isAdminById && !isAdminByEmail) {
      return new Response(JSON.stringify({
        error: "Unauthorized. Admin only.",
        details: `User ${user.email} (${user.id}) is not an admin.`
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fetch all users from auth.users using Admin API
    const { data: authData, error: authListError } = await adminClient.auth.admin.listUsers({
      perPage: 1000
    });

    if (authListError) {
      console.error("Auth list error:", authListError);
      return new Response(JSON.stringify({ error: `Failed to list users: ${authListError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const users = authData?.users ?? [];

    // Fetch profile data
    let profiles: any[] = [];
    try {
      const { data: profs, error: profileError } = await adminClient
        .from('profiles')
        .select('*');
      if (profileError) {
        console.warn("Profile fetch warning:", profileError);
      } else {
        profiles = profs ?? [];
      }
    } catch (e) {
      console.warn("Profile table query failed:", e);
    }

    // Fetch session data
    let sessions: any[] = [];
    try {
      const { data: sess, error: sessionError } = await adminClient
        .from('sessions')
        .select('*')
        .order('last_active', { ascending: false });
      if (sessionError) {
        console.warn("Session fetch warning:", sessionError);
      } else {
        sessions = sess ?? [];
      }
    } catch (e) {
      console.warn("Session table query failed:", e);
    }

    // Create a map of latest sessions
    const latestSessionsMap = sessions.reduce((acc: Record<string, any>, s: any) => {
      if (s.user_id && (!acc[s.user_id] || new Date(s.last_active) > new Date(acc[s.user_id].last_active))) {
        acc[s.user_id] = s;
      }
      return acc;
    }, {});

    // Aggregate user activity statistics
    const txCounts: Record<string, number> = {};
    const budgetCounts: Record<string, number> = {};
    const goalCounts: Record<string, number> = {};
    let totalTransactions = 0;

    try {
      const { data: txData, error: txError } = await adminClient
        .from('transactions')
        .select('user_id');
      if (!txError && txData) {
        totalTransactions = txData.length;
        txData.forEach((t: any) => {
          if (t.user_id) txCounts[t.user_id] = (txCounts[t.user_id] || 0) + 1;
        });
      }
    } catch (e) {
      console.warn("Transactions query failed in admin-get-profiles:", e);
    }

    try {
      const { data: budgetData } = await adminClient
        .from('budgets')
        .select('user_id');
      (budgetData ?? []).forEach((b: any) => {
        if (b.user_id) budgetCounts[b.user_id] = (budgetCounts[b.user_id] || 0) + 1;
      });
    } catch (e) {
      console.warn("Budgets query failed in admin-get-profiles:", e);
    }

    try {
      const { data: goalData } = await adminClient
        .from('goals')
        .select('user_id');
      (goalData ?? []).forEach((g: any) => {
        if (g.user_id) goalCounts[g.user_id] = (goalCounts[g.user_id] || 0) + 1;
      });
    } catch (e) {
      console.warn("Goals query failed in admin-get-profiles:", e);
    }

    // Merge auth users with profile data and statistics
    const mergedProfiles = users.map((authUser: any) => {
      const profile = profiles.find((p: any) => p.id === authUser.id);
      const latestSession = latestSessionsMap[authUser.id];

      return {
        id: authUser.id,
        email: authUser.email,
        display_name: profile?.display_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
        subscription_status: profile?.subscription_status ?? 'free',
        stripe_customer_id: profile?.stripe_customer_id || authUser.user_metadata?.stripe_customer_id || null,
        admin_notes: profile?.admin_notes ?? null,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        latest_session: latestSession ?? null,
        stats: {
          transactions: txCounts[authUser.id] || 0,
          budgets: budgetCounts[authUser.id] || 0,
          goals: goalCounts[authUser.id] || 0
        }
      };
    });

    console.log(`Returning ${mergedProfiles.length} users, ${sessions.length} sessions, ${totalTransactions} total transactions`);

    return new Response(JSON.stringify({
      profiles: mergedProfiles,
      sessions,
      totalTransactions,
      userStats: {
        transactions: txCounts,
        budgets: budgetCounts,
        goals: goalCounts
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Admin action error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
