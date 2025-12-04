import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Workflow, CheckCircle } from "lucide-react";

interface ExportToKlaviyoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignName: string;
  emailCount: number;
}

const ExportToKlaviyoDialog = ({
  open,
  onOpenChange,
  campaignId,
  campaignName,
  emailCount,
}: ExportToKlaviyoDialogProps) => {
  const [exportType, setExportType] = useState<"draft" | "flow">("draft");
  const [enablePersonalization, setEnablePersonalization] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setExportSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to export");
        return;
      }

      const response = await supabase.functions.invoke("export-to-klaviyo", {
        body: {
          campaign_id: campaignId,
          export_type: exportType,
          flow_name: exportType === "flow" ? `${campaignName} Sequence` : undefined,
          enable_personalization: enablePersonalization,
        },
      });

      if (response.error) {
        console.error("Export error:", response.error);
        toast.error(response.error.message || "Failed to export to Klaviyo");
        return;
      }

      const data = response.data;
      
      if (data.success) {
        setExportSuccess(true);
        toast.success(data.message || "Sequence successfully exported to Klaviyo!");
      } else {
        toast.error(data.error || "Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export to Klaviyo");
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after closing
    setTimeout(() => {
      setExportSuccess(false);
      setExportType("draft");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export to Klaviyo</DialogTitle>
          <DialogDescription>
            Export your {emailCount}-email sequence to Klaviyo
          </DialogDescription>
        </DialogHeader>

        {exportSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Export Successful!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your {emailCount} emails have been exported to Klaviyo as templates. 
              Open your Klaviyo account to find them in the Templates section.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Export Type Selection */}
            <div className="space-y-3">
              <Label>Export Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportType("draft")}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    exportType === "draft"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <FileText className={`w-6 h-6 mb-2 ${exportType === "draft" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">Drafts</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Export as templates for review
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportType("flow")}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    exportType === "flow"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <Workflow className={`w-6 h-6 mb-2 ${exportType === "flow" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">Flow Ready</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Export as templates for flows
                  </p>
                </button>
              </div>
            </div>

            {/* Personalization Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="personalization">Enable Personalization Tags</Label>
                <p className="text-xs text-muted-foreground">
                  Map {"{{first_name}}"}, {"{{company_name}}"} to Klaviyo tags
                </p>
              </div>
              <Switch
                id="personalization"
                checked={enablePersonalization}
                onCheckedChange={setEnablePersonalization}
              />
            </div>

            {/* Export Summary */}
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-1">Export Summary</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• {emailCount} emails will be exported</li>
                <li>• Type: {exportType === "draft" ? "Draft templates" : "Flow-ready templates"}</li>
                <li>• Personalization: {enablePersonalization ? "Enabled" : "Disabled"}</li>
              </ul>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting to Klaviyo...
                </>
              ) : (
                `Export ${emailCount} Emails to Klaviyo`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportToKlaviyoDialog;