import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Store, Rocket } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Step 1: Platform selection
  const [userPlatform, setUserPlatform] = useState<"seller" | "founder" | "">("");
  
  // Step 2: What brings you to Vayno
  const [purpose, setPurpose] = useState("");
  
  // Step 3: Email marketing experience
  const [experience, setExperience] = useState("");

  const totalSteps = 3;

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
    if (step === 2 && !purpose) {
      toast.error("Please select what brings you to Vayno");
      return;
    }
    if (step === 3 && !experience) {
      toast.error("Please select your experience level");
      return;
    }
    
    if (step < totalSteps) {
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
          brand_guidelines: { purpose, experience },
          onboarding_completed: true
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Welcome to Vayno!");
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
          {/* Progress dots (subtle) */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? "w-8 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
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
                <h2 className="text-3xl font-bold mb-2">First up—who are you?</h2>
                <p className="text-muted-foreground">
                  No wrong answers here
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

          {/* Step 2: What brings you to Vayno */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">What's the mission?</h2>
                <p className="text-muted-foreground">
                  We'll keep this between us
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "Grow my business",
                  "Promote a new product",
                  "Set up automated email sequences",
                  "Improve my marketing",
                  "Build stronger customer relationships",
                  "Just trying it out",
                  "School project / research"
                ].map((option) => (
                  <Card
                    key={option}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      purpose === option
                        ? "border-primary border-2 bg-primary/5"
                        : "border-2"
                    }`}
                    onClick={() => setPurpose(option)}
                  >
                    <p className="font-medium">{option}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Email marketing experience */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">One last thing...</h2>
                <p className="text-muted-foreground">
                  How comfortable are you with email?
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "I'm a total beginner",
                  "I know the basics",
                  "I'm comfortable",
                  "I'm advanced",
                  "I'm a pro (I live in Klaviyo/Mailchimp)"
                ].map((option) => (
                  <Card
                    key={option}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      experience === option
                        ? "border-primary border-2 bg-primary/5"
                        : "border-2"
                    }`}
                    onClick={() => setExperience(option)}
                  >
                    <p className="font-medium">{option}</p>
                  </Card>
                ))}
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
              ) : step === totalSteps ? (
                "Finish"
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
