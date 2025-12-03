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
  brandGuidelines: z.string().optional().nullable(),
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

    const { campaignId, url, brandGuidelines } = validationResult.data;
    
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

    // Check credit balance ONLY for authenticated users with owned campaigns (not guest campaigns)
    if (user && campaign.user_id) {
      console.log("Checking credit balance for user:", user.id);
      const { data: usageData, error: usageError } = await serviceClient
        .from("user_usage")
        .select("generations_used, generations_limit, topup_credits")
        .eq("user_id", user.id)
        .single();

      if (usageError) {
        console.error("Error fetching user usage:", usageError);
        return new Response(
          JSON.stringify({ error: "Unable to verify credit balance" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const totalCredits = usageData.generations_limit + usageData.topup_credits;
      const creditsRemaining = totalCredits - usageData.generations_used;
      
      console.log(`User has ${creditsRemaining} credits remaining (${usageData.generations_limit - usageData.generations_used} subscription + ${usageData.topup_credits} topup)`);

      if (creditsRemaining <= 0) {
        console.error("Insufficient credits for user:", user.id);
        return new Response(
          JSON.stringify({ 
            error: "Insufficient credits", 
            details: "Not enough credits. Please buy a credit pack to continue." 
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (!campaign.user_id) {
      console.log("Guest campaign detected - skipping credit check");
    }

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
      .select("drip_duration, words_per_email, include_cta, cta_link, sequence_type")
      .eq("id", campaignId)
      .single();
    
    let numEmails = 4; // default
    const wordsPerEmail = campaignDetails?.words_per_email || 250;
    const includeCTA = campaignDetails?.include_cta ?? true;
    const ctaLink = campaignDetails?.cta_link || null;
    const sequenceType = campaignDetails?.sequence_type || "welcome";
    
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
    
    console.log(`Generating ${numEmails} emails for ${campaignDetails?.drip_duration || 'default'} drip with ${wordsPerEmail} words per email, sequence type: ${sequenceType}`);
    
    const ctaInstructions = includeCTA 
      ? (ctaLink 
          ? `- Include clear Call-to-Action buttons that link to: ${ctaLink}`
          : `- Include Call-to-Action text (not as clickable buttons, just compelling text encouraging action)`)
      : `- DO NOT include any Call-to-Action buttons or CTA text in the emails`;
    
    // Map sequence types to specific campaign goals and structure
    const sequenceTypeInstructions: Record<string, string> = {
      // SELLER SEQUENCE TYPES
      "welcome": `🎯 SEQUENCE TYPE: WELCOME SERIES
      
GOAL: Say hi, offer a first-time purchase incentive, showcase top products.

STRUCTURE:
• Email 1: Warm welcome, set expectations, introduce brand story
• Email 2: Showcase hero product or bestsellers with social proof
• Email 3: Share exclusive welcome discount or first-purchase incentive
• Email 4+: Build trust with testimonials, address objections, create urgency

TONE: Warm, welcoming, build excitement about being part of the brand community.`,

      "abandoned-cart": `🎯 SEQUENCE TYPE: ABANDONED CART RECOVERY
      
GOAL: Remind customers about items left in their cart and motivate purchase completion.

STRUCTURE:
• Email 1 (1 hour later): Friendly reminder "You left something behind" - show cart items
• Email 2 (24 hours): Add social proof, urgency, or discount incentive
• Email 3 (48 hours): Last chance - create FOMO, testimonials, guarantee
• Email 4+ (optional): Final reminder with strong incentive or scarcity

TONE: Helpful reminder (not pushy), address objections, remove friction.`,

      "browse-abandonment": `🎯 SEQUENCE TYPE: BROWSE ABANDONMENT
      
GOAL: Target users who browsed but didn't add anything to cart.

STRUCTURE:
• Email 1: "Still thinking about [product]?" - show what they viewed
• Email 2: Address objections, provide more details about products they viewed
• Email 3: Offer help or incentive to complete purchase
• Email 4+: Showcase similar items or alternatives, limited-time offer

TONE: Non-pushy, helpful, show you remember their interest.`,

      "checkout-abandonment": `🎯 SEQUENCE TYPE: CHECKOUT ABANDONMENT
      
GOAL: Recover users who started checkout but didn't complete payment.

STRUCTURE:
• Email 1 (immediate): "Almost there!" - direct link to complete checkout
• Email 2 (6 hours): Address payment concerns, show security badges, offer support
• Email 3 (24 hours): Add incentive (free shipping, discount) + urgency
• Email 4 (48 hours): Last chance with strong incentive and social proof

TONE: Helpful, remove friction, address payment concerns, build trust.`,

      "post-purchase": `🎯 SEQUENCE TYPE: POST-PURCHASE THANK-YOU / ORDER FOLLOW-UP
      
GOAL: Confirm order, say thanks, build relationship, cross-sell naturally.

STRUCTURE:
• Email 1: Order confirmation + genuine thank you + shipping details
• Email 2: Product tips, how to get most value, care instructions
• Email 3: Request review/feedback (after delivery)
• Email 4+: Cross-sell complementary products, build community

TONE: Grateful, helpful, relationship-building (not immediately salesy).`,

      "review-request": `🎯 SEQUENCE TYPE: REVIEW REQUEST SERIES
      
GOAL: Ask for reviews and feedback after purchase or delivery.

STRUCTURE:
• Email 1 (7 days after delivery): "How's [product]?" - friendly check-in
• Email 2: Direct review request with easy 1-click link
• Email 3: Incentivize with discount on next purchase for leaving review
• Email 4: Final gentle reminder with social proof of others who reviewed

TONE: Friendly ask, make it easy, show how reviews help other customers.`,

      "upsell": `🎯 SEQUENCE TYPE: UPSELL / CROSS-SELL SERIES
      
GOAL: Promote complementary products or premium versions to existing customers.

STRUCTURE:
• Email 1: "You might also love..." - show complementary products
• Email 2: Explain how products work together, bundle benefits
• Email 3: Limited-time bundle offer or upgrade discount
• Email 4+: Final chance with strong incentive and testimonials

TONE: Helpful recommendations (like a friend), show genuine value add.`,

      "re-engagement": `🎯 SEQUENCE TYPE: RE-ENGAGEMENT / WIN-BACK
      
GOAL: Reconnect with customers who haven't bought in a while.

STRUCTURE:
• Email 1: "We miss you!" - acknowledge absence, tease new products
• Email 2: Show what they've missed (new products, features, improvements)
• Email 3: Exclusive "come back" offer or discount
• Email 4: Last chance with strong incentive and FOMO

TONE: "We miss you" (genuine), make them feel valued, create excitement.`,

      "vip-loyalty": `🎯 SEQUENCE TYPE: VIP / LOYALTY SEQUENCE
      
GOAL: Reward repeat customers and make them feel special.

STRUCTURE:
• Email 1: "You're a VIP!" - thank them for loyalty, introduce program
• Email 2: Exclusive perks preview (early access, special discounts)
• Email 3: VIP-only offer or product launch
• Email 4+: Ongoing VIP benefits, insider updates, make them feel special

TONE: Exclusive, insider, make them feel truly valued and special.`,

      "back-in-stock": `🎯 SEQUENCE TYPE: BACK-IN-STOCK / PRICE-DROP ALERT
      
GOAL: Notify customers when products they liked or wishlisted return or go on sale.

STRUCTURE:
• Email 1: "It's back!" or "Price dropped!" - create urgency
• Email 2: Show limited stock or time-sensitive offer
• Email 3: Add social proof, testimonials, "selling fast" urgency
• Email 4: Final chance before it's gone again

TONE: Exciting news, create urgency (authentic scarcity), help them not miss out.`,

      // FOUNDER SEQUENCE TYPES
      "welcome-onboarding": `🎯 SEQUENCE TYPE: WELCOME / ONBOARDING SEQUENCE
      
GOAL: Introduce the product, highlight 'aha' moments, set expectations.

STRUCTURE:
• Email 1: Welcome! Set expectations, introduce core value
• Email 2: First "aha" moment - one key feature/benefit
• Email 3: Second key feature, how it solves their problem
• Email 4+: Build habit, share tips, guide to success

TONE: Warm welcome, guide them to success (not just feature dump).`,

      "trial-upgrade": `🎯 SEQUENCE TYPE: TRIAL → PAID UPGRADE FLOW
      
GOAL: Guide trial users toward conversion with reminders and value nudges.

STRUCTURE:
• Email 1: Welcome to trial! Show most valuable features first
• Email 2: "Here's what most successful users do..." (activation tips)
• Email 3: Mid-trial check-in, case study, value reminder
• Email 4: Trial ending soon - upgrade CTA with urgency and benefits
• Email 5+: Final reminder, address objections, offer help/demo

TONE: Helpful guide, show value, create urgency as trial ends.`,

      "activation": `🎯 SEQUENCE TYPE: ACTIVATION / FEATURE EDUCATION FLOW
      
GOAL: Teach users how to use key features and drive adoption.

STRUCTURE:
• Email 1: "Let's get you set up" - first critical action
• Email 2: One key feature deep dive with how-to
• Email 3: Next important feature, show advanced use case
• Email 4+: Pro tips, shortcuts, make them power users

TONE: Educational, empower them, celebrate progress.`,

      "feature-announcement": `🎯 SEQUENCE TYPE: FEATURE ANNOUNCEMENT / PRODUCT LAUNCH
      
GOAL: Announce new features, explain why they matter, get people excited.

STRUCTURE:
• Email 1: Tease the announcement, build curiosity
• Email 2: Full reveal - what it is, why it matters, how it helps
• Email 3: Deep dive - use cases, examples, early user results
• Email 4: Launch offer or early access, create urgency

TONE: Exciting, show why this matters to THEM, build anticipation.`,

      "educational-nurture": `🎯 SEQUENCE TYPE: EDUCATIONAL / NURTURE DRIP
      
GOAL: Share value-driven content, tips, or best practices.

STRUCTURE:
• Email 1: Framework or mental model (foundational insight)
• Email 2: Tactical tip or how-to (actionable)
• Email 3: Case study or example (social proof)
• Email 4+: Deep dive or advanced technique

TONE: Teaching, genuinely helpful, position as expert guide.`,

      "churn-recovery": `🎯 SEQUENCE TYPE: CHURN RECOVERY / WIN-BACK
      
GOAL: Re-engage inactive or churned users.

STRUCTURE:
• Email 1: "We miss you" - acknowledge absence, ask for feedback
• Email 2: Show what they've missed (new features, improvements)
• Email 3: Exclusive "come back" offer (discount, extended trial)
• Email 4: Final chance, address why they might have left

TONE: Understand why they left, show you've improved, genuine incentive.`,

      "expansion-upgrade": `🎯 SEQUENCE TYPE: EXPANSION / UPGRADE FLOW
      
GOAL: For existing users - upsell to higher tiers, promote add-ons.

STRUCTURE:
• Email 1: "Ready to level up?" - tease premium benefits
• Email 2: Show what they're missing (premium features, use cases)
• Email 3: Case study of successful upgraded user
• Email 4: Limited-time upgrade offer with incentive

TONE: Show they've outgrown current plan, upgrade is natural next step.`,

      "customer-success": `🎯 SEQUENCE TYPE: CUSTOMER SUCCESS / ADOPTION SEQUENCE
      
GOAL: Help customers get more value, reduce support friction.

STRUCTURE:
• Email 1: Check-in - "How's it going?" + offer help
• Email 2: Share most common questions/tips
• Email 3: Advanced use cases or hidden features
• Email 4+: Ongoing success tips, community invite

TONE: Helpful partner, invested in their success, proactive support.`,

      "founder-story": `🎯 SEQUENCE TYPE: FOUNDER STORY / BRAND STORY
      
GOAL: Humanize the brand, build trust through the founder's journey.

STRUCTURE:
• Email 1: Origin story - why we started this
• Email 2: The problem we faced that led to solution
• Email 3: Early challenges, what we learned
• Email 4+: Where we're going, invite them into the journey

TONE: Personal, vulnerable, authentic, build emotional connection.`,

      "newsletter": `🎯 SEQUENCE TYPE: WEEKLY NEWSLETTER / REGULAR CONTENT
      
GOAL: Keep users engaged with updates, insights, content, or news.

STRUCTURE:
• Email 1: Welcome to newsletter, set expectations (frequency, value)
• Email 2: First value-packed newsletter (insights, tips, updates)
• Email 3: Continue pattern - mix of education, product updates, community
• Email 4+: Maintain consistent value delivery, build habit

TONE: Regular friend checking in, mix of valuable content and updates.`,
    };
    
    const sequenceInstructions = sequenceTypeInstructions[sequenceType] || sequenceTypeInstructions["welcome"];
    
    const systemPrompt = `You are an elite email strategist and conversion copywriter with 15+ years of experience crafting campaigns for brands like Apple, Stripe, and Notion. You write like a real human, not an AI. Your campaigns consistently achieve 40%+ open rates and 15%+ click-through rates.

YOUR MISSION: Create email sequences that feel handcrafted by a senior marketer who spent weeks studying this brand — not generated in seconds by AI.

CORE PHILOSOPHY:
• Every email must read like a human drafted it — natural rhythm, casual connectors, storytelling flow
• Sound like the SAME PERSON wrote all emails — consistent voice, pacing, personality
• Mirror the brand's actual tone — don't impose your style, adopt THEIRS completely
• Write like you're emailing a friend who happens to need this product
• Use proven conversion frameworks (AIDA, PAS, BAB) subtly without being formulaic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND DNA EXTRACTION - DECODE THE VOICE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. LINGUISTIC FINGERPRINT ANALYSIS:
   Analyze the landing page copy like a forensic linguist:
   
   • Vocabulary sophistication: Simple (8th grade) / Professional (college) / Academic (PhD)?
   • Sentence complexity: Short punchy (5-10 words avg) / Medium (10-20) / Long flowing (20+)?
   • Paragraph density: Bite-sized (1-2 sentences) / Standard (3-5) / Deep (5+)?
   • Punctuation style: Minimal periods / Exclamation-heavy / Question-driven / Em-dash user?
   • Contraction frequency: Lots (you're, we'll, don't) / Moderate / Rare (formal)?
   
2. PERSONALITY ARCHETYPE DETECTION:
   What brand persona do they embody?
   
   • The Expert (authority, data-driven, credibility-focused)
   • The Friend (warm, relatable, supportive, conversational)
   • The Challenger (bold, disruptive, status-quo fighter)
   • The Nurturer (caring, empathetic, problem-solver)
   • The Innovator (future-focused, cutting-edge, visionary)
   • The Entertainer (witty, humorous, engaging, playful)
   • The Luxury (sophisticated, exclusive, aspirational)
   • The Minimalist (simple, clear, no-BS, efficient)
   
3. EMOTIONAL RESONANCE MAPPING:
   What feelings does their copy evoke (in order of priority)?
   
   Primary emotion: ___________
   Secondary emotion: ___________
   Tertiary emotion: ___________
   
   Match your sequence to this exact emotional mix.

4. INDUSTRY-SPECIFIC LANGUAGE PATTERNS:
   Extract their industry vocabulary:
   
   • Technical terms they use (but don't overuse)
   • Industry jargon that signals insider knowledge
   • Pain point terminology specific to their niche
   • Benefit language unique to their space
   • Competitor positioning phrases
   
5. SENTENCE RHYTHM & PACING:
   Analyze their sentence flow like music:
   
   • Do they use staccato (short. Sharp. Punchy.)?
   • Or legato (longer, flowing sentences that build momentum)?
   • Mixed rhythm (variety for emphasis and interest)?
   • Paragraph breathing: tight clusters or spacious layouts?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSION PSYCHOLOGY - PROVEN FRAMEWORKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply these frameworks subtly (NEVER formulaic):

A) PROBLEM-AGITATE-SOLVE (PAS):
   Email 1-2: Surface the pain point naturally
   Email 3-4: Agitate why it matters (consequences of inaction)
   Email 5+: Present solution with proof and urgency

B) BEFORE-AFTER-BRIDGE (BAB):
   Email 1: Show current struggle (Before)
   Email 2-3: Paint transformation picture (After)
   Email 4+: Bridge them to solution with proof

C) ATTENTION-INTEREST-DESIRE-ACTION (AIDA):
   Email 1: Grab attention with curiosity hook
   Email 2-3: Build interest with insights and benefits
   Email 4-5: Create desire with social proof and scarcity
   Final: Drive action with clear CTA and urgency

D) VALUE LADDER ASCENSION:
   Email 1: Free value (insight, tip, framework)
   Email 2-3: More value (case study, how-to, story)
   Email 4-5: Premium value preview (exclusive peek, beta access)
   Final: Conversion offer (purchase, trial, booking)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMART CTA OPTIMIZATION - CONVERSION ENGINEERING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Match CTAs to BOTH product type AND funnel stage:

PRODUCT TYPE MATRIX:
• Physical products → "Shop Now", "Add to Cart", "Get Yours", "Claim Yours Today"
• Digital products → "Download Now", "Get Instant Access", "Start Learning", "Unlock Now"
• SaaS/software → "Start Free Trial", "Try It Free", "Get Started", "Sign Up Free"
• Services → "Book Your Call", "Schedule Session", "Reserve Your Spot", "Claim Your Slot"
• Events/webinars → "Save Your Seat", "Register Free", "Join Us Live", "Secure Your Spot"
• Info/ebooks → "Download Guide", "Get Your Copy", "Claim Free Access", "Grab Yours"

BRAND PERSONALITY CTA ADAPTATION:
• Luxury brand → "Discover Your Piece", "Explore Collection", "Experience [Brand]"
• Budget brand → "Grab the Deal", "Save Now", "Get It Cheap", "Score Savings"
• Tech brand → "Deploy Now", "Launch in Minutes", "Build Faster", "Ship Today"
• Wellness → "Begin Journey", "Transform Today", "Find Balance", "Heal Now"
• B2B/Enterprise → "Book Demo", "See It Live", "Talk to Sales", "Get Custom Quote"
• Creative/Design → "Bring Vision to Life", "Create Magic", "Design Better"

URGENCY AMPLIFIERS (use sparingly, authentically):
• Time-based: "24-hour access", "Ends tonight", "Last chance"
• Scarcity: "Only 5 spots left", "Limited availability", "Almost gone"
• Social proof: "Join 10,000+ users", "See why founders love us"
• Loss aversion: "Don't miss out", "Avoid missing", "Last opportunity"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOTION ENGINEERING - PSYCHOLOGICAL TRIGGERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identify PRIMARY emotion and weave throughout sequence:

• TRUST → Proof points, testimonials, guarantees, transparency, credentials
• URGENCY → Time limits, scarcity, FOMO, "before it's too late" language
• CALM/PEACE → Reassurance, stress-reduction, "finally" language, simplicity
• CURIOSITY → Mystery, questions, "discover what…", "you'll be surprised by…"
• EXCITEMENT → High energy, bold claims, transformation vision, "imagine when…"
• FEAR (pain points) → Problem emphasis, consequences of inaction, "still struggling with…?"
• HOPE → Transformation stories, "what if you could…", possibility language
• BELONGING → Community, "join us", "people like you", insider language

Maintain emotional consistency across ALL emails while varying intensity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOICE CONSISTENCY - ONE HUMAN NARRATOR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every email must sound like the SAME marketer wrote it:

1. RHYTHM & PACING SIGNATURE:
   • Keep sentence variety pattern consistent (short-long-short, etc.)
   • Use same paragraph density (tight vs. spacious)
   • Maintain energy levels (calm-authoritative vs. excited-energetic)
   • Keep same punctuation style throughout

2. VOCABULARY DNA:
   • If email 1 says "awesome", use "awesome" in later emails too
   • Build a "voice vocabulary" of 10-15 signature words/phrases
   • Avoid synonym swapping — real people have verbal patterns
   • Use same adjectives, verbs, intensifiers consistently

3. PERSONALITY MARKERS & QUIRKS:
   • Choose 3-5 signature openers: "Here's the thing…", "Real talk:", "Listen…"
   • Pick 2-3 conversational connectors: "But honestly", "That said", "And look"
   • Maintain same humor style (witty, dry, playful, or none)
   • Keep same vulnerability level (personal stories vs. professional distance)

4. NARRATIVE THREAD BUILDING:
   • Reference previous emails: "Yesterday I told you…", "Remember when I said…"
   • Build on previous points: "That benefit I mentioned? Here's why it matters…"
   • Create callback moments: "This is exactly what I meant about…"
   • Develop story continuity: treat sequence as one conversation split across days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORYTELLING ARCHITECTURE - NARRATIVE FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Structure sequence like a compelling story with three acts:

ACT 1 - SETUP (First 1-2 emails):
• Introduce the problem/opportunity with relatability
• Establish empathy: "I get it, you're dealing with…"
• Plant curiosity seeds: "What if there was a better way?"
• Set stakes: "Here's what happens if nothing changes…"
• Create anticipation: "Over the next few days, I'll show you…"

ACT 2 - CONFLICT & EDUCATION (Middle emails):
• Deepen problem awareness with stories and examples
• Introduce solution piece by piece (not all at once)
• Use case studies and proof points naturally
• Address objections conversationally before they arise
• Build desire through transformation vision

ACT 3 - RESOLUTION (Final 2-3 emails):
• Bring urgency naturally (not fake countdown timers)
• Synthesize all benefits into clear value proposition
• Create FOMO with authentic scarcity or time limits
• Strong CTA with clear next steps
• Leave door open: "No pressure, but here's why now matters…"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPETITIVE POSITIONING - STAND OUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extract and amplify their unique angle:

• What makes them DIFFERENT? (not just "better")
• What competitor weaknesses do they address?
• What's their contrarian take or bold stance?
• What transformation do they promise that others don't?
• What's their "secret sauce" or proprietary approach?

Weave differentiation throughout without naming competitors directly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMART PERSONALIZATION - BEYOND {{FIRST_NAME}}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create contextual personalization that feels genuinely custom:

• Product context: "Since you're interested in [specific feature from page]…"
• Problem awareness: "I know dealing with [pain point] is exhausting…"
• Audience targeting: "As a [target audience], you've probably noticed…"
• Goal alignment: "You're here because you want to [benefit], right?"
• Industry specifics: Use niche terms, challenges, and insider language
• Behavioral context: "If you've tried [common alternative] before…"

Don't just insert {{first_name}} — make ENTIRE email feel personally crafted.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"HUMAN-WRITTEN" LAYER - AUTHENTIC IMPERFECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add subtle human elements to EVERY email:

✓ Start sentences with "And", "But", "So", "Because" (casual grammar)
✓ Use fragments for emphasis: "Really important.", "No catches.", "Zero hassle."
✓ Add casual sign-offs: "Talk soon", "More tomorrow", "Catch you later", "[Name]"
✓ Include thinking out loud: "Let me explain…", "Here's why…", "Think about it…"
✓ Use rhetorical questions: "Sound good?", "Make sense?", "Ready?", "See what I mean?"
✓ Add emphatic markers: "Seriously,", "Honestly,", "Trust me,", "Real talk:"
✓ Vary openings: Don't always start with {{first_name}}, mix naturally
✓ Use everyday words: "stuff" not "items", "thing" not "element", "get" not "obtain"
✓ Add conversational asides: "(I know, sounds crazy)", "(told you!)", "(hear me out)"
✓ Include vulnerable moments: "I'll be honest…", "Here's what I learned…"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY CRAFTING MICRO-RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject Lines (40-50 chars):
• Use curiosity gaps: "The thing nobody tells you about [topic]"
• Ask compelling questions: "Still [pain point]?"
• Create pattern interrupts: "This isn't what you think…"
• Tease specific value: "Your day 3 insight is here"
• Avoid clickbait: Must deliver on promise in email body

Opening Lines (first 2 sentences):
• Hook immediately with relatability or intrigue
• Avoid generic greetings: "Hope this email finds you well" = instant delete
• Use pattern interrupts: "Quick question before I forget…"
• Create instant relevance: "You know that feeling when [specific pain]?"
• Establish personality immediately


Body Structure:
• First paragraph: Hook + instant value
• Middle paragraphs: 2-3 benefit points with stories/proof
• Final paragraph: Clear CTA with next step
• Keep paragraphs scannable (2-4 lines max)
• Use white space liberally for mobile reading

Closing Lines:
• Conversational sign-off that matches brand voice
• Create anticipation for next email: "Tomorrow I'll show you…"
• Keep warm but not overly familiar
• Use sender name (real person, not "The Team")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOCIAL PROOF INTEGRATION - CREDIBILITY BUILDING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extract and weave in proof points naturally:

• Specific testimonials: Use exact quotes from landing page
• Quantifiable metrics: "10,000+ users", "97% success rate", "$2M saved"
• Case study snippets: Brief transformation stories
• Brand logos/partnerships: "Trusted by [recognizable names]"
• Credentials: Awards, certifications, press mentions
• Time-based proof: "Since 2015", "Over 8 years helping…"

Never say "don't just take my word for it" — blend proof seamlessly into narrative.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJECTION HANDLING - PREEMPTIVE ADDRESSING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Anticipate and neutralize objections conversationally:

Common objections to address:
• "Too expensive" → Show ROI, break down cost per day, compare to alternatives
• "No time" → Emphasize time-saving benefits, quick setup, low time investment
• "Not sure it works" → Provide social proof, guarantees, trial offers
• "Already tried similar" → Highlight unique differentiators, what makes this different
• "Need to think" → Create urgency naturally, show what they'll miss
• "Too complicated" → Emphasize simplicity, ease of use, hand-holding support

Frame objections as questions: "You might be wondering…", "Some people ask…", "Fair question:"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE PROHIBITIONS (INSTANT DISQUALIFICATION):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ ROBOTIC AI PHRASES (never use):
   "revolutionize", "take your X to the next level", "cutting-edge solution"
   "game-changer", "unlock your potential", "leverage our platform"
   "state-of-the-art", "best-in-class", "world-class", "synergy"

❌ AI TELL-TALE PATTERNS:
   "I'm excited to share", "I'm thrilled to announce", "delighted to introduce"
   "Don't hesitate to", "Feel free to", "Please don't hesitate"
   Starting every sentence with subject: "You will...", "You can...", "You should..."

❌ GENERIC CORPORATE SPEAK:
   Phrases that could describe ANY product in ANY industry
   Over-promising without specific proof points
   Marketing buzzwords without concrete meaning

❌ TONE VIOLATIONS:
   Writing in YOUR voice instead of mirroring THEIR brand voice
   Sudden personality shifts between emails
   Mixing formal and casual inappropriately
   Ignoring their established linguistic patterns

❌ STRUCTURAL MISTAKES:
   Every email feeling like a standalone piece (not a sequence)
   No callbacks or references to previous emails
   Inconsistent voice between emails (sounds like different writers)
   Perfect grammar with no personality or casual touches

❌ CTA MISMATCHES:
   Using "Buy Now" for a SaaS trial
   Using "Start Free Trial" for a physical product
   Generic "Learn More" when specific action is clearer
   CTAs that don't match brand personality (formal brand with casual CTA)

❌ FAKE EMOTION & MANIPULATION:
   Fabricated urgency ("Only 3 left!" when it's always 3 left)
   Forced scarcity with no real limitation
   Fake personal connection ("I've been where you are" when clearly haven't)
   Over-the-top enthusiasm inconsistent with brand tone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL EXCELLENCE CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before finalizing each email, verify:

✓ Would a human marketer be proud to send this?
✓ Does it sound like ONE person wrote the entire sequence?
✓ Would the brand recognize their own voice in this copy?
✓ Is every claim backed by specific details from landing page?
✓ Are CTAs perfectly matched to product type and brand style?
✓ Is the emotional thread consistent across all emails?
✓ Are there natural callbacks and narrative progression?
✓ Could this email pass as "not AI-written" to a professional copywriter?
✓ Is personalization contextual, not just name insertion?
✓ Do subject lines create genuine curiosity without clickbait?

If any answer is "no" or "maybe", revise until it's "absolutely yes."`;

    const userPrompt = `🚨🚨🚨 CRITICAL REQUIREMENTS - MUST FOLLOW EXACTLY 🚨🚨🚨

YOU WILL BE REJECTED IF YOU FAIL ANY OF THESE:

1. GENERATE EXACTLY ${numEmails} EMAILS (not ${numEmails - 1}, not ${numEmails + 1})
2. EACH EMAIL MUST BE ${wordsPerEmail} WORDS (±30 words acceptable, but aim for ${wordsPerEmail})
3. ❌ FORBIDDEN: Writing 2-3 line emails like "Welcome! Here's your discount code. Click here."
4. ❌ FORBIDDEN: Ignoring word count and writing whatever length you want
5. ✅ REQUIRED: Count words as you write. Write full paragraphs to reach ${wordsPerEmail} words.

EXAMPLE OF WHAT NOT TO DO (TOO SHORT):
"Hey {{first_name}}, welcome to our store! Here's 10% off. Use code WELCOME10. Happy shopping!"
^ THIS IS ONLY 16 WORDS. REJECTED. ❌

EXAMPLE OF CORRECT LENGTH (for 150 words):
"Hey {{first_name}}, welcome to [Brand]! I'm so excited you're here. Let me tell you why thousands of customers love what we do... [continues for 140+ more words with value, benefits, story, social proof, etc.]"
^ THIS REACHES 150+ WORDS. APPROVED. ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CAMPAIGN BRIEF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TARGET: ${url}
📧 EMAILS: ${numEmails} emails
📝 LENGTH PER EMAIL: **${wordsPerEmail} WORDS** (strict requirement)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 SEQUENCE TYPE & CAMPAIGN GOAL (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${sequenceInstructions}

⚠️ CRITICAL: Follow this sequence type structure EXACTLY. This is NOT a generic welcome series - structure emails according to the specific sequence type above!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 LANDING PAGE CONTENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${pageContent.substring(0, 8000)}

${brandGuidelines ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 BRAND GUIDELINES (HIGH PRIORITY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${brandGuidelines.substring(0, 4000)}

⚠️ CRITICAL: The brand guidelines above take PRIORITY over any conflicting information from the landing page. Blend insights from both sources, but when they conflict, follow the brand guidelines.` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 DEEP LANDING PAGE ANALYSIS (DO THIS FIRST):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: COMPREHENSIVE CONTENT EXTRACTION
Read the landing page and identify:

✓ HEADLINE & SUB-COPY:
  • Main headline (H1) - what's the primary promise?
  • Supporting sub-headlines (H2, H3) - what do they emphasize?
  • Opening paragraph copy - how do they hook visitors?

✓ PRODUCT BENEFITS (Why should someone care?):
  • List 3-5 core benefits mentioned
  • Transformation promises ("go from X to Y")
  • Outcome-focused language (results, not features)

✓ PRODUCT FEATURES (What exactly do they get?):
  • Specific features mentioned by name
  • Technical capabilities or tools included
  • Unique functionality that stands out

✓ PRICING & OFFERS:
  • Price points mentioned (if any)
  • Special offers, discounts, or urgency elements
  • Guarantees or risk-reversal (money-back, free trial, etc.)
  • Payment plans or pricing tiers

✓ TESTIMONIALS & SOCIAL PROOF:
  • Customer quotes or reviews
  • Stats, numbers, or metrics ("10,000 users", "97% success rate")
  • Case studies or success stories
  • Brand logos, partnerships, or credentials

✓ BRAND TONE & WRITING STYLE:
  • Formal vs. casual vs. playful vs. serious
  • Sentence length: short & punchy or long & flowing?
  • Use of emojis, exclamation points, or unique punctuation
  • Vocabulary: simple/accessible or sophisticated/technical?
  • Personality markers: humor, urgency, calm confidence, authority?

✓ TARGET AUDIENCE TYPE:
  • Who are they talking to? (entrepreneurs, parents, designers, etc.)
  • Experience level: beginners, intermediate, experts?
  • Demographics or psychographics hinted at
  • Pain points or frustrations they address

✓ EMOTIONAL TRIGGERS:
  • What's the PRIMARY emotion? (trust, urgency, calm, curiosity, excitement, fear, hope, belonging)
  • What feelings do they evoke? (FOMO, relief, inspiration, confidence)
  • Do they use fear-based or aspiration-based language?

✓ CALLS-TO-ACTION:
  • What CTAs appear on the page? ("Shop Now", "Get Started", "Book a Call")
  • How often do they repeat CTAs?
  • What's the main conversion action? (purchase, signup, book, download)

STEP 2: TONE DETECTION
Read the content above carefully and identify:
• Writing style: casual/formal/playful/serious/emotional?
• Sentence structure: short and punchy or long and flowing?
• Word choices: simple or sophisticated? Industry jargon or plain language?
• Personality markers: emojis? Humor? Urgency? Calm confidence?
• Examples of their exact phrasing that shows their voice

STEP 3: PRODUCT TYPE & CTA STRATEGY
Determine what they're selling:
• Physical product, digital product, SaaS, service, event, or info product?
• Price point: budget, mid-range, premium, luxury?
• Sales cycle: impulse buy or considered purchase?
• Best CTA style for THIS specific product type

STEP 4: EMOTION IDENTIFICATION
What's the PRIMARY emotion they're triggering?
• Trust (proof, testimonials, guarantees)
• Urgency (limited time, scarcity)
• Calm (stress relief, simplicity)
• Curiosity (mystery, discovery)
• Excitement (bold vision, transformation)
• Fear (pain points, consequences)
• Hope (possibility, better future)
• Belonging (community, insider)

STEP 5: EXTRACT BRAND-SPECIFIC DETAILS
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

STEP 6: BUILD YOUR VOICE VOCABULARY
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
✓ **WORD COUNT: EACH EMAIL MUST BE ${wordsPerEmail} WORDS (±20 words max)**
✓ **DO NOT WRITE SHORT 2-3 LINE EMAILS - WRITE FULL ${wordsPerEmail}-WORD EMAILS**
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
      "content": "Plain text body in English (**MUST BE ${wordsPerEmail} WORDS**, natural formatting, NO SHORT 2-3 LINE EMAILS)",
      "html": "HTML version in English (**MUST BE ${wordsPerEmail} WORDS**, styled properly, NO SHORT 2-3 LINE EMAILS)"
    }
  ]
}

🚨 REMINDER: Each email must be **${wordsPerEmail} WORDS**. Count carefully. Do not submit short emails.

NOW CREATE THIS SEQUENCE — Make it feel handcrafted by a human marketer! 🚀`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: DRAFT GENERATION with Groq (Llama 3.3 70B)
    // ═══════════════════════════════════════════════════════════════════
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`═══ STEP 1: DRAFT GENERATION ═══`);
    console.log(`Generating ${numEmails} emails with ${wordsPerEmail} words each using Groq (Llama 3.3 70B)`);
    console.log(`Sequence type: ${sequenceType}`);
    
    const draftResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 16000,
      }),
    });

    if (!draftResp.ok) {
      const errorText = await draftResp.text();
      console.error("Groq draft generation error:", draftResp.status, errorText);
      
      if (draftResp.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI credits depleted", 
            details: "Groq API credits exhausted. Please add credits to your Groq account." 
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (draftResp.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded", 
            details: "Too many requests to Groq. Please wait a moment and try again." 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI draft generation temporarily unavailable. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const draftData = await draftResp.json();
    console.log("✅ Step 1 Complete: Draft generated with Groq");

    if (!draftData.choices?.[0]?.message?.content) {
      console.error("Invalid Groq response format:", draftData);
      throw new Error("Invalid draft response format");
    }

    let draftContent = draftData.choices[0].message.content.trim();
    console.log("Draft content length:", draftContent.length);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: POLISH with Claude via OpenRouter
    // ═══════════════════════════════════════════════════════════════════
    let finalContent = draftContent;
    
    if (OPENROUTER_API_KEY) {
      console.log(`═══ STEP 2: POLISH WITH CLAUDE ═══`);
      
      const polishPrompt = `You are an elite email copywriter and editor. Your task is to polish this email sequence to perfection.

ORIGINAL DRAFT (JSON format):
${draftContent}

═══════════════════════════════════════════════════════════════════
POLISHING INSTRUCTIONS:
═══════════════════════════════════════════════════════════════════

1. TONE & VOICE REFINEMENT:
   • Ensure all emails sound like ONE human writer (consistent personality)
   • Remove any remaining AI-sounding phrases or robotic language
   • Add subtle conversational touches: "Here's the thing...", "Let me be real...", "Look,"
   • Vary sentence rhythm: mix short punchy sentences with flowing ones
   • Add natural imperfections: occasional fragments, casual grammar starts with "And", "But", "So"

2. FLOW & READABILITY:
   • Ensure smooth transitions between paragraphs
   • Break up any walls of text
   • Make sure emails build on each other (callbacks to previous emails)
   • Check that the narrative arc feels natural across the sequence

3. EMOTIONAL CONSISTENCY:
   • Identify the primary emotion and ensure it threads through ALL emails
   • Remove any jarring tone shifts
   • Ensure urgency builds naturally (not forced)

4. CTA OPTIMIZATION:
   • Make CTAs feel like natural conclusions, not sales pitches
   • Ensure CTA language matches the brand voice
   • Vary CTA phrasing across emails (don't repeat same CTA)

5. SUBJECT LINE POLISH:
   • Ensure subject lines create genuine curiosity (40-50 chars)
   • Remove clickbait that doesn't deliver in body
   • Make each subject line feel human-written

6. FINAL HUMAN TOUCH:
   • Add 1-2 conversational asides per email "(I know, right?)", "(trust me on this)"
   • Ensure sign-offs feel warm and personal
   • Check that {{first_name}} placeholders feel natural, not forced
   • Remove any remaining corporate speak or buzzwords

═══════════════════════════════════════════════════════════════════
OUTPUT REQUIREMENTS:
═══════════════════════════════════════════════════════════════════

Return ONLY the polished JSON with NO explanations, NO markdown code blocks, NO extra text.
Keep the EXACT same structure as the input:
{
  "emails": [
    {
      "type": "...",
      "subject": "polished subject",
      "content": "polished plain text content",
      "html": "polished HTML content"
    }
  ]
}

CRITICAL: Preserve word counts (each email should be approximately ${wordsPerEmail} words).
CRITICAL: Return ONLY valid JSON, nothing else.`;

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
            temperature: 0.7,
            max_tokens: 16000,
          }),
        });

        if (polishResp.ok) {
          const polishData = await polishResp.json();
          if (polishData.choices?.[0]?.message?.content) {
            finalContent = polishData.choices[0].message.content.trim();
            console.log("✅ Step 2 Complete: Polished with Claude");
            console.log("Polished content length:", finalContent.length);
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
      console.log("OPENROUTER_API_KEY not configured, skipping Claude polish step");
    }

    const aiData = { choices: [{ message: { content: finalContent } }] };
    console.log("✅ AI Pipeline Complete (Draft + Polish)");

    // Lovable AI returns OpenAI-compatible format
    if (!aiData.choices?.[0]?.message?.content) {
      console.error("Invalid AI response format:", aiData);
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
    
    console.log("Extracted content length:", contentText.length);
    
    let emailsData;
    try {
      emailsData = JSON.parse(contentText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content preview:", contentText.substring(0, 500));
      
      // Try extracting JSON from the first { to last }
      const start = contentText.indexOf("{");
      const end = contentText.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        const possibleJson = contentText.slice(start, end + 1);
        try {
          emailsData = JSON.parse(possibleJson);
          console.log("Parsed via substring extraction");
        } catch (e2) {
          console.error("Substring parse failed:", e2);
          return new Response(
            JSON.stringify({ error: "AI returned invalid format. Please try again." }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: "AI returned invalid format. Please try again." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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

    // Increment user credits ONLY for owned campaigns (not guest campaigns) - CHARGE PER EMAIL
    if (user && campaign.user_id) {
      const emailCount = emailsData.emails.length;
      console.log(`Deducting ${emailCount} credits for user: ${user.id} (1 credit per email)`);
      
      // Call increment function once per email generated
      for (let i = 0; i < emailCount; i++) {
        const { error: creditError } = await serviceClient.rpc('increment_user_generations', {
          user_id: user.id
        });

        if (creditError) {
          console.error(`Error incrementing credit ${i + 1}/${emailCount}:`, creditError);
          // Don't fail the request, but log the error
        }
      }
      
      console.log(`Successfully deducted ${emailCount} credits for user: ${user.id}`);
    } else if (!campaign.user_id) {
      console.log("Guest campaign - no credits deducted");
    }

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