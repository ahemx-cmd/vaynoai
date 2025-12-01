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
import JSZip from "jszip";
import { generateESPReadyHTML } from "@/lib/emailUtils";

const SharedCampaignView = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowExport, setAllowExport] = useState(false);

  useEffect(() => {
    const fetchSharedCampaign = async () => {
      if (!shareToken) return;

      try {
        // Fetch share details
        const { data: shareData, error: shareError } = await supabase
          .from("campaign_shares")
          .select("campaign_id, allow_export")
          .eq("share_token", shareToken)
          .single();

        if (shareError || !shareData) {
          toast.error("Invalid or expired share link");
          navigate("/");
          return;
        }

        setAllowExport(shareData.allow_export);

        // Fetch campaign
        const { data: campaignData, error: campaignError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", shareData.campaign_id)
          .single();

        if (campaignError || !campaignData) {
          toast.error("Campaign not found");
          navigate("/");
          return;
        }

        // Fetch emails
        const { data: emailsData, error: emailsError } = await supabase
          .from("email_sequences")
          .select("*")
          .eq("campaign_id", shareData.campaign_id)
          .order("sequence_number", { ascending: true });

        if (emailsError) {
          toast.error("Failed to load emails");
        } else {
          setEmails(emailsData || []);
        }

        setCampaign(campaignData);
      } catch (error) {
        console.error("Error fetching shared campaign:", error);
        toast.error("Failed to load campaign");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedCampaign();
  }, [shareToken, navigate]);

  const handleExportHTML = async () => {
    if (!allowExport) {
      toast.error("Export is not allowed for this shared campaign");
      return;
    }

    if (emails.length === 0) {
      toast.error("No emails to export");
      return;
    }

    try {
      const zip = new JSZip();
      const brandName = campaign?.analyzed_data?.title || campaign?.name || "Brand";
      const campaignSlug = campaign?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'campaign';

      // Generate ESP-ready HTML for each email (always with watermark for shared)
      emails.forEach((email) => {
        const fileName = `${campaignSlug}_email${email.sequence_number}.html`;
        const htmlContent = generateESPReadyHTML(
          email,
          brandName,
          campaign?.cta_link || null,
          campaign?.include_cta ?? true,
          true // Always include watermark for shared campaigns
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

      toast.success("Email sequence exported successfully!");
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex gap-2">
            {allowExport && (
              <Button onClick={handleExportHTML} className="glow">
                <Download className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Shared Badge */}
          <Card className="glass-card p-4 mb-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>This campaign was shared with you (read-only mode)</span>
            </div>
          </Card>

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
              <Badge className="bg-primary/20 text-primary">
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
                campaignId={campaign.id}
                dripDuration={campaign.drip_duration}
                totalEmails={emails.length}
              />
            ))}
          </div>

          {/* Vayno CTA at bottom */}
          <Card className="glass-card p-8 mt-12 text-center border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Create Your Own Email Campaigns</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Generate high-converting email sequences for your products in minutes with AI-powered Vayno
            </p>
            <Button 
              size="lg" 
              className="btn-premium"
              onClick={() => window.location.href = '/'}
            >
              Try Vayno Free
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedCampaignView;