import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";

interface KlaviyoConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

const KlaviyoConnectionDialog = ({
  open,
  onOpenChange,
  onConnected,
}: KlaviyoConnectionDialogProps) => {
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Klaviyo API key");
      return;
    }

    setTesting(true);
    setTestSuccess(false);

    try {
      // Test the API key via edge function (avoids CORS)
      const response = await supabase.functions.invoke("test-klaviyo-connection", {
        body: { api_key: apiKey },
      });

      if (response.error) {
        console.error("Test connection error:", response.error);
        toast.error("Failed to test connection. Please try again.");
        return;
      }

      const data = response.data;
      
      if (data.success) {
        setTestSuccess(true);
        toast.success("Connection successful! Your API key is valid.");
      } else {
        toast.error(data.error || "Invalid API key. Please check and try again.");
      }
    } catch (error) {
      console.error("Connection test error:", error);
      toast.error("Failed to test connection. Please try again.");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your Klaviyo API key");
      return;
    }

    if (!testSuccess) {
      toast.error("Please test your connection first");
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to connect Klaviyo");
        return;
      }

      // Save the API key (in production, this should be encrypted)
      const { error } = await supabase
        .from("klaviyo_connections")
        .upsert({
          user_id: user.id,
          api_key_encrypted: apiKey, // Note: Should be encrypted in production
          is_connected: true,
        }, {
          onConflict: "user_id",
        });

      if (error) {
        console.error("Save error:", error);
        toast.error("Failed to save connection");
        return;
      }

      toast.success("Klaviyo account connected successfully!");
      onConnected();
      onOpenChange(false);
      setApiKey("");
      setTestSuccess(false);
    } catch (error) {
      console.error("Save connection error:", error);
      toast.error("Failed to save connection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Klaviyo Account</DialogTitle>
          <DialogDescription>
            Enter your Klaviyo Private API Key to enable email exports directly to your Klaviyo account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Klaviyo Private API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="pk_xxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestSuccess(false);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Find your API key in Klaviyo → Account → Settings → API Keys
            </p>
          </div>

          <a
            href="https://www.klaviyo.com/account#api-keys-tab"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Get your API key from Klaviyo
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !apiKey.trim()}
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : testSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Connected
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            <Button
              onClick={handleSaveConnection}
              disabled={saving || !testSuccess}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Connect"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KlaviyoConnectionDialog;