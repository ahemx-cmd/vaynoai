import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  id: string;
  subject: string;
  content: string;
  html_content: string;
  email_type: string;
  sequence_number: number;
}

interface ExportRequest {
  campaign_id: string;
  export_type: "draft" | "flow";
  flow_name?: string;
  enable_personalization?: boolean;
}

// Map Vayno personalization tags to Klaviyo format
const mapPersonalizationTags = (content: string, enablePersonalization: boolean): string => {
  if (!enablePersonalization) return content;
  
  const tagMapping: Record<string, string> = {
    "{{first_name}}": '{{ first_name|default:"there" }}',
    "{{last_name}}": '{{ last_name|default:"" }}',
    "{{company_name}}": '{{ organization.name|default:"" }}',
    "{{email}}": "{{ email }}",
    "{{unsubscribe_url}}": "{% unsubscribe_url %}",
  };
  
  let mappedContent = content;
  for (const [vaynoTag, klaviyoTag] of Object.entries(tagMapping)) {
    mappedContent = mappedContent.replace(new RegExp(vaynoTag.replace(/[{}]/g, '\\$&'), 'gi'), klaviyoTag);
  }
  
  return mappedContent;
};

// Generate Klaviyo-compatible HTML from email data
const generateKlaviyoHTML = (
  email: EmailData, 
  brandName: string, 
  ctaLink: string | null,
  enablePersonalization: boolean
): string => {
  const previewText = email.content.substring(0, 100).replace(/\n/g, ' ').trim() + '...';
  
  const ctaHTML = ctaLink ? `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="margin: 30px 0;">
      <tr>
        <td align="center">
          <a href="${ctaLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; line-height: 1.5;">
            Get Started Now
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const htmlContent = mapPersonalizationTags(email.html_content, enablePersonalization);
  const greeting = enablePersonalization 
    ? '{{ first_name|default:"there" }}' 
    : 'there';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${email.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-content { padding: 20px !important; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
  
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 30px 30px 0 30px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #1f2937;">${brandName}</h2>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding: 40px 30px; color: #1f2937; line-height: 1.6; font-size: 16px;">
              <p style="margin: 0 0 16px 0;">Hi ${greeting},</p>
              ${htmlContent}
              ${ctaHTML}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <a href="{% unsubscribe_url %}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Map sequence type to Klaviyo flow trigger
const getFlowTrigger = (sequenceType: string): string => {
  const triggerMap: Record<string, string> = {
    "welcome": "LIST_TRIGGER",
    "abandoned-cart": "METRIC_TRIGGER",
    "post-purchase": "METRIC_TRIGGER",
    "win-back": "METRIC_TRIGGER",
    "browse-abandon": "METRIC_TRIGGER",
    "product-launch": "LIST_TRIGGER",
    "seasonal": "DATE_TRIGGER",
  };
  return triggerMap[sequenceType] || "LIST_TRIGGER";
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header and verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ExportRequest = await req.json();
    const { campaign_id, export_type, flow_name, enable_personalization = true } = body;

    console.log(`📤 Starting Klaviyo export for campaign ${campaign_id}, type: ${export_type}`);

    // Fetch user's Klaviyo API key
    const { data: connection, error: connError } = await supabase
      .from("klaviyo_connections")
      .select("api_key_encrypted")
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      console.error("No Klaviyo connection found:", connError);
      return new Response(
        JSON.stringify({ error: "No Klaviyo account connected. Please connect your account first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const klaviyoApiKey = connection.api_key_encrypted;

    // Fetch campaign data
    const { data: campaign, error: campError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .eq("user_id", user.id)
      .single();

    if (campError || !campaign) {
      console.error("Campaign not found:", campError);
      return new Response(
        JSON.stringify({ error: "Campaign not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch emails
    const { data: emails, error: emailsError } = await supabase
      .from("email_sequences")
      .select("*")
      .eq("campaign_id", campaign_id)
      .order("sequence_number", { ascending: true });

    if (emailsError || !emails || emails.length === 0) {
      console.error("No emails found:", emailsError);
      return new Response(
        JSON.stringify({ error: "No emails found in this campaign" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 Found ${emails.length} emails to export`);

    const brandName = campaign.analyzed_data?.title || campaign.name || "Brand";
    const ctaLink = campaign.cta_link || null;
    const templateIds: string[] = [];

    // Create templates in Klaviyo
    for (const email of emails) {
      const htmlContent = generateKlaviyoHTML(email, brandName, ctaLink, enable_personalization);
      const templateName = `${campaign.name} - Email ${email.sequence_number}: ${email.email_type}`;

      console.log(`📝 Creating template: ${templateName}`);

      const templateResponse = await fetch("https://a.klaviyo.com/api/templates/", {
        method: "POST",
        headers: {
          "Authorization": `Klaviyo-API-Key ${klaviyoApiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "revision": "2024-02-15",
        },
        body: JSON.stringify({
          data: {
            type: "template",
            attributes: {
              name: templateName,
              editor_type: "CODE",
              html: htmlContent,
            },
          },
        }),
      });

      if (!templateResponse.ok) {
        const errorText = await templateResponse.text();
        console.error(`Failed to create template: ${errorText}`);
        
        // Log the export failure
        await supabase.from("klaviyo_exports").insert({
          user_id: user.id,
          campaign_id,
          export_type,
          status: "failed",
          error_message: `Failed to create template for email ${email.sequence_number}: ${errorText}`,
        });

        return new Response(
          JSON.stringify({ error: `Failed to create template: ${errorText}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const templateData = await templateResponse.json();
      templateIds.push(templateData.data.id);
      console.log(`✅ Created template ${templateData.data.id}`);
    }

    // If export_type is "flow", create a flow with the templates
    let flowId: string | null = null;
    
    if (export_type === "flow") {
      const flowNameFinal = flow_name || `${campaign.name} Sequence`;
      const triggerType = getFlowTrigger(campaign.sequence_type || "welcome");
      
      console.log(`🔄 Creating flow: ${flowNameFinal} with trigger: ${triggerType}`);

      // Note: Creating flows via Klaviyo API requires specific setup
      // The API allows creating flows but actions (emails) need to be added separately
      // For now, we'll create the templates and inform the user to create the flow manually
      // or use the Klaviyo UI to add templates to a flow
      
      // Klaviyo's Flow API is more limited - we'll log this
      console.log(`⚠️ Flow creation requires manual setup in Klaviyo UI with templates: ${templateIds.join(", ")}`);
    }

    // Log successful export
    await supabase.from("klaviyo_exports").insert({
      user_id: user.id,
      campaign_id,
      export_type,
      klaviyo_template_ids: templateIds,
      status: "success",
    });

    // Update last sync time
    await supabase
      .from("klaviyo_connections")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("user_id", user.id);

    console.log(`✅ Export completed successfully! Templates: ${templateIds.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: export_type === "flow" 
          ? `${emails.length} email templates created in Klaviyo. Please create a flow in Klaviyo and add these templates.`
          : `${emails.length} email templates created as drafts in Klaviyo.`,
        template_ids: templateIds,
        flow_id: flowId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to export to Klaviyo";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});