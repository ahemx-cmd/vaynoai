// Calculate the day to send email based on drip duration and sequence number
export const calculateSendDay = (dripDuration: string, sequenceNumber: number, totalEmails: number): number => {
  const duration = parseInt(dripDuration.split('-')[0]); // Extract number from "7-day", "14-day", etc.
  
  if (sequenceNumber === 1) return 1; // First email always on day 1
  if (sequenceNumber === totalEmails) return duration; // Last email on final day
  
  // Distribute remaining emails evenly across the remaining days
  const remainingDays = duration - 1;
  const remainingEmails = totalEmails - 2; // Excluding first and last
  const daysBetween = remainingDays / (totalEmails - 1);
  
  return Math.round(1 + (sequenceNumber - 1) * daysBetween);
};

// Generate ESP-ready HTML email with full personalization and ESP compatibility
export const generateESPReadyHTML = (
  email: any,
  brandName: string,
  ctaLink: string | null,
  includeCTA: boolean,
  includeWatermark: boolean
): string => {
  // Generate preview text from content (first 100 chars, stripped of HTML)
  const previewText = email.content.substring(0, 100).replace(/\n/g, ' ').trim() + '...';
  
  const ctaHTML = includeCTA && ctaLink 
    ? `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaLink}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="14%" stroke="f" fillcolor="#6366f1">
      <w:anchorlock/>
      <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Get Started Now</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="margin: 30px 0;">
      <tr>
        <td align="center">
          <a href="${ctaLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; line-height: 1.5; mso-padding-alt: 0; text-align: center;">
            <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
            <span style="mso-text-raise: 15pt;">Get Started Now</span>
            <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
          </a>
        </td>
      </tr>
    </table>
    <!--<![endif]-->
    `
    : '';

  const watermarkHTML = includeWatermark 
    ? `
    <tr>
      <td style="padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #f9fafb;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
          Powered by <a href="https://vaynoai.lovable.app" target="_blank" style="color: #6366f1; text-decoration: none; font-weight: 600;">Vayno</a> — AI Campaign Builder
        </p>
      </td>
    </tr>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <title>${email.subject}</title>
  <style>
    /* Reset styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
      -webkit-font-smoothing: antialiased !important;
    }
    img {
      border: 0 !important;
      outline: none !important;
      -ms-interpolation-mode: bicubic;
    }
    table {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    td, a, span {
      border-collapse: collapse;
      mso-line-height-rule: exactly;
    }
    
    /* Client-specific styles */
    .ExternalClass {
      width: 100%;
    }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
      line-height: 100%;
    }
    
    /* iOS blue links fix */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        min-width: 100% !important;
      }
      .email-content {
        padding: 30px 20px !important;
      }
      .mobile-padding {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview Text (shows in inbox but hidden in email) -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
    ${previewText}
  </div>
  <!-- Preheader spacer -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>
  
  <!-- Outer wrapper table -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!-- Main container table (600px) -->
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Optional Header/Logo Section -->
          <tr>
            <td align="center" style="padding: 30px 30px 0 30px;">
              <!-- Personalization: Brand name or logo can go here -->
              <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #1f2937; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                {{company_name}}
              </h2>
            </td>
          </tr>
          
          <!-- Email Content Section -->
          <tr>
            <td class="email-content" style="padding: 40px 30px; color: #1f2937; line-height: 1.6; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <!-- Personalized greeting -->
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Hi {{first_name}},</p>
              
              <!-- Main email body with personalization -->
              ${email.html_content.replace(/\{\{/g, '{{').replace(/\}\}/g, '}}')}
              
              <!-- CTA Button -->
              ${ctaHTML}
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                You're receiving this email because you opted in at {{company_name}}.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5;">
                <a href="{{unsubscribe_url}}" target="_blank" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
                &nbsp;|&nbsp;
                <a href="mailto:teamvayno@gmail.com" style="color: #6b7280; text-decoration: underline;">Contact Us</a>
              </p>
            </td>
          </tr>
          
          <!-- Watermark (Free users only) -->
          ${watermarkHTML}
          
        </table>
        <!-- End main container -->
        
      </td>
    </tr>
  </table>
  <!-- End outer wrapper -->
  
</body>
</html>`;
};
