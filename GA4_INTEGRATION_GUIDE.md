# Google Analytics 4 Integration Guide

## Overview
Google Analytics 4 (GA4) has been successfully integrated into Vayno to track user behavior, conversions, and key actions across the application.

## Setup Instructions

### 1. Add Your GA4 Measurement ID
Update the `.env` file with your actual GA4 Measurement ID:

```env
VITE_GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
```

Replace `YOUR_GA4_MEASUREMENT_ID` with your actual GA4 measurement ID from your Google Analytics property.

### 2. GA4 Script Loading
The GA4 tracking script is loaded asynchronously in `index.html` for optimal performance. It automatically initializes when the page loads.

## Tracked Events

### Page Views
- **Automatic tracking** on every route change
- Tracks all pages including:
  - Landing page (`/`)
  - Dashboard (`/dashboard`)
  - Create Campaign (`/create-campaign`)
  - Campaign View (`/campaign/:id`)
  - Billing (`/billing`)
  - Auth pages (`/auth`)

### Button Clicks
Tracked button clicks include:
- **Navigation Bar**: "Sign In", "Try Free"
- **Hero Section**: "Try Free", "See How It Works"
- **Final CTA**: "Try Free"
- **Pricing Section**: All plan selection buttons
- **Campaign Creation**: "Generate Campaign" button

### Form Submissions
- **Sign Up Form**: Tracks successful and failed sign-ups
- **Sign In Form**: Tracks successful and failed sign-ins
- **Contact Forms**: Ready for support form tracking

### Conversions
Four main conversion types are tracked:
1. **Signup Conversion**: When a user successfully creates an account
2. **Generation Conversion**: When a campaign is successfully generated
3. **Export Conversion**: When a user exports a campaign
4. **Payment Conversion**: When a user upgrades to a paid plan

### User Funnel Events
Tracks the complete user journey:
1. **Signup** → User creates an account
2. **Generate** → User creates their first campaign
3. **Export** → User exports campaign files
4. **Upgrade** → User upgrades to a paid plan

### Campaign-Specific Events
- **campaign_generated**: Fires when a campaign is successfully created
  - Includes: `campaign_id`, `sequence_type`
- **export**: Fires when a user exports campaign files
  - Includes: `export_type` (html/zip), `campaign_id`

### Plan Upgrades
- **upgrade_click**: Fires when a user clicks on a plan upgrade button
  - Includes: `plan_name`, `price`
- Automatically tracks as a payment conversion

## Session Metrics
GA4 automatically tracks:
- **Session Duration**: Time users spend on the site
- **Bounce Rate**: Percentage of single-page sessions
- **Pages per Session**: Average pages viewed per session
- **User Engagement**: Time spent actively engaging with content

## Analytics Functions

### Core Functions (`src/lib/analytics.ts`)

```typescript
// Page view tracking
trackPageView(path: string, title?: string)

// Generic event tracking
trackEvent(eventName: string, eventParams?: Record<string, any>)

// Button click tracking
trackButtonClick(buttonName: string, location?: string)

// Form submission tracking
trackFormSubmission(formName: string, success: boolean)

// Conversion tracking
trackConversion(conversionType: 'generation' | 'payment' | 'signup' | 'export', value?: number, metadata?: Record<string, any>)

// Campaign-specific tracking
trackCampaignGeneration(campaignId: string, sequenceType?: string)
trackExport(exportType: 'html' | 'zip', campaignId: string)

// Plan upgrade tracking
trackPlanUpgrade(planName: string, price: number)

// Funnel step tracking
trackFunnelStep(step: 'signup' | 'generate' | 'export' | 'upgrade', metadata?: Record<string, any>)
```

## Custom Dimensions & Metrics Available

### Standard Dimensions
- `page_path`: URL path of the page
- `button_name`: Name of the clicked button
- `form_name`: Name of the submitted form
- `campaign_id`: ID of the campaign
- `sequence_type`: Type of email sequence
- `plan_name`: Selected plan name
- `conversion_type`: Type of conversion event

### Custom Parameters
All events include standard parameters plus custom data relevant to the action:
- Location context (current page)
- User authentication status
- Campaign metadata
- Transaction values

## Viewing Data in Google Analytics

### Real-Time Reports
View live user activity at: `Analytics > Reports > Realtime`

### Key Reports to Monitor
1. **Acquisition Overview**: How users find your app
2. **Engagement > Events**: See all tracked events
3. **Engagement > Conversions**: Monitor conversion funnel
4. **Monetization**: Track plan upgrades and revenue

### Setting Up Funnel Visualization in GA4

1. Go to **Explore** in GA4
2. Create a new **Funnel Exploration**
3. Add these steps in order:
   - Step 1: `funnel_step` (step = 'signup')
   - Step 2: `funnel_step` (step = 'generate')
   - Step 3: `funnel_step` (step = 'export')
   - Step 4: `funnel_step` (step = 'upgrade')

This will show you the conversion rate at each stage of the user journey.

## Mobile & Desktop Tracking
All tracking works seamlessly on both mobile and desktop devices. GA4 automatically collects:
- Device type (mobile, tablet, desktop)
- Screen resolution
- Browser information
- Operating system

## Performance Considerations
- GA4 script loads **asynchronously** to avoid blocking page rendering
- All tracking calls are non-blocking
- Failed tracking calls don't affect user experience
- Page view tracking is debounced to avoid duplicate events

## Privacy & Compliance
- GA4 is GDPR-compliant when configured properly
- Consider adding a cookie consent banner if required in your region
- Measurement ID is public and safe to expose in frontend code

## Testing Your Integration

### Browser Console Testing
Open browser console and type:
```javascript
// Check if GA4 is loaded
window.gtag

// Check data layer
window.dataLayer
```

### GA4 DebugView
1. Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/) Chrome extension
2. Enable debug mode
3. Visit your site and perform actions
4. View events in **DebugView** in GA4 dashboard

## Troubleshooting

### Events Not Showing Up
1. Verify `VITE_GA4_MEASUREMENT_ID` is set correctly in `.env`
2. Check browser console for errors
3. Ensure ad blockers are disabled during testing
4. Wait 24-48 hours for historical reports to populate (real-time should work immediately)

### Duplicate Page Views
- Fixed by setting `send_page_view: false` in initial config
- Custom page view tracking prevents duplicates

## Files Modified
- `index.html`: Added GA4 script tags
- `src/lib/analytics.ts`: Core analytics utility functions
- `src/hooks/usePageTracking.tsx`: Page view tracking hook
- `src/App.tsx`: Integrated page tracking
- `src/pages/CreateCampaign.tsx`: Added generation tracking
- `src/pages/Auth.tsx`: Added auth form tracking
- `src/pages/Billing.tsx`: Added upgrade tracking
- `src/pages/CampaignView.tsx`: Added export tracking
- `src/pages/Index.tsx`: Added landing page button tracking
- `src/components/pricing/PricingSection.tsx`: Added pricing click tracking
- `.env`: Added GA4_MEASUREMENT_ID variable

## Next Steps
1. Add your GA4 Measurement ID to `.env`
2. Deploy the updated application
3. Verify events are being tracked in GA4 Real-Time view
4. Set up custom reports and funnels in GA4
5. Configure conversion tracking for business goals
6. Monitor user behavior and optimize based on insights

## Support
For issues or questions about the GA4 integration, refer to:
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
