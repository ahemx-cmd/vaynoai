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

const CampaignView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;

      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (campaignError || !campaignData) {
        toast.error("Campaign not found");
        navigate("/dashboard");
        return;
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

  const handleExportHTML = () => {
    if (emails.length === 0) {
      toast.error("No emails to export");
      return;
    }

    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${campaign?.name || 'Email Campaign'}</title>
</head>
<body>
`;

    emails.forEach((email) => {
      htmlContent += `
<!-- ${email.email_type.toUpperCase()} EMAIL (${email.sequence_number}) -->
${email.html_content}

`;
    });

    htmlContent += `</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${campaign?.name || 'campaign'}-emails.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("HTML exported successfully!");
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={handleExportHTML} className="glow">
            <Download className="w-4 h-4 mr-2" />
            Export HTML
          </Button>
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
              <EmailCard key={email.id} email={email} index={i} campaignId={id!} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CampaignView;