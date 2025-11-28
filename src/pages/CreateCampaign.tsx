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
import { ArrowLeft, Sparkles, Loader2, Link as LinkIcon, FileText, Download, Gem, ChevronDown, Upload } from "lucide-react";
import { z } from "zod";
import { trackButtonClick, trackFunnelStep } from "@/lib/analytics";
import { getSequenceTypes } from "@/lib/sequenceTypes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import OutOfCreditsModal from "@/components/billing/OutOfCreditsModal";


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
  const [userPlatform, setUserPlatform] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [sequenceType, setSequenceType] = useState("");
  const [dripDuration, setDripDuration] = useState("");
  const [wordsPerEmail, setWordsPerEmail] = useState("");
  const [includeCTA, setIncludeCTA] = useState(false);
  const [ctaLink, setCtaLink] = useState("");
  const [customDays, setCustomDays] = useState("");
  const [customEmails, setCustomEmails] = useState("");
  const [brandGuidelinesFile, setBrandGuidelinesFile] = useState<File | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showOutOfCreditsModal, setShowOutOfCreditsModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        setIsGuest(false);
        
        // Fetch user platform
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_platform")
          .eq("id", session.user.id)
          .single();
        
        if (profile) {
          setUserPlatform(profile.user_platform);
        }
      } else {
        setIsGuest(true);
      }
    };
    
    fetchUserData();
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
          .select("generations_used, generations_limit, topup_credits")
          .eq("user_id", userId)
          .single();

        if (usageError) {
          toast.error("Failed to check your credit balance");
          setLoading(false);
          return;
        }

        const totalCredits = usageData.generations_limit + usageData.topup_credits;
        const creditsRemaining = totalCredits - usageData.generations_used;

        if (creditsRemaining <= 0) {
          setShowOutOfCreditsModal(true);
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
    <div className="min-h-screen bg-background">
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
              className="glass-card p-6 border-primary/20 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">This one's on us</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Try your first campaign completely free. No signup. No card. Just results.
                  </p>
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="outline"
                    size="sm"
                  >
                    Want more? Create an account
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="max-w-2xl mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              {isGuest ? "Let's create your first sequence" : "New campaign"}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Drop your product URL. We'll handle the rest.
            </p>
          </div>

          <Card className="glass-card p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <Label htmlFor="name" className="text-base font-medium">What should we call this?</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Summer launch, new product, etc."
                  required
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="url" className="text-base font-medium">Your product URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yoursite.com/product"
                  required
                  className="mt-2 h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  We'll read your page and write emails that match your voice
                </p>
              </div>

              <div>
                <Label htmlFor="sequence-type" className="text-base font-medium">What's the goal?</Label>
                <Select value={sequenceType} onValueChange={setSequenceType}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Pick what you're trying to do" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {getSequenceTypes(userPlatform).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="drip-duration" className="text-base font-medium">How long should it run?</Label>
                <Select value={dripDuration} onValueChange={setDripDuration}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Pick your sequence length" />
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
                <Label htmlFor="words-per-email" className="text-base font-medium">Email length (words)</Label>
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
                  Between 50-500 words
                </p>
              </div>

              {/* Advanced Options Collapsible */}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                  >
                    <span className="text-base font-medium">Advanced Options</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div>
                    <Label htmlFor="brand-guidelines" className="text-base">
                      Upload Brand Guidelines (Optional)
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="brand-guidelines"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => setBrandGuidelinesFile(e.target.files?.[0] || null)}
                        className="h-12 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {brandGuidelinesFile 
                          ? `Selected: ${brandGuidelinesFile.name}` 
                          : "PDF, DOC, DOCX, or TXT format"}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

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
                      Building your sequence...
                    </>
                  ) : (
                    "Generate my emails"
                  )}
                </Button>
                {dripDuration && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 whitespace-nowrap">
                    <Gem className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">
                      {getEmailCount(dripDuration, parseInt(customEmails))}
                    </span>
                  </div>
                )}
              </div>
            </form>
          </Card>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: LinkIcon, title: "Scan", desc: "We read your landing page" },
              { icon: FileText, title: "Write", desc: "Generate campaign in 30s" },
              { icon: Download, title: "Ship", desc: "Export HTML, send emails" }
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-card/50"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-0.5">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Out of Credits Modal */}
        {userId && (
          <OutOfCreditsModal 
            open={showOutOfCreditsModal}
            onClose={() => setShowOutOfCreditsModal(false)}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
};

export default CreateCampaign;