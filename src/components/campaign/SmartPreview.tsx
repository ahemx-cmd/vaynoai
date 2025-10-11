import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Monitor, Smartphone, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface SmartPreviewProps {
  subject: string;
  content: string;
  htmlContent: string;
}

const SmartPreview = ({ subject, content, htmlContent }: SmartPreviewProps) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Smart Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Preview - See how it appears in the inbox
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Device Toggle */}
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant={device === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={device === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>

          {/* Inbox Preview */}
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-border/50 overflow-hidden"
          >
            {/* Email Client Header */}
            <div className="bg-muted/30 border-b border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-semibold">Y</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Your Brand</div>
                  <div className="text-sm text-muted-foreground">you@brand.com</div>
                </div>
                <div className="text-xs text-muted-foreground">2 min ago</div>
              </div>
            </div>

            {/* Subject Line */}
            <div className="bg-background p-4 border-b border-border/50">
              <h3 className="text-lg font-bold">{subject}</h3>
            </div>

            {/* Email Body */}
            <div
              className={`bg-white text-black transition-all ${
                device === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-3xl mx-auto'
              }`}
            >
              <div
                className="p-6"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </motion.div>

          {/* Preview Tips */}
          <div className="bg-muted/30 rounded-lg p-4 text-sm">
            <p className="font-semibold mb-2">Preview Tips:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• This shows how your email will look in most modern email clients</li>
              <li>• Subject line length: {subject.length} characters (optimal: 40-60)</li>
              <li>• Switch between desktop and mobile to check responsiveness</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartPreview;