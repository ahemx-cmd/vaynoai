import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Globe, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trackFunnelStep } from "@/lib/analytics";
import vaynoIcon from "@/assets/vayno-icon.png";

const sequenceTypes = [
  { value: "welcome", label: "Welcome Series", description: "Onboard new subscribers", icon: "👋" },
  { value: "product-launch", label: "Product Launch", description: "Announce new products", icon: "🚀" },
  { value: "nurture", label: "Lead Nurture", description: "Build relationships", icon: "🌱" },
  { value: "promotional", label: "Promotional", description: "Drive sales & conversions", icon: "💰" },
  { value: "abandoned-cart", label: "Abandoned Cart", description: "Recover lost sales", icon: "🛒" },
  { value: "educational", label: "Educational", description: "Share knowledge & tips", icon: "📚" },
];

const dripDurations = [
  { value: "7", label: "7 days", emails: 4, description: "Focused & concise" },
  { value: "14", label: "14 days", emails: 5, description: "Balanced approach" },
  { value: "30", label: "30 days", emails: 7, description: "Comprehensive journey" },
];

const wordCounts = [
  { value: "250", label: "Short & Sweet", description: "~250 words per email" },
  { value: "500", label: "Balanced", description: "~500 words per email" },
  { value: "750", label: "Detailed", description: "~750 words per email" },
];

const GuestCampaignFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [url, setUrl] = useState("");
  const [sequenceType, setSequenceType] = useState("");
  const [dripDuration, setDripDuration] = useState("");
  const [wordCount, setWordCount] = useState("500");

  const handleNext = () => {
    if (step === 1 && !url) {
      toast.error("Please enter your landing page URL");
      return;
    }
    if (step === 1 && !url.match(/^https?:\/\/.+/)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    if (step === 2 && !sequenceType) {
      toast.error("Please select a sequence type");
      return;
    }
    if (step === 3 && !dripDuration) {
      toast.error("Please select a drip duration");
      return;
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleGenerate = async () => {
    setSubmitting(true);

    try {
      const campaignName = `Campaign for ${new URL(url).hostname}`;
      const emailCount = dripDurations.find(d => d.value === dripDuration)?.emails || 5;

      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          name: campaignName,
          url: url,
          sequence_type: sequenceType,
          drip_duration: dripDuration,
          words_per_email: parseInt(wordCount),
          status: "pending",
          user_id: null, // Guest campaign
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      trackFunnelStep("generate", { 
        campaign_id: campaign.id,
        sequence_type: sequenceType 
      });

      navigate(`/campaign/${campaign.id}/analyzing`);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <nav className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={vaynoIcon} alt="Vayno" className="w-10 h-10" />
              <span className="font-bold text-xl">Vayno</span>
            </div>
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  s <= step ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 'bg-muted text-muted-foreground'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    s < step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>URL</span>
            <span>Type</span>
            <span>Duration</span>
            <span>Generate</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: URL Input */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden border-2 border-primary/20 backdrop-blur-xl bg-background/95">
                  {/* Glassmorphic effect with neon edges */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-lg animate-pulse" 
                       style={{ 
                         clipPath: 'polygon(0 0, 100% 0, 100% 2px, 0 2px, 0 100%, 2px 100%, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 2px), 0 calc(100% - 2px))',
                         opacity: 0.6 
                       }} 
                  />
                  
                  <div className="relative p-12">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3">Paste Your Landing Page URL</h2>
                      <p className="text-muted-foreground">
                        Our AI will analyze your page to create perfectly matched email campaigns
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Input
                          type="url"
                          placeholder="https://yourwebsite.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="h-14 text-lg border-2 focus:border-primary transition-all"
                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                      </div>

                      <Button
                        size="lg"
                        onClick={handleNext}
                        className="w-full h-14 text-lg btn-premium"
                      >
                        Next <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Sequence Type */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden border-2 border-primary/20 backdrop-blur-xl bg-background/95 p-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  
                  <div className="relative">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3">Choose Your Sequence Type</h2>
                      <p className="text-muted-foreground">
                        Select the campaign style that fits your goals
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {sequenceTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSequenceType(type.value)}
                          className={`p-6 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                            sequenceType === type.value
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{type.icon}</div>
                          <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleNext}
                        className="flex-1 btn-premium"
                        disabled={!sequenceType}
                      >
                        Next <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Drip Duration */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden border-2 border-primary/20 backdrop-blur-xl bg-background/95 p-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  
                  <div className="relative">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3">Set Your Drip Duration</h2>
                      <p className="text-muted-foreground">
                        How long should your email sequence run?
                      </p>
                    </div>

                    <div className="grid gap-4 mb-6">
                      {dripDurations.map((duration) => (
                        <button
                          key={duration.value}
                          onClick={() => setDripDuration(duration.value)}
                          className={`p-6 rounded-xl border-2 transition-all text-left hover:scale-102 ${
                            dripDuration === duration.value
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-xl mb-1">{duration.label}</h3>
                              <p className="text-sm text-muted-foreground">{duration.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-primary">{duration.emails}</div>
                              <div className="text-xs text-muted-foreground">emails</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleNext}
                        className="flex-1 btn-premium"
                        disabled={!dripDuration}
                      >
                        Next <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Word Count & Generate */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden border-2 border-primary/20 backdrop-blur-xl bg-background/95 p-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  
                  <div className="relative">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3">Email Length Preference</h2>
                      <p className="text-muted-foreground">
                        Choose how detailed you want each email to be
                      </p>
                    </div>

                    <div className="grid gap-4 mb-8">
                      {wordCounts.map((wc) => (
                        <button
                          key={wc.value}
                          onClick={() => setWordCount(wc.value)}
                          className={`p-6 rounded-xl border-2 transition-all text-left hover:scale-102 ${
                            wordCount === wc.value
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <h3 className="font-semibold text-xl mb-1">{wc.label}</h3>
                          <p className="text-sm text-muted-foreground">{wc.description}</p>
                        </button>
                      ))}
                    </div>

                    <div className="bg-muted/30 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold mb-3">Your Campaign Summary:</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">URL:</span>
                          <p className="font-medium truncate">{url}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sequence:</span>
                          <p className="font-medium">{sequenceTypes.find(s => s.value === sequenceType)?.label}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-medium">{dripDuration} days</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Emails:</span>
                          <p className="font-medium">{dripDurations.find(d => d.value === dripDuration)?.emails} emails</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleGenerate}
                        className="flex-1 btn-premium"
                        disabled={submitting}
                      >
                        {submitting ? "Generating..." : "Analyze & Generate"}
                        {!submitting && <Sparkles className="w-5 h-5 ml-2" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GuestCampaignFlow;
