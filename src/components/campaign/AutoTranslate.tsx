import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Lock, Crown } from "lucide-react";
import { toast } from "sonner";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/integrations/supabase/client";

interface AutoTranslateProps {
  campaignId: string;
}

const languages = [
  // European Languages
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  
  // Asian Languages
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino (Tagalog)', flag: '🇵🇭' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  
  // Middle Eastern & African Languages
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian (Farsi)', flag: '🇮🇷' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  
  // Americas Languages
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'es-AR', name: 'Spanish (Argentina)', flag: '🇦🇷' },
  
  // Additional European Languages
  { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸' },
  { code: 'gl', name: 'Galician', flag: '🇪🇸' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
];

const AutoTranslate = ({ campaignId }: AutoTranslateProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [translating, setTranslating] = useState(false);
  const { isPro } = useUserPlan();

  const handleTranslate = async () => {
    if (!isPro) {
      toast.error(
        "Auto-Translate is a Pro feature! Upgrade to Pro to localize your campaigns instantly.",
        { duration: 4000 }
      );
      return;
    }

    if (!selectedLanguage) {
      toast.error("Please select a language");
      return;
    }

    setTranslating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("translate-campaign", {
        body: {
          campaignId,
          targetLanguage: languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage,
        },
      });

      if (error) throw error;

      toast.success(`Campaign translated to ${languages.find(l => l.code === selectedLanguage)?.name}! All emails have been updated.`);
      
      // Refresh the page to show translated content
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Translation error:", error);
      toast.error("Failed to translate campaign. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Globe className="w-4 h-4 mr-2" />
          Auto-Translate
          {!isPro && (
            <Lock className="w-3 h-3 ml-1 text-muted-foreground" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Auto-Translate Campaign
            {!isPro && <Crown className="w-5 h-5 text-amber-500" />}
          </DialogTitle>
        </DialogHeader>

        {!isPro ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6 text-center">
              <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Auto-Translate helps you localize your campaigns instantly to reach global audiences.
                Upgrade to Pro to unlock this feature!
              </p>
              <Button 
                className="btn-premium" 
                onClick={() => window.open('https://vayno.lemonsqueezy.com/buy/b8a3207d-80e9-4092-8cfc-5f15c00511b1?logo=0', '_blank')}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Target Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a language..." />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                The AI will translate all emails in your campaign while preserving formatting, 
                tone, and brand voice. CTAs and links remain unchanged.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleTranslate}
              disabled={translating || !selectedLanguage}
            >
              {translating ? "Translating Campaign..." : "Translate Entire Campaign"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AutoTranslate;