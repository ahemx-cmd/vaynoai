import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting - in-memory store (per instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxRequests: number, windowMs: number): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
    return { allowed: true, resetIn: Math.ceil(windowMs / 1000) };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
}

// ISO 639-1 language codes (common subset)
const validLanguageCodes = [
  "en", "es", "fr", "de", "it", "pt", "nl", "ru", "zh", "ja", "ko", "ar", "hi", "bn", "pa",
  "tr", "vi", "th", "pl", "uk", "cs", "el", "he", "sv", "da", "no", "fi", "hu", "ro", "sk",
  "bg", "hr", "sl", "et", "lv", "lt", "id", "ms", "tl", "sw", "af", "zu", "am", "fa", "ur"
];

// Input validation schema with strict types
const requestSchema = z.object({
  campaignId: z.string().uuid("Invalid campaign ID format"),
  targetLanguage: z.string()
    .min(2, "Language code too short")
    .max(50, "Language specification too long")
    .refine(
      (val) => {
        // Allow either ISO code or full language name (up to 50 chars)
        const lowerVal = val.toLowerCase().trim();
        return validLanguageCodes.includes(lowerVal) || /^[a-zA-Z\s-]+$/.test(val);
      },
      { message: "Invalid language format" }
    ),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authentication" }),
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
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // SECURITY: Rate limiting - 10 requests per hour per user
    const rateLimit = checkRateLimit(user.id, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests", 
          message: `Rate limit exceeded. Please try again in ${rateLimit.resetIn} seconds.`,
          retryAfter: rateLimit.resetIn 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": rateLimit.resetIn.toString()
          } 
        }
      );
    }

    // SECURITY: Validate and sanitize input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const { campaignId, targetLanguage } = validationResult.data;
    
    // Sanitize targetLanguage to prevent injection
    const sanitizedLanguage = targetLanguage.trim().slice(0, 50);

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("campaigns")
      .select("user_id")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign || campaign.user_id !== user.id) {
      console.error("Campaign not found or unauthorized:", campaignError?.message);
      return new Response(
        JSON.stringify({ error: "Campaign not found or unauthorized" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all emails from the campaign
    const { data: emails, error: emailsError } = await supabaseClient
      .from("email_sequences")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("sequence_number");

    if (emailsError || !emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No emails found for this campaign" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Translating ${emails.length} emails to ${sanitizedLanguage}`);

    // Translate all emails using AI
    const translatedEmails = [];
    for (const email of emails) {
      const prompt = `Translate the following email content to ${sanitizedLanguage}. Preserve formatting, tone, and brand voice. Keep CTAs and links unchanged.

Subject: ${email.subject}

Content (plain text):
${email.content}

HTML Content:
${email.html_content}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "subject": "translated subject",
  "content": "translated plain text content",
  "html": "translated HTML content"
}`;

      // Use Groq AI
      const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
      if (!GROQ_API_KEY) {
        console.error("GROQ_API_KEY not configured");
        return new Response(
          JSON.stringify({ error: "AI service not configured. Please contact support." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Translating email ${email.sequence_number} with Groq AI (Llama 3.3 70B)`);
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: prompt }
          ],
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Groq AI error:", resp.status, errorText);
        
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits depleted. Please add credits to your Groq account." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited (500 free requests/day). Please wait and retry or upgrade your Groq plan." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await resp.json();

      // Groq returns OpenAI-compatible format
      if (!aiData.choices?.[0]?.message?.content) {
        throw new Error("Invalid AI response format");
      }
      
      let contentText = aiData.choices[0].message.content.trim();
      
      // Extract JSON from markdown code blocks if present
      const jsonBlockMatch = contentText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        contentText = jsonBlockMatch[1].trim();
      } else {
        const codeBlockMatch = contentText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          contentText = codeBlockMatch[1].trim();
        }
      }
      
      let translatedData;
      try {
        translatedData = JSON.parse(contentText);
      } catch (e1) {
        const s = contentText.indexOf("{");
        const e = contentText.lastIndexOf("}");
        if (s !== -1 && e !== -1 && e > s) {
          try {
            translatedData = JSON.parse(contentText.slice(s, e + 1));
            console.log("Parsed translation via substring extraction");
          } catch (e2) {
            console.error("Translate parse failed:", e2);
            return new Response(JSON.stringify({ error: "AI returned invalid translation format. Please retry." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        } else {
          return new Response(JSON.stringify({ error: "AI returned invalid translation format. Please retry." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      
      translatedEmails.push({
        id: email.id,
        subject: translatedData.subject,
        content: translatedData.content,
        html_content: translatedData.html,
      });
    }

    // Update all emails with translations
    for (const translatedEmail of translatedEmails) {
      await supabaseClient
        .from("email_sequences")
        .update({
          subject: translatedEmail.subject,
          content: translatedEmail.content,
          html_content: translatedEmail.html_content,
        })
        .eq("id", translatedEmail.id);
    }

    console.log("Campaign translation completed successfully");

    return new Response(
      JSON.stringify({ success: true, translatedCount: translatedEmails.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in translate-campaign:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
