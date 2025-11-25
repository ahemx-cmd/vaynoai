import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature if secret is set
    if (webhookSecret) {
      const signature = req.headers.get('x-signature');
      if (!signature) {
        console.error('Missing webhook signature');
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const payload = await req.json();
    console.log('Received webhook event:', payload.meta?.event_name);
    console.log('Custom data:', payload.meta?.custom_data);

    const eventName = payload.meta?.event_name;
    const userId = payload.meta?.custom_data?.user_id;

    if (!userId) {
      console.error('No user_id in webhook payload');
      return new Response(JSON.stringify({ error: 'Missing user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different webhook events
    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(supabase, payload, userId);
        break;
      
      case 'subscription_created':
        await handleSubscriptionCreated(supabase, payload, userId);
        break;
      
      case 'subscription_updated':
        await handleSubscriptionUpdated(supabase, payload, userId);
        break;
      
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(supabase, payload, userId);
        break;
      
      case 'subscription_resumed':
        await handleSubscriptionResumed(supabase, payload, userId);
        break;

      default:
        console.log('Unhandled event:', eventName);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleOrderCreated(supabase: any, payload: any, userId: string) {
  console.log('Handling order created for user:', userId);

  const attributes = payload.data?.attributes;
  const productName = attributes?.product_name || attributes?.first_order_item?.product_name;
  const variantName = attributes?.variant_name || attributes?.first_order_item?.variant_name;
  const orderId = payload.data?.id?.toString();

  // Check if this is a one-time credit pack purchase
  const creditPackMap: { [key: string]: number } = {
    'starter pack': 40,
    'growth pack': 120,
    'pro pack': 300,
    'agency pack': 800,
  };

  const packKey = (productName?.toLowerCase() || variantName?.toLowerCase() || '');
  let creditsToAdd = 0;

  for (const [key, credits] of Object.entries(creditPackMap)) {
    if (packKey.includes(key)) {
      creditsToAdd = credits;
      console.log(`Detected credit pack: ${key} - ${credits} credits`);
      break;
    }
  }

  if (creditsToAdd > 0) {
    // This is a one-time credit pack purchase
    console.log(`Adding ${creditsToAdd} topup credits to user ${userId}`);

    // Check for duplicate processing using order_id
    const { data: existingOrder } = await supabase
      .from('user_usage')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingOrder) {
      // Add credits to topup_credits column
      const { error } = await supabase.rpc('add_topup_credits', {
        p_user_id: userId,
        p_credits: creditsToAdd
      });

      if (error) {
        // Fallback to direct update if function doesn't exist
        const { data: currentUsage } = await supabase
          .from('user_usage')
          .select('topup_credits')
          .eq('user_id', userId)
          .single();

        const currentTopup = currentUsage?.topup_credits || 0;

        const { error: updateError } = await supabase
          .from('user_usage')
          .update({ topup_credits: currentTopup + creditsToAdd })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error adding topup credits:', updateError);
          throw updateError;
        }
      }

      console.log(`Successfully added ${creditsToAdd} topup credits to user ${userId}`);
    }
  } else {
    console.log('Order is not a credit pack, skipping topup credit addition');
  }
}

async function handleSubscriptionCreated(supabase: any, payload: any, userId: string) {
  console.log('Handling subscription created for user:', userId);

  const attributes = payload.data?.attributes;
  const productName = attributes?.product_name || attributes?.first_order_item?.product_name;
  const variantName = attributes?.variant_name || attributes?.first_order_item?.variant_name;
  const customerId = attributes?.customer_id?.toString();
  const subscriptionId = payload.data?.id?.toString();
  const renewsAt = attributes?.renews_at;
  const status = attributes?.status || 'active';

  // Determine plan based on product/variant name with new credit system
  let plan = 'trial';
  let generationsLimit = 20;

  if (productName?.toLowerCase().includes('lifetime') || variantName?.toLowerCase().includes('lifetime')) {
    plan = 'lifetime';
    generationsLimit = 120;
    console.log('Detected lifetime plan - 120 credits');
  } else if (productName?.toLowerCase().includes('pro') || variantName?.toLowerCase().includes('pro')) {
    plan = 'pro';
    generationsLimit = 500;
    console.log('Detected pro plan - 500 credits');
  } else if (productName?.toLowerCase().includes('starter') || variantName?.toLowerCase().includes('starter')) {
    plan = 'starter';
    generationsLimit = 120;
    console.log('Detected starter plan - 120 credits');
  }

  console.log(`Updating user ${userId} to plan: ${plan} with ${generationsLimit} credits`);

  // Calculate period end: use renewsAt if provided, otherwise set to 1 month from now
  const periodEnd = renewsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const updateData: any = {
    plan,
    generations_limit: generationsLimit,
    generations_used: 0, // Reset credits on new subscription
    subscription_status: status,
    lemonsqueezy_customer_id: customerId,
    current_period_end: periodEnd, // ALWAYS set period end for monthly resets
  };

  if (subscriptionId) {
    updateData.subscription_id = subscriptionId;
  }

  console.log(`Setting current_period_end to: ${periodEnd}`);

  const { error } = await supabase
    .from('user_usage')
    .update(updateData)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user usage:', error);
    throw error;
  }

  console.log('Successfully updated user subscription with credits');
}

async function handleSubscriptionUpdated(supabase: any, payload: any, userId: string) {
  console.log('Handling subscription updated for user:', userId);

  const attributes = payload.data?.attributes;
  const status = attributes?.status;
  const renewsAt = attributes?.renews_at;
  const updatedAt = attributes?.updated_at;

  // Fetch current user data to detect renewals
  const { data: currentData } = await supabase
    .from('user_usage')
    .select('current_period_end, plan, generations_limit')
    .eq('user_id', userId)
    .single();

  const updateData: any = {
    subscription_status: status,
  };

  // Check if this is a renewal event (period has advanced)
  if (renewsAt && currentData?.current_period_end) {
    const oldPeriodEnd = new Date(currentData.current_period_end);
    const newPeriodEnd = new Date(renewsAt);
    
    // If the new period is in the future and different from old period, it's a renewal
    if (newPeriodEnd > oldPeriodEnd && newPeriodEnd > new Date()) {
      console.log('Detected subscription renewal - resetting credits');
      updateData.generations_used = 0; // Reset credits on renewal
    }
    
    updateData.current_period_end = renewsAt;
  } else if (renewsAt) {
    updateData.current_period_end = renewsAt;
  }

  const { error } = await supabase
    .from('user_usage')
    .update(updateData)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  console.log('Successfully updated subscription status');
}

async function handleSubscriptionCancelled(supabase: any, payload: any, userId: string) {
  console.log('Handling subscription cancelled for user:', userId);

  // When subscription is cancelled, user goes back to trial with 0 credits
  const { error } = await supabase
    .from('user_usage')
    .update({
      subscription_status: 'cancelled',
      plan: 'trial',
      generations_limit: 0,
      generations_used: 0,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }

  console.log('Successfully cancelled subscription - user moved to trial with 0 credits');
}

async function handleSubscriptionResumed(supabase: any, payload: any, userId: string) {
  console.log('Handling subscription resumed for user:', userId);

  const attributes = payload.data?.attributes;
  const status = attributes?.status || 'active';

  const { error } = await supabase
    .from('user_usage')
    .update({
      subscription_status: status,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }

  console.log('Successfully resumed subscription');
}