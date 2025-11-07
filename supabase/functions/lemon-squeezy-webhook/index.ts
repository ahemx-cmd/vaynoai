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
    generationsLimit = 150;
    console.log('Detected lifetime plan - 150 credits');
  } else if (productName?.toLowerCase().includes('pro') || variantName?.toLowerCase().includes('pro')) {
    plan = 'pro';
    generationsLimit = 400;
    console.log('Detected pro plan - 400 credits');
  } else if (productName?.toLowerCase().includes('starter') || variantName?.toLowerCase().includes('starter')) {
    plan = 'starter';
    generationsLimit = 150;
    console.log('Detected starter plan - 150 credits');
  }

  console.log(`Updating user ${userId} to plan: ${plan} with ${generationsLimit} credits`);

  const updateData: any = {
    plan,
    generations_limit: generationsLimit,
    generations_used: 0, // Reset credits on new subscription
    subscription_status: status,
    lemonsqueezy_customer_id: customerId,
  };

  if (subscriptionId) {
    updateData.subscription_id = subscriptionId;
  }

  if (renewsAt) {
    updateData.current_period_end = renewsAt;
  }

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

  const updateData: any = {
    subscription_status: status,
  };

  if (renewsAt) {
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