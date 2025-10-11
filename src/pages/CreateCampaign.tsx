import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Link as LinkIcon, FileText, Download, CheckCircle2 } from "lucide-react";
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
      urlSchema.parse(url);
      nameSchema.parse(name);

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
    </div>
  );
};

export default CreateCampaign;