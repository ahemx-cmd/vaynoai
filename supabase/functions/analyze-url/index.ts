import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validationResult.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { url } = validationResult.data;

    console.log("Analyzing URL:", url);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `You are a professional landing page analyzer. Visit and analyze this URL: ${url}

INSTRUCTIONS:
1. Visit the URL and read ALL content on the page
2. Extract key information about the product/service
3. Identify the brand voice and messaging style
4. Note the target audience and key value propositions
5. Write everything in ENGLISH only

Provide a concise analysis in the following JSON format (NO markdown, NO code blocks):
{
  "title": "Product/Service Name",
  "description": "Brief 2-3 sentence description of what it offers",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "targetAudience": "Who this is for",
  "priceRange": "Price information if available, or 'Not specified'",
  "brandVoice": "Description of the tone and style (e.g., professional, casual, playful)"
}`
        }],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const aiData = await response.json();
    
    if (!aiData.choices || !aiData.choices[0]?.message?.content) {
      throw new Error("Invalid AI response format");
    }

    let contentText = aiData.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (contentText.startsWith("```json")) {
      contentText = contentText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (contentText.startsWith("```")) {
      contentText = contentText.replace(/```\n?/g, "");
    }
    
    console.log("Raw AI analysis:", contentText);
    
    let analysis;
    try {
      analysis = JSON.parse(contentText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-url:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
