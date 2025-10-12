import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Link as LinkIcon, FileText, Download, Info } from "lucide-react";
import { z } from "zod";

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
  { value: "7-day", label: "7-Day Drip (4 emails)", description: "Quick sequence over one week" },
  { value: "14-day", label: "14-Day Drip (7 emails)", description: "Medium-paced sequence over two weeks" },
  { value: "30-day", label: "30-Day Drip (12 emails)", description: "Extended sequence over a month" },
];

const urlSchema = z.string().url("Please enter a valid URL");
const nameSchema = z.string().min(3, "Campaign name must be at least 3 characters");

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [urlSummary, setUrlSummary] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [sequenceType, setSequenceType] = useState("");
  const [dripDuration, setDripDuration] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleAnalyzeUrl = async () => {
    try {
      urlSchema.parse(url);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-url", {
        body: { url },
      });

      if (error) throw error;

      if (data?.analysis) {
        setUrlSummary(data.analysis);
        setShowSummary(true);
      }
    } catch (err) {
      toast.error("Failed to analyze URL");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("You must be logged in");
      return;
    }

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

      const { data: usageData, error: usageError } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (usageError) {
        toast.error("Failed to check usage");
        setLoading(false);
        return;
      }

      if (usageData.generations_used >= usageData.generations_limit) {
        toast.error("You've reached your generation limit. Please upgrade your plan.");
        setLoading(false);
        return;
      }

      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          user_id: userId,
          name,
          url,
          status: "analyzing",
          sequence_type: sequenceType,
          drip_duration: dripDuration,
        })
        .select()
        .single();

      if (campaignError) {
        toast.error("Failed to create campaign");
        setLoading(false);
        return;
      }

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
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover-lift"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Create New Campaign</h1>
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
                <div className="flex gap-2 mt-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/product"
                    required
                    className="h-12"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAnalyzeUrl}
                    disabled={analyzing || !url}
                    className="shrink-0"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Info className="w-4 h-4 mr-2" />
                        Preview Summary
                      </>
                    )}
                  </Button>
                </div>
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

              <Button
                type="submit"
                className="w-full btn-premium shadow-lg hover-lift h-12 text-base"
                disabled={loading}
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

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              URL Analysis Summary
            </DialogTitle>
          </DialogHeader>
          {urlSummary && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Product/Service</h4>
                <p className="text-sm text-muted-foreground">{urlSummary.title}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{urlSummary.description}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Key Features</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {urlSummary.keyFeatures?.map((feature: string, i: number) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Target Audience</h4>
                  <p className="text-sm text-muted-foreground">{urlSummary.targetAudience}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Price Range</h4>
                  <p className="text-sm text-muted-foreground">{urlSummary.priceRange}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Brand Voice</h4>
                <p className="text-sm text-muted-foreground">{urlSummary.brandVoice}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  This analysis will help generate emails that match your brand and product perfectly.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCampaign;