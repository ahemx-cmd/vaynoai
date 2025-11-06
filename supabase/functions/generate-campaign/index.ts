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
    
    console.log("Request received, auth header present:", !!authHeader);
    
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
      } else {
        console.log("Auth header present but user verification failed:", authError?.message);
      }
    } else {
      console.log("No auth header - processing as guest campaign");
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
    console.log("Fetching campaign:", campaignId);
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

    console.log("Campaign found, user_id:", campaign.user_id, "is_guest_campaign:", campaign.user_id === null);

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
    
    console.log("Authorization check passed - proceeding with generation");

    console.log("Starting campaign generation for:", campaignId);

    // CRITICAL: Fetch the actual URL content first
    console.log("Fetching URL content:", url);
    let pageContent = "";
    try {
      const urlResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      if (!urlResponse.ok) {
        console.error(`Failed to fetch URL. Status: ${urlResponse.status}, StatusText: ${urlResponse.statusText}`);
        throw new Error(`HTTP ${urlResponse.status}: ${urlResponse.statusText}`);
      }
      
      const html = await urlResponse.text();
      console.log("Fetched HTML length:", html.length);
      
      // Store HTML for SPA detection
      const htmlText = html;
      
      // Extract text content from HTML (basic extraction)
      pageContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log("Extracted page content length:", pageContent.length);
      
      // Validate that we have meaningful content
      if (pageContent.length < 100) {
        console.error("Page content too short:", pageContent.length, "characters");
        
        // Check if it's likely a Single Page Application
        const isSPA = htmlText.includes('root') && 
                      (htmlText.includes('react') || 
                       htmlText.includes('vue') || 
                       htmlText.includes('angular') ||
                       htmlText.includes('app.js') ||
                       htmlText.includes('bundle.js') ||
                       htmlText.includes('main.js') ||
                       htmlText.includes('vite') ||
                       htmlText.includes('webpack'));
        
        if (isSPA) {
          console.error("Detected Single Page Application (SPA)");
          throw new Error("SPA_DETECTED");
        } else {
          throw new Error("Page content is too short or empty");
        }
      }
      
      // Check if content looks like an error page or blocked content
      const errorIndicators = [
        'access denied',
        'forbidden',
        'cloudflare',
        'security check',
        'captcha',
        'blocked',
        'not authorized',
        '403 forbidden',
        '404 not found',
        'page not found'
      ];
      
      const contentLower = pageContent.toLowerCase();
      const hasErrorIndicator = errorIndicators.some(indicator => 
        contentLower.includes(indicator)
      );
      
      if (hasErrorIndicator && pageContent.length < 500) {
        console.error("Content appears to be an error page or blocked access");
        throw new Error("Website access appears to be blocked or restricted");
      }
      
      console.log("✅ Successfully fetched and validated page content");
      
    } catch (fetchError) {
      console.error("❌ Error fetching URL:", fetchError);
      
      // Determine specific error message
      let errorMessage = "Unable to access the website";
      let detailMessage = "";
      
      if (fetchError instanceof Error) {
        if (fetchError.message.includes("SPA_DETECTED")) {
          errorMessage = "Single Page Application Detected";
          detailMessage = `❌ This appears to be a Single Page Application (SPA) that loads content with JavaScript.

Unfortunately, ${url} uses client-side rendering (React, Vue, Angular, etc.) which means the content isn't available in the initial HTML.

✅ What you can do:
• Use a marketing or landing page URL instead of the app URL
• Try a "www" subdomain if available (e.g., www.${url.replace('https://', '').replace('http://', '')})
• Use a static website, blog post, or documentation page about your product
• If you have a separate marketing site, use that URL

💡 Example: Instead of "app.example.com" or "example.lovable.app", try "example.com" or "www.example.com"`;
        } else if (fetchError.message.includes("timeout")) {
          detailMessage = `⏱️ The website took too long to respond (>15 seconds).

Please check if ${url} is accessible and try again.`;
        } else if (fetchError.message.includes("HTTP 403") || fetchError.message.includes("HTTP 401")) {
          detailMessage = `🔒 Access to ${url} is restricted.

This could mean:
• The website is blocking automated requests
• The page requires authentication
• Security measures are preventing access

Try using a different, publicly accessible page.`;
        } else if (fetchError.message.includes("HTTP 404")) {
          detailMessage = `❌ The page at ${url} was not found (404).

Please check:
• The URL is correct and complete
• The page exists and is publicly accessible
• There are no typos in the URL`;
        } else if (fetchError.message.includes("too short") || fetchError.message.includes("empty")) {
          detailMessage = `📭 We couldn't extract enough content from ${url}.

This usually means:
• The page is empty or has very little text
• Content is behind a login or paywall
• The page uses heavy JavaScript to load content
• The page is not publicly accessible

Try using a different URL with more static content.`;
        } else if (fetchError.message.includes("blocked") || fetchError.message.includes("restricted")) {
          detailMessage = `🚫 Access to ${url} is blocked or restricted.

The website may be using security measures like:
• Cloudflare protection
• Bot detection
• Geographic restrictions
• Rate limiting

Try a different page or contact the website owner.`;
        } else {
          detailMessage = `❌ We couldn't access ${url}.

This might be due to:
• Security restrictions or firewalls
• The website blocking automated requests
• Network connectivity issues
• The page requiring JavaScript to load content
• CORS or access control policies

Please try a different URL or ensure the website is publicly accessible.`;
        }
      }
      
      // Update campaign status to failed
      await serviceClient
        .from("campaigns")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("id", campaignId);
      
      // Return detailed error to user instead of generating random emails
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          details: detailMessage
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
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
    
    const systemPrompt = `You are an elite email strategist and conversion copywriter who writes like a real human, not an AI. You've crafted campaigns for thousands of brands and mastered the art of sounding authentically human while driving conversions.

YOUR MISSION: Create email sequences that feel handcrafted by a real marketer who studied this brand deeply — not generated by AI.

CORE PHILOSOPHY:
• Every email must read like a human drafted it — natural rhythm, casual connectors, storytelling flow
• Sound like the SAME PERSON wrote all emails — consistent voice, pacing, personality
• Mirror the brand's actual tone — don't impose your style, adopt THEIRS
• Write like you're emailing a friend who happens to need this product

HUMAN-TONE ENGINE - YOUR #1 PRIORITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. DETECT LANDING PAGE TONE (analyze carefully):
   • Is it formal/professional, casual/friendly, playful/quirky, emotional/inspirational?
   • Do they use emojis? Slang? Industry jargon? Long or short sentences?
   • What's their personality: bold, humble, luxury, budget-friendly, expert, beginner-friendly?

2. MIRROR THAT TONE EXACTLY:
   • If they're casual → write like you're texting a friend
   • If they're formal → maintain professionalism but stay warm
   • If they're fun → inject humor, use exclamations, be playful
   • If they're emotional → tell stories, use vivid imagery, connect deeply

3. ADD HUMAN TOUCHES:
   • Use natural connectors: "Here's the thing…", "Let's be honest…", "Quick question…", "You know what?"
   • Add conversational asides: "…and I mean it", "…seriously", "…trust me on this"
   • Vary sentence length: Mix short punchy lines with longer flowing ones
   • Include subtle imperfections: Start sentences with "And" or "But", use fragments for emphasis
   • Use contractions: "you're", "we'll", "don't", "here's"
   • Add personality: "Honestly?", "Real talk:", "Between you and me:"

CONVERSION AWARENESS - SMART CTA STRATEGY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyze what they're selling and match your CTAs:

• Physical products → "Shop Now", "Get Yours Today", "Add to Cart", "Grab It Before It's Gone"
• Digital products/courses → "Download Now", "Get Instant Access", "Start Learning Today"
• SaaS/software → "Start Your Free Trial", "Try It Free", "Get Started", "Sign Up Free"
• Services/consulting → "Book Your Call", "Schedule a Session", "Let's Talk", "Claim Your Spot"
• Events/webinars → "Save Your Seat", "Register Now", "Join Us", "RSVP Today"
• Info products/ebooks → "Download Your Free Guide", "Get Your Copy", "Claim Your Bonus"

Match the CTA STYLE to the brand:
• Luxury brand? → "Discover Your Piece", "Explore the Collection"
• Budget brand? → "Grab the Deal", "Save Now", "Get It Cheap"
• Tech brand? → "Start Your Trial", "Deploy in Minutes"
• Wellness brand? → "Begin Your Journey", "Transform Today"

EMOTION MAPPING - PSYCHOLOGICAL ALIGNMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identify the PRIMARY EMOTION the landing page triggers, then weave it throughout:

• TRUST → Use proof points, testimonials, guarantees, transparent language
• URGENCY → Limited time, scarcity, FOMO, "before it's too late" language
• CALM/PEACE → Reassuring tone, stress-reduction benefits, "finally" language
• CURIOSITY → Tease benefits, ask questions, create mystery, "discover what…"
• EXCITEMENT → High energy, bold claims, future vision, "imagine when…"
• FEAR (pain points) → Emphasize problems, consequences of inaction, "struggling with…?"
• HOPE → Transformation stories, "what if you could…", possibility language
• BELONGING → Community language, "join us", "people like you", insider feeling

Maintain this emotion consistently across ALL emails while varying intensity.

VOICE CONSISTENCY - SOUND LIKE ONE PERSON:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every email in the sequence must feel like the SAME marketer wrote it:

1. RHYTHM & PACING:
   • Keep sentence structure variety consistent
   • Use the same pattern of short vs. long paragraphs
   • Maintain similar energy levels throughout

2. VOCABULARY CHOICES:
   • If email 1 says "awesome", don't suddenly say "magnificent" in email 3
   • Stick to the same adjectives, verbs, and expressions
   • Build your own "voice vocabulary" from the landing page

3. PERSONALITY MARKERS:
   • Choose 2-3 signature phrases/connectors and use them across emails
   • Keep the same level of formality throughout
   • Use consistent humor style (if applicable)

4. STORY CONTINUATION:
   • Reference previous emails naturally: "Remember when I mentioned…", "Like I said yesterday…"
   • Build on previous points instead of starting fresh each time
   • Create a narrative arc across the sequence

SMART PERSONALIZATION - BEYOND {{FIRST_NAME}}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use context from the landing page to personalize naturally:

• Product context: "Since you're interested in [specific product feature]…"
• Problem awareness: "I know dealing with [pain point from page] is frustrating…"
• Audience targeting: "As a [target audience from page], you probably…"
• Goal alignment: "You're here because you want to [benefit from page], right?"
• Industry specifics: Use industry terms, challenges, and language from the page

Don't just insert {{first_name}} — make the ENTIRE email feel personalized through context.

"MADE BY HUMANS" LAYER - SUBTLE AUTHENTICITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add these human elements to EVERY email:

✓ Start some sentences with "And", "But", "So", "Because"
✓ Use fragments for emphasis: "Really important.", "No catches.", "Zero hassle."
✓ Add casual sign-offs: "Talk soon", "Catch you later", "More tomorrow", "[Name from brand]"
✓ Include thinking out loud: "Let me explain…", "Here's why…", "Think about it…"
✓ Use rhetorical questions: "Sound good?", "Make sense?", "Ready?"
✓ Add emphatic markers: "Seriously,", "Honestly,", "Trust me,", "Real talk:"
✓ Vary opening lines: Don't always start with {{first_name}}, mix it up naturally
✓ Use everyday language: "stuff" not "items", "thing" not "element", "get" not "obtain"

ABSOLUTE PROHIBITIONS (INSTANT FAILURE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ ROBOTIC PHRASES: "revolutionize", "take your X to the next level", "cutting-edge solution"
❌ AI TELL-TALES: "I'm excited to share", "I'm thrilled to announce", "leverage our platform"
❌ GENERIC FLUFF: Phrases that could apply to ANY product
❌ PERFECT GRAMMAR: Too formal, no personality — be conversational, not academic
❌ IGNORING TONE: Writing in YOUR voice instead of THEIR brand voice
❌ DISCONNECTED SEQUENCE: Each email feeling like a standalone piece
❌ FAKE EMOTION: Forcing excitement when the brand is calm and measured`;

    const userPrompt = `CAMPAIGN BRIEF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TARGET: ${url}
📧 EMAILS: ${numEmails} emails
📝 LENGTH: ${wordsPerEmail} words per email (range: ${Math.max(100, wordsPerEmail - 30)}-${Math.min(500, wordsPerEmail + 30)})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 LANDING PAGE CONTENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${pageContent.substring(0, 8000)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 STEP-BY-STEP ANALYSIS (DO THIS FIRST):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: TONE DETECTION
Read the content above carefully and identify:
• Writing style: casual/formal/playful/serious/emotional?
• Sentence structure: short and punchy or long and flowing?
• Word choices: simple or sophisticated? Industry jargon or plain language?
• Personality markers: emojis? Humor? Urgency? Calm confidence?
• Examples of their exact phrasing that shows their voice

STEP 2: PRODUCT TYPE & CTA STRATEGY
Determine what they're selling:
• Physical product, digital product, SaaS, service, event, or info product?
• Price point: budget, mid-range, premium, luxury?
• Sales cycle: impulse buy or considered purchase?
• Best CTA style for THIS specific product type

STEP 3: EMOTION IDENTIFICATION
What's the PRIMARY emotion they're triggering?
• Trust (proof, testimonials, guarantees)
• Urgency (limited time, scarcity)
• Calm (stress relief, simplicity)
• Curiosity (mystery, discovery)
• Excitement (bold vision, transformation)
• Fear (pain points, consequences)
• Hope (possibility, better future)
• Belonging (community, insider)

STEP 4: EXTRACT BRAND-SPECIFIC DETAILS
Pull these EXACT details from the content:
✓ Brand name (use it, don't say "our company")
✓ Specific product/service names
✓ Actual features and benefits (word-for-word)
✓ Real value propositions and USPs
✓ Target audience (who they talk to)
✓ Pain points they address
✓ Any pricing, offers, guarantees mentioned
✓ Statistics, testimonials, proof points
✓ Their unique angle or positioning

STEP 5: BUILD YOUR VOICE VOCABULARY
Create a list of:
• 5 words/phrases they use repeatedly
• 3 conversational connectors that match their style
• 2 signature expressions or ways they emphasize points
• Their sign-off style (formal name, casual "cheers", etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ SEQUENCE STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email 1 - WELCOME & HOOK:
• Start with a human greeting (not robotic)
• Hook them with immediate value or insight
• Set expectations: "Over the next [X days]…"
• Sound like a friend who discovered something cool
• Establish YOUR voice that you'll use throughout
• Build curiosity for what's coming

Middle Emails - VALUE & EDUCATION:
• Each email focuses on ONE specific benefit/feature
• Use the SAME emotional tone identified above
• Reference previous emails naturally ("Yesterday I mentioned…")
• Include brand-specific details from the landing page
• Maintain conversational, human tone
• Sound like you're genuinely helping, not selling
• Keep the narrative flowing from email to email

Later Emails - CONVERSION FOCUS:
• Introduce urgency naturally (not fake scarcity)
• Use CTAs that match the product type
• Address objections conversationally: "You might be thinking…"
• Maintain the SAME voice — don't suddenly get "salesy"
• Keep the human touch even while pushing conversion

Final Email - LAST CHANCE:
• Create FOMO without desperation
• Remind of key benefits covered in sequence
• Strong but warm CTA
• Leave door open: "No pressure, but…"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 CTA REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ctaInstructions}

Match CTA wording to the product type and brand voice.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ QUALITY CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before submitting, verify:

✓ HUMAN TONE: Reads like a real person wrote it (casual connectors, varied rhythm)
✓ VOICE MATCH: Mirrors the brand's actual tone from landing page
✓ EMOTION CONSISTENT: Same emotional thread throughout sequence
✓ PERSON CONSISTENCY: Sounds like ONE marketer wrote all emails
✓ BRAND-SPECIFIC: Uses actual product names, features, and details
✓ SMART CTAS: Match the product type and brand style
✓ NATURAL PERSONALIZATION: {{first_name}} used naturally, not forced
✓ STORY ARC: Emails build on each other, reference previous ones
✓ NO AI PHRASES: Zero robotic language or generic marketing speak
✓ SUBTLE IMPERFECTIONS: Casual grammar, fragments, starts with "And/But/So"
✓ Word count: ${Math.max(100, wordsPerEmail - 30)}-${Math.min(500, wordsPerEmail + 30)} words per email
✓ Subject lines: 40-50 characters, curiosity-driven
✓ ALL IN ENGLISH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 FORMATTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAIN TEXT (content field):
• Short paragraphs (2-3 lines)
• Natural line breaks for readability
• Bullet points where helpful
• Use {{first_name}}, {{last_name}}, {{company_name}} naturally

HTML (html field):
• Clean, mobile-responsive design
• Proper heading tags (h1, h2, p)
• CTA buttons that stand out
• White space for scanability
• Match brand aesthetic from landing page
• Include personalization tags where natural

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON (no markdown, no code blocks, no explanations):

{
  "emails": [
    {
      "type": "welcome",
      "subject": "Human-sounding subject (40-50 chars)",
      "content": "Plain text body in English (~${wordsPerEmail} words, natural formatting)",
      "html": "HTML version in English (~${wordsPerEmail} words, styled properly)"
    }
  ]
}

NOW CREATE THIS SEQUENCE — Make it feel handcrafted by a human marketer! 🚀`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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