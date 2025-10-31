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
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
          "HTTP-Referer": "https://vayno.app",
          "X-Title": "Vayno Campaign Translator",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
          messages: [{
            role: "user",
            content: `Translate the following email content to ${targetLanguage}. Preserve formatting, tone, and brand voice. Keep CTAs and links unchanged.

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
}`
          }],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        console.error("AI API error:", response.status);
        throw new Error(`Translation failed for email ${email.sequence_number}`);
      }

      const aiData = await response.json();
      let contentText = aiData.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      if (contentText.startsWith("```json")) {
        contentText = contentText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (contentText.startsWith("```")) {
        contentText = contentText.replace(/```\n?/g, "");
      }
      
      const translatedData = JSON.parse(contentText);
      
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
