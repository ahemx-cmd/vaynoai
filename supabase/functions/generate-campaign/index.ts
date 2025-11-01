import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  campaignId: z.string().uuid("Invalid campaign ID format"),
  url: z.string().url("Invalid URL format").max(2000, "URL too long"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for authentication (optional for guest campaigns)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    
    if (authHeader) {
      // Create authenticated Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      // Try to verify user authentication
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
        console.log("Authenticated user:", user.id);
      }
    }

    // Validate input data
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

    const { campaignId, url } = validationResult.data;
    
    // Use service role for campaign operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // Verify campaign exists and check ownership for authenticated users
    const { data: campaign, error: campaignError } = await serviceClient
      .from("campaigns")
      .select("user_id")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError?.message);
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For authenticated users, verify ownership; for guest campaigns (user_id null), allow
    if (user && campaign.user_id && campaign.user_id !== user.id) {
      console.error("Unauthorized access attempt - user does not own campaign");
      return new Response(
        JSON.stringify({ error: "Unauthorized - You don't own this campaign" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If unauthenticated, only allow processing for guest campaigns (user_id must be null)
    if (!user && campaign.user_id) {
      console.error("Unauthorized access attempt - unauthenticated user tried to generate for owned campaign");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Sign in required for this campaign" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting campaign generation for:", campaignId);

    // CRITICAL: Fetch the actual URL content first
    console.log("Fetching URL content:", url);
    let pageContent = "";
    try {
      const urlResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!urlResponse.ok) {
        throw new Error(`Failed to fetch URL: ${urlResponse.status}`);
      }
      
      const html = await urlResponse.text();
      
      // Extract text content from HTML (basic extraction)
      pageContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log("Successfully fetched page content, length:", pageContent.length);
    } catch (fetchError) {
      console.error("Error fetching URL:", fetchError);
      pageContent = "Unable to fetch page content. Please analyze based on the URL.";
    }

    // Generate emails using AI
    console.log("Calling AI API for URL:", url);
    
    // Determine number of emails based on drip duration from campaign
    const { data: campaignDetails } = await serviceClient
      .from("campaigns")
      .select("drip_duration, words_per_email, include_cta, cta_link")
      .eq("id", campaignId)
      .single();
    
    let numEmails = 4; // default
    const wordsPerEmail = campaignDetails?.words_per_email || 250;
    const includeCTA = campaignDetails?.include_cta ?? true;
    const ctaLink = campaignDetails?.cta_link || null;
    
    if (campaignDetails?.drip_duration) {
      switch (campaignDetails.drip_duration) {
        case "7-day":
          numEmails = 4;
          break;
        case "14-day":
          numEmails = 7;
          break;
        case "30-day":
          numEmails = 12;
          break;
      }
    }
    
    console.log(`Generating ${numEmails} emails for ${campaignDetails?.drip_duration || 'default'} drip with ${wordsPerEmail} words per email`);
    
    const ctaInstructions = includeCTA 
      ? (ctaLink 
          ? `- Include clear Call-to-Action buttons that link to: ${ctaLink}`
          : `- Include Call-to-Action text (not as clickable buttons, just compelling text encouraging action)`)
      : `- DO NOT include any Call-to-Action buttons or CTA text in the emails`;
    
    const systemPrompt = `You are a world-class email copywriting team with 15+ years of experience in conversion optimization, persuasive writing, and digital marketing. You have written campaigns for Fortune 500 companies and achieved industry-leading open rates and conversion rates.

YOUR CORE EXPERTISE:
- Deep understanding of consumer psychology and buying triggers
- Master of persuasive writing techniques (AIDA, PAS, storytelling)
- Expert in email deliverability and anti-spam best practices
- Skilled at brand voice matching and tone adaptation
- Specialist in A/B testing insights and data-driven copywriting

YOUR STANDARDS:
✓ Every word must serve a purpose - zero fluff
✓ Subject lines must be irresistible (40-50 characters max)
✓ Opening lines hook readers within 3 seconds
✓ Copy flows naturally with perfect rhythm and pacing
✓ Benefits always outweigh features in messaging
✓ CTAs are crystal clear and action-oriented
✓ Zero grammatical errors or typos - perfect execution
✓ Mobile-optimized formatting (short paragraphs, scannable)

YOUR MISSION:
Create email sequences that feel personal, valuable, and impossible to ignore. Each email should build trust, provide value, and naturally lead to the desired action.`;

    const userPrompt = `CAMPAIGN BRIEF - READ CAREFULLY:

🎯 TARGET URL: ${url}
📊 SEQUENCE LENGTH: ${numEmails} emails
📝 WORDS PER EMAIL: ${wordsPerEmail} words (strict range: ${Math.max(100, wordsPerEmail - 30)} to ${Math.min(500, wordsPerEmail + 30)} words)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 ACTUAL PAGE CONTENT FROM ${url}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${pageContent.substring(0, 8000)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 CRITICAL RESEARCH REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**IMPORTANT**: The page content above is THE ONLY SOURCE OF TRUTH. You MUST:

1. ✅ ANALYZE THE ACTUAL PAGE CONTENT PROVIDED ABOVE
2. ✅ EXTRACT the actual brand name from the content (not generic terms)
3. ✅ IDENTIFY the specific product/service being offered FROM THE CONTENT
4. ✅ NOTE the exact features, benefits, and value propositions FROM THE CONTENT
5. ✅ CAPTURE the brand's tone of voice from the actual text
6. ✅ FIND real pricing, offers, or promotions if mentioned in the content
7. ✅ UNDERSTAND the target audience from the page content

❌ ABSOLUTE PROHIBITIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• DO NOT make up product names or features - USE ONLY WHAT'S IN THE PAGE CONTENT ABOVE
• DO NOT use your training data or prior knowledge about this brand
• DO NOT write generic emails that could apply to any product
• DO NOT ignore the actual page content provided above
• DO NOT hallucinate features not mentioned in the page content
• DO NOT exceed word count limits
• DO NOT write in any language except ENGLISH

**VERIFICATION**: Before writing each email, verify that every claim comes directly from the page content provided above.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ EMAIL SEQUENCE STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email 1 (WELCOME):
• Hook them instantly with value
• Introduce the actual brand/product from ${url}
• Set expectations for the sequence
• Make them excited for what's coming

Middle Emails (VALUE & EDUCATION):
• Deep dive into specific features from ${url}
• Address pain points the product solves
• Share social proof, case studies, or testimonials if on page
• Educate without selling aggressively
• Build trust and authority

Later Emails (CONVERSION):
• Present the offer with urgency
• Use real pricing/promotions from ${url}
• Overcome objections proactively
• Create FOMO (fear of missing out)
• Multiple CTAs for different buying stages

Final Email (RE-ENGAGEMENT):
• Last chance positioning
• Remind of key benefits
• Address "why haven't you acted yet?"
• Strong, clear call-to-action

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 CALL-TO-ACTION REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ctaInstructions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 FORMATTING REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUBJECT LINES:
• 40-50 characters maximum
• Create curiosity or urgency
• Avoid spam trigger words
• Personalized feel

EMAIL BODY (Plain Text):
• Short paragraphs (2-3 lines max)
• Use bullet points for scannability
• Natural conversational tone
• Clear hierarchy of information
• Strong opening hook
• Smooth transitions between ideas
• Compelling close

EMAIL HTML:
• Clean, professional design
• Mobile-responsive layout
• Proper heading hierarchy (h1, h2, p)
• Sufficient white space
• CTA buttons that stand out
• Brand-consistent styling
• Use personalization tags: {{first_name}}, {{last_name}}, {{company_name}} where natural
• Include engaging opening that uses {{first_name}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 QUALITY CHECKLIST (ALL MUST PASS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Uses actual brand/product name from ${url}
✅ References specific features from the landing page
✅ Matches the tone of voice from ${url}
✅ Word count within ${Math.max(100, wordsPerEmail - 30)}-${Math.min(500, wordsPerEmail + 30)} range
✅ Zero spelling/grammar errors
✅ Subject line under 50 characters
✅ Clear, actionable CTA
✅ Mobile-friendly formatting
✅ Written in ENGLISH
✅ Provides real value to readers
✅ Builds logical progression through sequence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT (STRICT JSON):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON with NO markdown, NO code blocks, NO explanatory text:

{
  "emails": [
    {
      "type": "welcome",
      "subject": "Compelling subject line in English (40-50 chars)",
      "content": "Plain text email body in English (~${wordsPerEmail} words, properly formatted with line breaks)",
      "html": "HTML email with proper tags, styling, and structure in English (~${wordsPerEmail} words)"
    }
  ]
}

NOW CREATE THE EMAIL SEQUENCE BASED ON ${url} - MAKE IT EXCEPTIONAL! 🚀`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
        "HTTP-Referer": "https://vayno.app",
        "X-Title": "Vayno",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "user",
            content: fullPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      // Handle specific error codes
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Insufficient AI credits. Please add credits to your Lovable workspace to continue." 
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a few moments." 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      throw new Error(`AI API failed: ${response.status}`);
    }

    const aiData = await response.json();
    
    // OpenRouter returns OpenAI-compatible format
    if (!aiData.choices?.[0]?.message?.content) {
      console.error("Invalid AI response format:", aiData);
      throw new Error("Invalid AI response format");
    }

    let contentText = aiData.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (contentText.startsWith("```json")) {
      contentText = contentText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (contentText.startsWith("```")) {
      contentText = contentText.replace(/```\n?/g, "");
    }
    
    console.log("Raw AI response:", contentText);
    
    let emailsData;
    try {
      emailsData = JSON.parse(contentText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content length:", contentText.length);
      console.error("Content preview:", contentText.substring(0, 500));
      console.error("Content end:", contentText.substring(contentText.length - 500));
      
      return new Response(
        JSON.stringify({ 
          error: "The AI model returned an incomplete response. The free DeepSeek model has limitations. Please use a paid model like 'deepseek/deepseek-chat' or 'openai/gpt-4o-mini' for reliable results." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (!emailsData.emails || !Array.isArray(emailsData.emails)) {
      console.error("Invalid emails structure:", emailsData);
      throw new Error("AI response missing emails array");
    }
    
    console.log("Generated", emailsData.emails.length, "emails");

    // Save emails using service client (bypasses RLS for bulk insert)
    for (let i = 0; i < emailsData.emails.length; i++) {
      const email = emailsData.emails[i];
      await serviceClient.from("email_sequences").insert({
        campaign_id: campaignId,
        sequence_number: i + 1,
        email_type: email.type,
        subject: email.subject,
        content: email.content,
        html_content: email.html,
      });
    }

    const { error: updateError } = await serviceClient
      .from("campaigns")
      .update({ status: "completed" })
      .eq("id", campaignId);

    if (updateError) {
      console.error("Failed to update campaign status:", updateError);
      throw updateError;
    }

    console.log("Campaign generation completed successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-campaign:", error);
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