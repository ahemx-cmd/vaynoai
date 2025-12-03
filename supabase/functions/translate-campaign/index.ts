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

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Translate all emails using two-step AI pipeline
    const translatedEmails = [];
    for (const email of emails) {
      const translationPrompt = `You are an expert translator specializing in marketing and email copywriting. Translate the following email content to ${targetLanguage}.

CRITICAL REQUIREMENTS:
• Preserve the EXACT same tone, voice, and brand personality
• Keep all formatting intact (paragraphs, line breaks, structure)
• Maintain the persuasive power and emotional impact
• Keep CTAs compelling in the target language
• Preserve all personalization tags like {{first_name}}, {{company_name}} exactly as-is
• Keep any URLs/links unchanged
• Ensure the translation sounds native, not machine-translated

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

      // ═══════════════════════════════════════════════════════════════════
      // STEP 1: DRAFT TRANSLATION with Groq (Llama 3.3 70B)
      // ═══════════════════════════════════════════════════════════════════
      console.log(`═══ Email ${email.sequence_number}: Step 1 - Draft Translation ═══`);
      const draftResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: translationPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!draftResp.ok) {
        const errorText = await draftResp.text();
        console.error("Groq translation error:", draftResp.status, errorText);
        
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
        throw new Error("Invalid draft translation response");
      }
      
      let draftContent = draftData.choices[0].message.content.trim();
      console.log(`✅ Draft translation complete for email ${email.sequence_number}`);

      // ═══════════════════════════════════════════════════════════════════
      // STEP 2: POLISH with Claude via OpenRouter
      // ═══════════════════════════════════════════════════════════════════
      let finalContent = draftContent;
      
      if (OPENROUTER_API_KEY) {
        console.log(`═══ Email ${email.sequence_number}: Step 2 - Polish with Claude ═══`);
        
        const polishPrompt = `You are a native ${targetLanguage} copywriter. Review and polish this translated email for perfect fluency and natural phrasing.

ORIGINAL TRANSLATION (JSON):
${draftContent}

POLISH REQUIREMENTS:
• Ensure it reads like it was originally written in ${targetLanguage}, not translated
• Fix any awkward phrasing or unnatural constructions
• Maintain the persuasive marketing tone
• Preserve all personalization tags ({{first_name}}, etc.) exactly
• Keep URLs and links unchanged
• Ensure emotional impact is preserved

Return ONLY valid JSON (no markdown, no code blocks):
{
  "subject": "polished subject",
  "content": "polished plain text content",
  "html": "polished HTML content"
}`;

        try {
          const polishResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://vayno.app",
              "X-Title": "Vayno Translation Polish"
            },
            body: JSON.stringify({
              model: "anthropic/claude-sonnet-4-20250514",
              messages: [
                { role: "user", content: polishPrompt }
              ],
              temperature: 0.5,
            }),
          });

          if (polishResp.ok) {
            const polishData = await polishResp.json();
            if (polishData.choices?.[0]?.message?.content) {
              finalContent = polishData.choices[0].message.content.trim();
              console.log(`✅ Polish complete for email ${email.sequence_number}`);
            }
          } else {
            console.warn(`Claude polish failed for email ${email.sequence_number}, using draft`);
          }
        } catch (polishError) {
          console.warn(`Claude polish error for email ${email.sequence_number}:`, polishError);
        }
      }
      
      // Parse the final content
      let contentText = finalContent;
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
          } catch (e2) {
            console.error("Translation parse failed:", e2);
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

    console.log("✅ Campaign translation completed successfully (Draft + Polish pipeline)");

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
