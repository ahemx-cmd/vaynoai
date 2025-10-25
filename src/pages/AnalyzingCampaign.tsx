import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

const AnalyzingCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "Fetching your landing page...",
    "Extracting product information...",
    "Understanding your brand voice...",
    "Generating email sequence...",
    "Polishing the copy...",
    "Almost done! 🚀",
  ];

  useEffect(() => {
    const analyzeAndGenerate = async () => {
      if (!id) return;

      try {
        // Fetch campaign
        const { data: campaign, error: campaignError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", id)
          .single();

        if (campaignError || !campaign) {
          throw new Error("Campaign not found");
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + 5;
          });
        }, 500);

        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => {
            if (prev >= steps.length - 1) {
              clearInterval(stepInterval);
              return steps.length - 1;
            }
            return prev + 1;
          });
        }, 3000);

        // Call edge function to analyze and generate
        const { data, error } = await supabase.functions.invoke("generate-campaign", {
          body: {
            campaignId: id,
            url: campaign.url,
          },
        });

        clearInterval(progressInterval);
        clearInterval(stepInterval);

        if (error) {
          throw error;
        }

        // Update usage only if user is authenticated (not a guest)
        if (campaign.user_id) {
          await supabase.rpc("increment_user_generations", {
            user_id: campaign.user_id,
          });
        }

        setProgress(100);
        setCurrentStep(steps.length - 1);

        // Wait a moment before navigating
        setTimeout(() => {
          navigate(`/campaign/${id}`);
        }, 1500);
      } catch (err: any) {
        console.error("Error analyzing campaign:", err);
        setError(err.message || "Failed to analyze campaign");
        toast.error("Failed to generate campaign. Please try again.");
      }
    };

    analyzeAndGenerate();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (id) {
      await supabase.from("campaigns").delete().eq("id", id);
      
      // Check if it's a guest campaign
      const guestCampaignId = localStorage.getItem("guestCampaignId");
      if (guestCampaignId === id) {
        localStorage.removeItem("guestCampaignId");
        navigate("/");
      } else {
        navigate("/dashboard");
      }
      
      toast.success("Campaign cancelled");
    }
  };

  if (error) {
    const guestCampaignId = localStorage.getItem("guestCampaignId");
    const isGuestError = guestCampaignId === id;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="glass-card p-8 border-destructive/50 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button 
              onClick={() => navigate(isGuestError ? "/" : "/dashboard")} 
              variant="outline"
            >
              {isGuestError ? "Return to Home" : "Return to Dashboard"}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full relative z-10"
      >
        <Card className="glass-card p-12 border-primary/20 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 glow"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold mb-4">
            {progress === 100 ? "All Done!" : "Analyzing Your Website..."}
          </h2>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg text-muted-foreground mb-8"
            >
              {steps[currentStep]}
            </motion.p>
          </AnimatePresence>

          <div className="space-y-4 mb-8">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>

          {progress === 100 ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Redirecting to your campaign...</p>
            </motion.div>
          ) : (
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}

          <div className="mt-8 pt-8 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
              <span>AI is working its magic</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyzingCampaign;