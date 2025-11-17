import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Store, Rocket, FileText, Globe, Palette, Upload } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Step 1: Platform selection
  const [userPlatform, setUserPlatform] = useState<"seller" | "founder" | "">("");
  
  // Step 2: Brand guidelines
  const [brandGuidelines, setBrandGuidelines] = useState({
    type: "", // "document", "website", "tone", "manual"
    content: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUserId(session.user.id);

    // Check if onboarding is already completed
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", session.user.id)
      .single();

    if (profile?.onboarding_completed) {
      navigate("/dashboard");
    }
  };

  const handleNext = () => {
    if (step === 1 && !userPlatform) {
      toast.error("Please select a platform");
      return;
    }
    if (step === 2 && !brandGuidelines.type) {
      toast.error("Please select how you want to set brand guidelines");
      return;
    }
    if (step === 2 && brandGuidelines.type === "manual" && !brandGuidelines.content) {
      toast.error("Please describe your brand voice");
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          user_platform: userPlatform,
          brand_guidelines: brandGuidelines,
          onboarding_completed: true
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Welcome to Vayno! Let's choose your plan.");
      navigate("/choose-plan");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      s < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Platform Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">What best describes you?</h2>
                <p className="text-muted-foreground">
                  This helps us personalize your experience
                </p>
              </div>

              <div className="grid gap-4">
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    userPlatform === "seller"
                      ? "border-primary border-2 bg-primary/5"
                      : "border-2"
                  }`}
                  onClick={() => setUserPlatform("seller")}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        Seller (Shopify / ecommerce)
                      </h3>
                      <p className="text-muted-foreground">
                        For Shopify stores, dropshipping, ecommerce, POD, DTC brands
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    userPlatform === "founder"
                      ? "border-primary border-2 bg-primary/5"
                      : "border-2"
                  }`}
                  onClick={() => setUserPlatform("founder")}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        Founder (SaaS / newsletters / digital products)
                      </h3>
                      <p className="text-muted-foreground">
                        For SaaS founders, indie hackers, newsletters, startup builders, coaches
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 2: Brand Guidelines */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">Do you have brand guidelines?</h2>
                <p className="text-muted-foreground">
                  Help us understand your brand voice and tone
                </p>
              </div>

              <div className="grid gap-4">
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    brandGuidelines.type === "document"
                      ? "border-primary border-2 bg-primary/5"
                      : "border-2"
                  }`}
                  onClick={() => setBrandGuidelines({ ...brandGuidelines, type: "document" })}
                >
                  <div className="flex items-center gap-4">
                    <Upload className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">I have a document</h3>
                      <p className="text-sm text-muted-foreground">Upload your brand guidelines</p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    brandGuidelines.type === "website"
                      ? "border-primary border-2 bg-primary/5"
                      : "border-2"
                  }`}
                  onClick={() => setBrandGuidelines({ ...brandGuidelines, type: "website" })}
                >
                  <div className="flex items-center gap-4">
                    <Globe className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">Learn from my website</h3>
                      <p className="text-sm text-muted-foreground">We'll analyze your website's tone</p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    brandGuidelines.type === "tone"
                      ? "border-primary border-2 bg-primary/5"
                      : "border-2"
                  }`}
                  onClick={() => setBrandGuidelines({ ...brandGuidelines, type: "tone" })}
                >
                  <div className="flex items-center gap-4">
                    <Palette className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">No, just match a general tone</h3>
                      <p className="text-sm text-muted-foreground">We'll use best practices</p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    brandGuidelines.type === "manual"
                      ? "border-primary border-2 bg-primary/5"
                      : "border-2"
                  }`}
                  onClick={() => setBrandGuidelines({ ...brandGuidelines, type: "manual" })}
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">Let me describe my brand voice manually</h3>
                      <p className="text-sm text-muted-foreground">Write your own description</p>
                    </div>
                  </div>
                </Card>
              </div>

              {brandGuidelines.type === "manual" && (
                <div className="space-y-2">
                  <Label>Describe your brand voice</Label>
                  <Textarea
                    placeholder="e.g., Professional yet friendly, with a focus on clarity and trust..."
                    value={brandGuidelines.content}
                    onChange={(e) => setBrandGuidelines({ ...brandGuidelines, content: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Choose Plan */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">Choose Your Plan to Continue</h2>
                <p className="text-muted-foreground">
                  Select a plan that fits your needs to start creating campaigns
                </p>
              </div>

              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-4">
                  You'll be able to select your plan on the next page
                </p>
                <p className="text-sm text-muted-foreground">
                  Start with a free trial or choose a paid plan to unlock full features
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || loading}
            >
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : step === 3 ? (
                "Complete Setup"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Onboarding;
