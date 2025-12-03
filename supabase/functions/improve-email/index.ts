import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  currentContent: z.string().min(1, "Content cannot be empty").max(5000, "Content too long"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY FIX 1: Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create authenticated Supabase client to verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // SECURITY FIX 2: Validate input data
    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Input validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validationResult.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { currentContent } = validationResult.data;
    console.log("Improving content of length:", currentContent.length);

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: DRAFT IMPROVEMENT with Groq (Llama 3.3 70B)
    // ═══════════════════════════════════════════════════════════════════
    const draftPrompt = `You are a master email copywriter. Improve this email to be more compelling, persuasive, and high-converting.

CURRENT EMAIL:
${currentContent}

IMPROVEMENT REQUIREMENTS:
• Keep the SAME length and structure (±10% word count)
• Make it more engaging and human-sounding
• Strengthen the emotional appeal
• Improve the flow and readability
• Make CTAs more compelling
• Remove any robotic or generic phrasing
• Add conversational touches where appropriate
• Ensure it sounds like a skilled human wrote it

Return ONLY the improved email content (no explanations, no labels, no formatting instructions).`;

    console.log("═══ STEP 1: Draft Improvement with Groq ═══");
    const draftResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: draftPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!draftResp.ok) {
      const errorText = await draftResp.text();
      console.error("Groq improvement error:", draftResp.status, errorText);
      
      if (draftResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to your Groq account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (draftResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please wait and retry." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const draftData = await draftResp.json();
    if (!draftData.choices?.[0]?.message?.content) {
      console.error("Invalid Groq response format:", draftData);
      throw new Error("Invalid AI response format");
    }

    let improvedContent = draftData.choices[0].message.content.trim();
    console.log("✅ Step 1 Complete: Draft improved");

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: POLISH with Claude via OpenRouter
    // ═══════════════════════════════════════════════════════════════════
    if (OPENROUTER_API_KEY) {
      console.log("═══ STEP 2: Polish with Claude ═══");
      
      const polishPrompt = `You are an elite email editor. Polish this email to perfection.

IMPROVED EMAIL:
${improvedContent}

POLISH REQUIREMENTS:
• Ensure it sounds completely human (no AI tells)
• Fix any awkward phrasing or unnatural constructions  
• Maintain the same length and structure
• Add subtle conversational touches if missing
• Ensure smooth flow between paragraphs
• Make sure personality is consistent throughout
• Keep any personalization tags like {{first_name}} intact

Return ONLY the polished email content (no explanations, no labels).`;

      try {
        const polishResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://vayno.app",
            "X-Title": "Vayno Email Polish"
          },
          body: JSON.stringify({
            model: "anthropic/claude-sonnet-4-20250514",
            messages: [
              { role: "user", content: polishPrompt }
            ],
            temperature: 0.6,
          }),
        });

        if (polishResp.ok) {
          const polishData = await polishResp.json();
          if (polishData.choices?.[0]?.message?.content) {
            improvedContent = polishData.choices[0].message.content.trim();
            console.log("✅ Step 2 Complete: Polished with Claude");
          } else {
            console.warn("Claude response missing content, using draft");
          }
        } else {
          const polishError = await polishResp.text();
          console.warn("Claude polish failed, using draft:", polishResp.status, polishError);
        }
      } catch (polishError) {
        console.warn("Claude polish error, using draft:", polishError);
      }
    } else {
      console.log("OPENROUTER_API_KEY not configured, skipping polish step");
    }

    console.log("✅ Email improvement complete (Draft + Polish pipeline)");

    return new Response(JSON.stringify({ improvedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in improve-email:", error);
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
