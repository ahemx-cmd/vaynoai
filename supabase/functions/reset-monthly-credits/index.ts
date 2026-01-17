import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify this is a legitimate cron job or admin call
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');
    
    // Check for cron secret in header (for scheduled jobs)
    const providedSecret = req.headers.get('x-cron-secret');
    
    if (cronSecret && providedSecret !== cronSecret) {
      // If cron secret is set but not provided/matched, check for admin auth
      if (!authHeader) {
        console.error('Unauthorized access attempt - no credentials provided');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - This endpoint requires authentication' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Verify admin role if using auth header
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      
      const { data: { user }, error: authError } = await authClient.auth.getUser();
      if (authError || !user) {
        console.error('Invalid auth token');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if user has admin role
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: hasAdmin } = await serviceClient.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (!hasAdmin) {
        console.error('User is not admin:', user.id);
        return new Response(
          JSON.stringify({ error: 'Forbidden - Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Admin access verified for user:', user.id);
    } else if (cronSecret && providedSecret === cronSecret) {
      console.log('Cron job access verified via secret');
    } else if (!cronSecret) {
      console.warn('CRON_SECRET not set - endpoint is unprotected. Set CRON_SECRET for production.');
    }

    console.log('Starting monthly credit reset job...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all users whose credit period has ended and have active subscriptions
    const { data: expiredUsers, error: fetchError } = await supabase
      .from('user_usage')
      .select('*')
      .lt('current_period_end', new Date().toISOString())
      .in('subscription_status', ['active', 'trial'])
      .neq('plan', 'free');

    if (fetchError) {
      console.error('Error fetching expired users:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredUsers?.length || 0} users with expired credit periods`);

    if (!expiredUsers || expiredUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users need credit reset',
          resetCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reset credits for each user
    const resetResults = [];
    for (const user of expiredUsers) {
      const nextPeriodEnd = new Date();
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

      const { error: updateError } = await supabase
        .from('user_usage')
        .update({
          generations_used: 0,
          current_period_end: nextPeriodEnd.toISOString(),
        })
        .eq('user_id', user.user_id);

      if (updateError) {
        console.error(`Failed to reset credits for user ${user.user_id}:`, updateError);
        resetResults.push({
          user_id: user.user_id,
          success: false,
          error: updateError.message,
        });
      } else {
        console.log(`Successfully reset credits for user ${user.user_id} (${user.plan} plan)`);
        resetResults.push({
          user_id: user.user_id,
          success: true,
          plan: user.plan,
          previous_period_end: user.current_period_end,
          new_period_end: nextPeriodEnd.toISOString(),
        });
      }
    }

    const successCount = resetResults.filter(r => r.success).length;
    const failureCount = resetResults.filter(r => !r.success).length;

    console.log(`Credit reset completed: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Credit reset job completed',
        resetCount: successCount,
        failureCount,
        results: resetResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in reset-monthly-credits function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
