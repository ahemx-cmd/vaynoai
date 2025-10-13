import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Monitor, Smartphone, Mail, Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

interface SmartPreviewProps {
  subject: string;
  content: string;
  htmlContent: string;
}

const SmartPreview = ({ subject, content, htmlContent }: SmartPreviewProps) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
          {/* Device and Theme Toggles */}
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <div className="flex items-center gap-2">
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
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Inbox Preview */}
          <motion.div
            key={`${device}-${theme}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg border overflow-hidden ${
              theme === 'dark' 
                ? 'border-gray-700 bg-gray-900' 
                : 'border-border/50 bg-white'
            }`}
          >
            {/* Email Client Header */}
            <div className={`border-b p-4 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-muted/30 border-border/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-semibold">Y</span>
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-foreground'}`}>
                    Your Brand
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    you@brand.com
                  </div>
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  2 min ago
                </div>
              </div>
            </div>

            {/* Subject Line */}
            <div className={`p-4 border-b ${
              theme === 'dark'
                ? 'bg-gray-850 border-gray-700 text-gray-100'
                : 'bg-background border-border/50'
            }`}>
              <h3 className="text-lg font-bold">{subject}</h3>
            </div>

            {/* Email Body */}
            <div
              className={`transition-all ${
                device === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-3xl mx-auto'
              } ${
                theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-black'
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