import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Wand2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailCardProps {
  email: any;
  index: number;
  campaignId: string;
}

const EmailCard = ({ email, index, campaignId }: EmailCardProps) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(email.content);
  const [improving, setImproving] = useState(false);

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
        return "bg-blue-500/20 text-blue-400";
      case "nurture":
        return "bg-green-500/20 text-green-400";
      case "sales":
        return "bg-purple-500/20 text-purple-400";
      case "re-engagement":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="glass-card overflow-hidden border-primary/20">
        <div
          className="p-6 cursor-pointer hover:bg-muted/50 transition-smooth"
          onClick={() => !isEditing && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline">Email {email.sequence_number}</Badge>
                <Badge className={getTypeColor(email.email_type)}>
                  {email.email_type}
                </Badge>
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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border/50"
          >
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
                  <div className="flex gap-2 pt-4 border-t border-border/50">
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
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default EmailCard;