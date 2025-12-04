import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { api_key } = await req.json();

    if (!api_key || !api_key.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "API key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔑 Testing Klaviyo API key...");

    // Test the API key by making a request to Klaviyo
    const response = await fetch("https://a.klaviyo.com/api/accounts/", {
      method: "GET",
      headers: {
        "Authorization": `Klaviyo-API-Key ${api_key}`,
        "Accept": "application/json",
        "revision": "2024-02-15",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Klaviyo connection successful");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Connection successful",
          account_name: data.data?.[0]?.attributes?.contact_information?.organization_name || "Klaviyo Account"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await response.json();
      console.error("❌ Klaviyo connection failed:", errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorData.errors?.[0]?.detail || "Invalid API key" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Test connection error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to test connection" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
