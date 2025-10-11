import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { z } from "zod";

const urlSchema = z.string().url("Please enter a valid URL");
const nameSchema = z.string().min(3, "Campaign name must be at least 3 characters");

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("You must be logged in");
      return;
    }

    setLoading(true);

    try {
      // Validate inputs
      urlSchema.parse(url);
      nameSchema.parse(name);

      // Check usage limit
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

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          user_id: userId,
          name,
          url,
          status: "analyzing",
        })
        .select()
        .single();

      if (campaignError) {
        toast.error("Failed to create campaign");
        setLoading(false);
        return;
      }

      // Navigate to analyzing page
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
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
            <p className="text-muted-foreground">
              Enter your product URL and we'll analyze it to generate a complete email sequence
            </p>
          </div>

          <Card className="glass-card p-8 border-primary/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Summer Product Launch"
                  required
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Give your campaign a memorable name
                </p>
              </div>

              <div>
                <Label htmlFor="url">Product Landing Page URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/product"
                  required
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The URL will be analyzed to extract product details and generate emails
                </p>
              </div>

              <Button
                type="submit"
                className="w-full glow"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Campaign...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze & Generate Emails
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="mt-8 glass-card rounded-2xl p-6 border border-primary/20">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>We'll scan your landing page to understand your product and brand</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>AI generates 3-5 professional emails matching your brand voice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Each email is 50-500 words with contextual CTAs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Export as ready-to-upload HTML or improve individual emails</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCampaign;