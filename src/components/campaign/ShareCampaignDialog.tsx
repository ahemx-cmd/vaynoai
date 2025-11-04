import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareCampaignDialogProps {
  campaignId: string;
}

const ShareCampaignDialog = ({ campaignId }: ShareCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [allowExport, setAllowExport] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateShareLink = async () => {
    setLoading(true);
    try {
      // Generate a unique share token
      const shareToken = crypto.randomUUID();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create share record
      const { error } = await supabase
        .from('campaign_shares')
        .insert({
          campaign_id: campaignId,
          share_token: shareToken,
          allow_export: allowExport,
          created_by: user?.id
        });

      if (error) throw error;

      // Generate share URL
      const url = `${window.location.origin}/shared/${shareToken}`;
      setShareUrl(url);
      toast.success("Share link generated!");
    } catch (error) {
      console.error("Error generating share link:", error);
      toast.error("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setShareUrl(null);
      setAllowExport(false);
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Campaign</DialogTitle>
          <DialogDescription>
            Share this campaign with your team, friends, or family. They'll be able to view all emails in read-only mode.
          </DialogDescription>
        </DialogHeader>
        
        {!shareUrl ? (
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="allow-export" 
                checked={allowExport}
                onCheckedChange={(checked) => setAllowExport(checked as boolean)}
              />
              <div className="space-y-1">
                <label
                  htmlFor="allow-export"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Allow recipients to export emails
                </label>
                <p className="text-sm text-muted-foreground">
                  Recipients will be able to download the email HTML files to their device
                </p>
              </div>
            </div>
            
            <Button 
              onClick={generateShareLink} 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Share Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  />
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {allowExport 
                ? "✅ Recipients can export emails" 
                : "❌ Recipients cannot export emails"}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareCampaignDialog;