import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Link as LinkIcon, FileText, Download } from "lucide-react";
import { z } from "zod";
import { trackButtonClick, trackFunnelStep } from "@/lib/analytics";

const sequenceTypes = [
  { value: "welcome", label: "Welcome Series 📝", description: "Introduce your brand, set the tone, and build trust with new subscribers or buyers." },
  { value: "product-launch", label: "Product Launch 🚀", description: "Announce your new product or feature with excitement and storytelling that drives conversions." },
  { value: "sales-promotion", label: "Sales / Promotion 💰", description: "Run limited-time discounts, flash sales, or special offers with urgency and clear CTAs." },
  { value: "abandoned-cart", label: "Abandoned Cart 🛒", description: "Remind visitors what they left behind and gently nudge them to complete their purchase." },
  { value: "re-engagement", label: "Re-engagement / Win-Back 🔄", description: "Bring inactive users or subscribers back with updates, offers, or fresh value." },
  { value: "nurture", label: "Nurture / Educational 🎓", description: "Share helpful insights or tutorials to build authority and trust over time." },
  { value: "onboarding", label: "Onboarding (SaaS) ⚙️", description: "Guide new users through setup, value discovery, and first success milestones." },
  { value: "feature-announcement", label: "Feature Announcement / Update 🔔", description: "Highlight what's new — keep users engaged with updates and improvements." },
  { value: "pre-launch", label: "Pre-Launch / Waitlist ⏳", description: "Build excitement before launch day. Perfect for early access or new releases." },
  { value: "testimonial", label: "Customer Testimonial / Proof 🌟", description: "Leverage stories, reviews, or user wins to increase credibility and trust." },
  { value: "newsletter", label: "Newsletter / Content Series 🗞️", description: "Share recurring updates, educational content, or brand stories that keep your audience warm." },
  { value: "seasonal", label: "Seasonal / Holiday Campaign 🎉", description: "Engage your audience during key seasons — Black Friday, holidays, or special events." },
  { value: "upsell", label: "Upsell / Cross-Sell Sequence 🔼", description: "Recommend complementary products or upgrades after purchase." },
  { value: "event-followup", label: "Event Follow-up 🎤", description: "Send post-event recaps, replays, or offers to attendees." },
];

const dripDurations = [
  { value: "7-day", label: "7-Day Drip (4 emails)", description: "Quick sequence over one week", emails: 4 },
  { value: "14-day", label: "14-Day Drip (7 emails)", description: "Medium-paced sequence over two weeks", emails: 7 },
  { value: "30-day", label: "30-Day Drip (12 emails)", description: "Extended sequence over a month", emails: 12 },
  { value: "custom", label: "Custom Duration", description: "Define your own schedule", emails: 0 },
];

const getEmailCount = (dripValue: string, customEmails?: number) => {
  if (dripValue === "custom") return customEmails || 0;
  const duration = dripDurations.find(d => d.value === dripValue);
  return duration?.emails || 0;
};

const urlSchema = z.string().url("Please enter a valid URL");
const nameSchema = z.string().min(3, "Campaign name must be at least 3 characters");

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [sequenceType, setSequenceType] = useState("");
  const [dripDuration, setDripDuration] = useState("");
  const [wordsPerEmail, setWordsPerEmail] = useState("");
  const [includeCTA, setIncludeCTA] = useState(false);
  const [ctaLink, setCtaLink] = useState("");
  const [customDays, setCustomDays] = useState("");
  const [customEmails, setCustomEmails] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        setIsGuest(false);
      } else {
        setIsGuest(true);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      urlSchema.parse(url);
      nameSchema.parse(name);

      if (!sequenceType) {
        toast.error("Please select a sequence type");
        setLoading(false);
        return;
      }

      if (!dripDuration) {
        toast.error("Please select a drip duration");
        setLoading(false);
        return;
      }

      // Validate custom duration if selected
      if (dripDuration === "custom") {
        const days = parseInt(customDays);
        const emails = parseInt(customEmails);
        if (isNaN(days) || days < 1 || days > 90) {
          toast.error("Custom duration must be between 1 and 90 days");
          setLoading(false);
          return;
        }
        if (isNaN(emails) || emails < 1 || emails > 30) {
          toast.error("Number of emails must be between 1 and 30");
          setLoading(false);
          return;
        }
      }

      const wordsNum = parseInt(wordsPerEmail);
      if (isNaN(wordsNum) || wordsNum < 50 || wordsNum > 500) {
        toast.error("Words per email must be between 50 and 500");
        setLoading(false);
        return;
      }

      // For authenticated users, check credit balance
      if (userId) {
        const { data: usageData, error: usageError } = await supabase
          .from("user_usage")
          .select("generations_used, generations_limit, plan")
          .eq("user_id", userId)
          .single();

        if (usageError) {
          toast.error("Failed to check your credit balance");
          setLoading(false);
          return;
        }

        const creditsRemaining = usageData.generations_limit - usageData.generations_used;

        if (creditsRemaining <= 0) {
          toast.error("You've used all your credits — upgrade or top up to continue.");
          navigate("/billing");
          setLoading(false);
          return;
        }
      } else {
        // Check if guest has already used their free generation
        const guestCampaignId = localStorage.getItem("guestCampaignId");
        if (guestCampaignId) {
          toast.error("You've already tried your free generation! Sign up to continue.");
          setTimeout(() => navigate("/auth"), 2000);
          setLoading(false);
          return;
        }
      }

      // Prepare drip duration value
      const finalDripDuration = dripDuration === "custom" 
        ? `custom-${customDays}-${customEmails}` 
        : dripDuration;

      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          user_id: userId, // null for guests
          name,
          url,
          status: "analyzing",
          sequence_type: sequenceType,
          drip_duration: finalDripDuration,
          words_per_email: wordsNum,
          include_cta: includeCTA,
          cta_link: ctaLink || null,
        })
        .select()
        .single();

      if (campaignError) {
        console.error("Campaign creation error:", campaignError);
        toast.error(`Failed to create campaign: ${campaignError.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      if (!campaign) {
        console.error("No campaign data returned");
        toast.error("Failed to create campaign: No data returned");
        setLoading(false);
        return;
      }

      // Store guest campaign ID for later claiming
      if (!userId) {
        localStorage.setItem("guestCampaignId", campaign.id);
      }

      // Track funnel step
      trackFunnelStep('generate', {
        sequence_type: sequenceType,
        campaign_id: campaign.id,
      });

      navigate(`/campaign/${campaign.id}/analyzing`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("An error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!isGuest && (
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6 hover-lift"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        )}

        {isGuest && (
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 hover-lift"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isGuest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 glass-card p-6 border-primary/30 rounded-2xl text-center"
            >
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
              <p className="text-muted-foreground mb-4">
                Sign up now to generate powerful, high-converting email campaigns powered by AI.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                className="btn-premium"
              >
                Sign Up to Get Started
              </Button>
            </motion.div>
          )}
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              {isGuest ? "Try Your First Campaign" : "Create New Campaign"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enter your product URL and we'll analyze it to generate a complete email sequence
            </p>
          </div>

          <Card className="glass-card p-8 hover-lift mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base">Campaign Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Summer Product Launch"
                  required
                  className="mt-2 h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Give your campaign a memorable name
                </p>
              </div>

              <div>
                <Label htmlFor="url" className="text-base">Product Landing Page URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/product"
                  required
                  className="mt-2 h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  The URL will be analyzed to extract product details and generate emails
                </p>
              </div>

              <div>
                <Label htmlFor="sequence-type" className="text-base">Sequence Type</Label>
                <Select value={sequenceType} onValueChange={setSequenceType}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Choose your email sequence purpose" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {sequenceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Select the goal of your email sequence
                </p>
              </div>

              <div>
                <Label htmlFor="drip-duration" className="text-base">Drip Duration</Label>
                <Select value={dripDuration} onValueChange={setDripDuration}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Choose sequence pacing" />
                  </SelectTrigger>
                  <SelectContent>
                    {dripDurations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{duration.label}</span>
                          <span className="text-xs text-muted-foreground">{duration.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Define the pacing and length of your sequence
                </p>
              </div>

              {dripDuration === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="custom-days" className="text-base">Number of Days</Label>
                    <Input
                      id="custom-days"
                      type="number"
                      min="1"
                      max="90"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="14"
                      required
                      className="mt-2 h-12"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      1-90 days
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="custom-emails" className="text-base">Number of Emails</Label>
                    <Input
                      id="custom-emails"
                      type="number"
                      min="1"
                      max="30"
                      value={customEmails}
                      onChange={(e) => setCustomEmails(e.target.value)}
                      placeholder="7"
                      required
                      className="mt-2 h-12"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      1-30 emails
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="words-per-email" className="text-base">Words Per Email</Label>
                <Input
                  id="words-per-email"
                  type="number"
                  min="50"
                  max="500"
                  value={wordsPerEmail}
                  onChange={(e) => setWordsPerEmail(e.target.value)}
                  placeholder="250"
                  required
                  className="mt-2 h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Choose between 50-500 words per email
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-cta" 
                    checked={includeCTA}
                    onCheckedChange={(checked) => setIncludeCTA(checked as boolean)}
                  />
                  <Label htmlFor="include-cta" className="text-base cursor-pointer">
                    Include Call-to-Action (CTA) in emails
                  </Label>
                </div>
                
                {includeCTA && (
                  <div>
                    <Label htmlFor="cta-link" className="text-base">CTA Link (Optional)</Label>
                    <Input
                      id="cta-link"
                      type="url"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      placeholder="https://example.com/signup"
                      className="mt-2 h-12"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {ctaLink ? "CTA will be a clickable button" : "Without a link, CTA will be text only"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  className="flex-1 btn-premium shadow-lg hover-lift h-12 text-base"
                  disabled={loading}
                  onClick={() => trackButtonClick('Generate Campaign', '/create-campaign')}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze & Generate Emails
                    </>
                  )}
                </Button>
                {dripDuration && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 whitespace-nowrap">
                    <span className="text-sm font-medium">
                      {getEmailCount(dripDuration, parseInt(customEmails))} credits
                    </span>
                  </div>
                )}
              </div>
            </form>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: LinkIcon, title: "We'll scan your page", desc: "AI extracts product info and brand voice" },
              { icon: FileText, title: "Generate 3-5 emails", desc: "Professional copy matching your style" },
              { icon: Download, title: "Export & send", desc: "Ready-to-upload HTML format" }
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <Card className="glass-card p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCampaign;