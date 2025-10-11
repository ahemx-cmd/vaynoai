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
    const { campaignId, url } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate emails using AI
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
          content: `Analyze this URL: ${url} and create 4 email sequences (welcome, nurture, sales, re-engagement). Each 50-500 words, high-converting copy. Return JSON: {emails: [{type, subject, content, html}]}`
        }],
      }),
    });

    const aiData = await response.json();
    const emailsData = JSON.parse(aiData.choices[0].message.content);

    // Save emails
    for (let i = 0; i < emailsData.emails.length; i++) {
      const email = emailsData.emails[i];
      await supabase.from("email_sequences").insert({
        campaign_id: campaignId,
        sequence_number: i + 1,
        email_type: email.type,
        subject: email.subject,
        content: email.content,
        html_content: email.html,
      });
    }

    await supabase.from("campaigns").update({ status: "completed" }).eq("id", campaignId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});