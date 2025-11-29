import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { campaignId, targetLanguage } = await req.json();

    if (!campaignId || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: "Missing campaignId or targetLanguage" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("campaigns")
      .select("user_id")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign || campaign.user_id !== user.id) {
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

    console.log(`Translating ${emails.length} emails to ${targetLanguage}`);

    // Translate all emails using AI
    const translatedEmails = [];
    for (const email of emails) {
      const prompt = `Translate the following email content to ${targetLanguage}. Preserve formatting, tone, and brand voice. Keep CTAs and links unchanged.

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

      // Use OpenRouter with Claude Sonnet 4
      const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
      if (!OPENROUTER_API_KEY) {
        console.error("OPENROUTER_API_KEY not configured");
        return new Response(
          JSON.stringify({ error: "AI service not configured. Please contact support." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Translating email ${email.sequence_number} with OpenRouter`);
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vayno.app",
          "X-Title": "Vayno Campaign Translation"
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4",
          messages: [
            { role: "user", content: prompt }
          ],
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("OpenRouter API error:", resp.status, errorText);
        
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits depleted. Please add credits to your OpenRouter account." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited. Please wait a moment and retry." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await resp.json();

      // OpenRouter returns OpenAI-compatible format
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
