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

// Generate ESP-ready HTML email
export const generateESPReadyHTML = (
  email: any,
  brandName: string,
  ctaLink: string | null,
  includeCTA: boolean,
  includeWatermark: boolean
): string => {
  const ctaHTML = includeCTA && ctaLink 
    ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td align="center">
          <a href="${ctaLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Get Started Now
          </a>
        </td>
      </tr>
    </table>
    `
    : '';

  const watermarkHTML = includeWatermark 
    ? `
    <tr>
      <td style="padding: 20px 0; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          Powered by <a href="https://vaynoai.lovable.app" style="color: #6366f1; text-decoration: none; font-weight: 600;">Vayno</a> — AI campaign builder.
        </p>
      </td>
    </tr>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${email.subject}</title>
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-content {
      padding: 40px 30px;
      color: #1f2937;
      line-height: 1.6;
    }
    .email-content p {
      margin: 16px 0;
    }
    .email-footer {
      padding: 20px 30px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    a {
      color: #6366f1;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-content {
        padding: 30px 20px !important;
      }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td class="email-content">
              ${email.html_content}
              ${ctaHTML}
            </td>
          </tr>
          <tr>
            <td class="email-footer">
              <p style="margin: 0 0 8px 0;">You're receiving this email because you opted in at ${brandName}.</p>
              <p style="margin: 0;">
                <a href="{{ unsubscribe_url }}" style="color: #6b7280;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          ${watermarkHTML}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
