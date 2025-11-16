export const sellerSequenceTypes = [
  { 
    value: "welcome", 
    label: "Welcome Series", 
    description: "Say hi, offer a first-time purchase incentive or showcase top products." 
  },
  { 
    value: "abandoned-cart", 
    label: "Abandoned Cart Recovery", 
    description: "Remind customers about items left in cart." 
  },
  { 
    value: "browse-abandonment", 
    label: "Browse Abandonment", 
    description: "Target users who browsed but didn't add anything to cart." 
  },
  { 
    value: "checkout-abandonment", 
    label: "Checkout Abandonment", 
    description: "For users who started checkout but didn't complete." 
  },
  { 
    value: "post-purchase", 
    label: "Post‑Purchase Thank‑You / Order Follow‑Up", 
    description: "Confirm order, say thanks, maybe cross-sell." 
  },
  { 
    value: "review-request", 
    label: "Review Request Series", 
    description: "Ask for reviews / feedback after purchase or delivery." 
  },
  { 
    value: "upsell", 
    label: "Upsell / Cross‑Sell Series", 
    description: "Promote complementary products or premium versions." 
  },
  { 
    value: "re-engagement", 
    label: "Re‑engagement / Win‑Back", 
    description: "Reconnect with customers who haven't bought in a while." 
  },
  { 
    value: "vip-loyalty", 
    label: "VIP / Loyalty Sequence", 
    description: "Reward repeat customers, make them feel special." 
  },
  { 
    value: "back-in-stock", 
    label: "Back‑in‑Stock / Price‑Drop Alert", 
    description: "Notify customers when products they liked or wishlisted return or go on discount." 
  },
];

export const founderSequenceTypes = [
  { 
    value: "welcome-onboarding", 
    label: "Welcome / Onboarding Sequence", 
    description: "Introduce the product, highlight 'aha' moments, set expectations." 
  },
  { 
    value: "trial-upgrade", 
    label: "Trial → Paid Upgrade Flow", 
    description: "Guide trial users toward conversion, with reminders and value nudges." 
  },
  { 
    value: "activation", 
    label: "Activation / Feature Education Flow", 
    description: "Teach users how to use key features, drive adoption." 
  },
  { 
    value: "feature-announcement", 
    label: "Feature Announcement / Product Launch", 
    description: "Announce new features, explain why they matter, get people excited." 
  },
  { 
    value: "educational-nurture", 
    label: "Educational / Nurture Drip", 
    description: "Share value-driven content, tips, or best practices." 
  },
  { 
    value: "churn-recovery", 
    label: "Churn Recovery / Win‑Back", 
    description: "Re-engage inactive or churned users." 
  },
  { 
    value: "expansion-upgrade", 
    label: "Expansion / Upgrade Flow", 
    description: "For existing users: upsell to higher tiers, promote add-ons." 
  },
  { 
    value: "customer-success", 
    label: "Customer Success / Adoption Sequence", 
    description: "Help customers get more value, reduce support friction." 
  },
  { 
    value: "founder-story", 
    label: "Founder Story / Brand Story", 
    description: "Humanize the brand, build trust through the founder's journey." 
  },
  { 
    value: "newsletter", 
    label: "Weekly Newsletter / Regular Content", 
    description: "Keep users engaged with updates, insights, content, or news." 
  },
];

export const getSequenceTypes = (userPlatform: string | null | undefined) => {
  if (userPlatform === "seller") return sellerSequenceTypes;
  if (userPlatform === "founder") return founderSequenceTypes;
  // Default to founder types for guests or undefined
  return founderSequenceTypes;
};
