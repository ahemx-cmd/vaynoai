import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Check, X, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserPlan } from "@/hooks/useUserPlan";
import VaynoWatermark from "./VaynoWatermark";
import SmartPreview from "./SmartPreview";
import { calculateSendDay } from "@/lib/emailUtils";

interface EmailCardProps {
  email: any;
  index: number;
  campaignId: string;
  dripDuration?: string;
  totalEmails: number;
}

const EmailCard = ({ email, index, campaignId, dripDuration, totalEmails }: EmailCardProps) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(email.content);
  const [improving, setImproving] = useState(false);
  const { isTrial } = useUserPlan();

  const handleSave = async () => {
    const { error } = await supabase
      .from("email_sequences")
      .update({ content })
      .eq("id", email.id);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Changes saved!");
      setIsEditing(false);
    }
  };

  const handleImprove = async () => {
    setImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("improve-email", {
        body: {
          emailId: email.id,
          currentContent: content,
        },
      });

      if (error) throw error;

      if (data?.improvedContent) {
        setContent(data.improvedContent);
        toast.success("Email improved!");
      }
    } catch (err) {
      toast.error("Failed to improve email");
    } finally {
      setImproving(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "welcome":
        return "bg-primary/20 text-primary";
      case "nurture":
      case "value":
        return "bg-secondary/20 text-secondary";
      case "sales":
      case "conversion":
        return "bg-accent/20 text-accent-foreground";
      case "re-engagement":
        return "bg-muted/30 text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const sendDay = dripDuration 
    ? calculateSendDay(dripDuration, email.sequence_number, totalEmails)
    : null;

  return (
    <Card className="glass-card overflow-hidden border-primary/20">
      <div
        className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge variant="outline">Email {email.sequence_number}</Badge>
              <Badge className={getTypeColor(email.email_type)}>
                {email.email_type}
              </Badge>
              {sendDay && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Day {sendDay}
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-1">{email.subject}</h3>
            <p className="text-sm text-muted-foreground">
              ~{email.content.split(" ").length} words
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border/50">
          <div className="p-6 space-y-4">
            {isEditing ? (
              <>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setContent(email.content);
                      setIsEditing(false);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {content}
                  </pre>
                </div>
                {isTrial && <VaynoWatermark />}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                  <SmartPreview 
                    subject={email.subject}
                    content={content}
                    htmlContent={email.html_content}
                  />
                  <Button
                    onClick={handleImprove}
                    variant="outline"
                    size="sm"
                    disabled={improving}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {improving ? "Improving..." : "One-Click Improve"}
                  </Button>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    Edit Manually
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EmailCard;
