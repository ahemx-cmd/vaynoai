import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LifetimeBannerProps {
  userId: string;
}

const LifetimeBanner = ({ userId }: LifetimeBannerProps) => {
  const [isVisible, setIsVisible] = useState(() => {
    const dismissed = localStorage.getItem(`lifetime-banner-dismissed-${userId}`);
    return !dismissed;
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`lifetime-banner-dismissed-${userId}`, 'true');
  };

  const handleCheckout = () => {
    const checkoutUrl = `https://vayno.lemonsqueezy.com/buy/b9b0bdea-ddc5-42b8-8abc-aee080f88fae?logo=0&checkout[custom][user_id]=${userId}`;
    window.open(checkoutUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card p-4 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between gap-4 relative">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-relaxed">
                    <span className="font-semibold">Did you know?</span> Get the Starter Plan without monthly payments! 
                    Pay once at <span className="font-bold text-primary">$79</span> and use forever — no subscriptions, just unlimited access to all Starter features.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  onClick={handleCheckout}
                  size="sm" 
                  className="btn-premium"
                >
                  Get Lifetime Deal
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LifetimeBanner;
