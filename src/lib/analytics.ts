// Google Analytics 4 tracking utilities

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

// Helper to check if GA4 is loaded
const isGA4Loaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Page view tracking
export const trackPageView = (path: string, title?: string) => {
  if (!isGA4Loaded() || !GA4_MEASUREMENT_ID) return;
  
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
};

// Generic event tracking
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (!isGA4Loaded() || !GA4_MEASUREMENT_ID) return;
  
  window.gtag?.('event', eventName, eventParams);
};

// Button click tracking
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location || window.location.pathname,
  });
};

// Form submission tracking
export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent('form_submit', {
    form_name: formName,
    success,
  });
};

// Conversion tracking
export const trackConversion = (
  conversionType: 'generation' | 'payment' | 'signup' | 'export',
  value?: number,
  metadata?: Record<string, any>
) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value,
    currency: 'USD',
    ...metadata,
  });
};

// Campaign generation tracking
export const trackCampaignGeneration = (
  campaignId: string,
  sequenceType?: string
) => {
  trackEvent('campaign_generated', {
    campaign_id: campaignId,
    sequence_type: sequenceType,
  });
  
  trackConversion('generation');
};

// Export tracking
export const trackExport = (exportType: 'html' | 'zip', campaignId: string) => {
  trackEvent('export', {
    export_type: exportType,
    campaign_id: campaignId,
  });
  
  trackConversion('export');
};

// Plan upgrade tracking
export const trackPlanUpgrade = (planName: string, price: number) => {
  trackEvent('upgrade_click', {
    plan_name: planName,
    price,
  });
  
  trackConversion('payment', price, { plan: planName });
};

// User session tracking (automatic via GA4)
// Bounce rate is calculated automatically by GA4

// User funnel events
export const trackFunnelStep = (
  step: 'signup' | 'generate' | 'export' | 'upgrade',
  metadata?: Record<string, any>
) => {
  trackEvent('funnel_step', {
    step,
    ...metadata,
  });
};
