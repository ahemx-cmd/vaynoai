import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Sparkles, ExternalLink } from "lucide-react";
import EmailCard from "@/components/campaign/EmailCard";
import { useUserPlan } from "@/hooks/useUserPlan";
import URLSummary from "@/components/campaign/URLSummary";
import AutoTranslate from "@/components/campaign/AutoTranslate";
import JSZip from "jszip";
import { generateESPReadyHTML } from "@/lib/emailUtils";

const CampaignView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const { isFree } = useUserPlan();

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (campaignError || !campaignData) {
        toast.error("Campaign not found");
        
        // Check if user is authenticated to decide where to redirect
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
        return;
      }

      // Check if this is a guest campaign (no user_id)
      if (!campaignData.user_id) {
        setIsGuest(true);
      }

      const { data: emailsData, error: emailsError } = await supabase
        .from("email_sequences")
        .select("*")
        .eq("campaign_id", id)
        .order("sequence_number", { ascending: true });

      if (emailsError) {
        toast.error("Failed to load emails");
      } else {
        setEmails(emailsData || []);
      }

      setCampaign(campaignData);
      setLoading(false);
    };

    fetchCampaign();
  }, [id, navigate]);

  const handleExportHTML = async () => {
    if (emails.length === 0) {
      toast.error("No emails to export");
      return;
    }

    try {
      const zip = new JSZip();
      const brandName = campaign?.analyzed_data?.title || campaign?.name || "Brand";
      const campaignSlug = campaign?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'campaign';

      // Generate ESP-ready HTML for each email
      emails.forEach((email) => {
        const fileName = `${campaignSlug}_email${email.sequence_number}.html`;
        const htmlContent = generateESPReadyHTML(
          email,
          brandName,
          campaign?.cta_link || null,
          campaign?.include_cta ?? true,
          isFree
        );
        
        zip.file(fileName, htmlContent);
      });

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Download ZIP
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${campaignSlug}_email_sequence.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Email sequence exported successfully! Ready for ESP upload.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export emails");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Guest Blur Overlay */}
      {isGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg w-full mx-4"
          >
            <Card className="glass-card p-8 border-primary/30 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Campaign Generated!</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Your email sequence is ready. Sign in to view, edit, and export your campaign.
              </p>
              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="w-full btn-premium shadow-lg hover-lift"
                >
                  Sign In to Unlock
                </Button>
                <p className="text-sm text-muted-foreground">
                  This generation will count toward your free plan (2 remaining after sign-up)
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {!isGuest && (
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          {isGuest && (
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}
          <div className="flex gap-2">
            {campaign.analyzed_data && (
              <URLSummary analyzedData={campaign.analyzed_data} url={campaign.url} />
            )}
            <AutoTranslate campaignId={id!} />
            <Button onClick={handleExportHTML} className="glow">
              <Download className="w-4 h-4 mr-2" />
              Export HTML
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card p-8 mb-8 border-primary/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
                <a
                  href={campaign.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth flex items-center gap-2"
                >
                  {campaign.url}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                {campaign.status}
              </Badge>
            </div>

            {campaign.analyzed_data && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Extracted Product Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {campaign.analyzed_data.title && (
                    <div>
                      <span className="text-muted-foreground">Title:</span>
                      <p className="font-medium">{campaign.analyzed_data.title}</p>
                    </div>
                  )}
                  {campaign.analyzed_data.description && (
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Description:</span>
                      <p className="font-medium">{campaign.analyzed_data.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Email Sequence ({emails.length} emails)</h2>
              <Badge variant="outline">{emails.length * 250} avg words</Badge>
            </div>

            {emails.map((email, i) => (
              <EmailCard 
                key={email.id} 
                email={email} 
                index={i} 
                campaignId={id!}
                dripDuration={campaign.drip_duration}
                totalEmails={emails.length}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CampaignView;
