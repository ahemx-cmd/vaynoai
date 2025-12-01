import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface OutOfCreditsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const OutOfCreditsModal = ({ open, onClose, userId }: OutOfCreditsModalProps) => {
  const [selectedPack, setSelectedPack] = useState(1); // Growth Pack default
  
  const creditPacks = [
    {
      id: 0,
      price: 5,
      credits: 40,
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/16aeceac-4f0a-47ae-8203-9ae6f99013ac?logo=0"
    },
    {
      id: 1,
      price: 12,
      credits: 120,
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/12456995-3424-4096-8c74-65cd8c9c341f?logo=0",
    },
    {
      id: 2,
      price: 25,
      credits: 300,
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/2c1440a4-7c97-42b7-a0a2-98e33325e540?logo=0"
    },
    {
      id: 3,
      price: 60,
      credits: 800,
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/a19b6d64-5966-44a8-9834-b5a0f65cbf5a?logo=0"
    }
  ];

  const handleBuyCredits = (checkoutUrl: string) => {
    const urlWithUserId = `${checkoutUrl}&checkout[custom][user_id]=${userId}`;
    window.open(urlWithUserId, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-0 bg-background/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 rounded-2xl border border-border">
        <DialogHeader className="text-center space-y-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-2"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
          <DialogTitle className="text-3xl font-bold text-foreground">
            Out of credits
          </DialogTitle>
          <p className="text-muted-foreground">Choose your credit pack</p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Linear credit selector */}
          <div className="relative py-8">
            {/* The line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border" />
            
            {/* Credit stops */}
            <div className="relative flex justify-between items-center">
              {creditPacks.map((pack, index) => (
                <motion.button
                  key={pack.id}
                  onClick={() => setSelectedPack(index)}
                  className="relative flex flex-col items-center gap-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Stop circle */}
                  <motion.div
                    className={`w-6 h-6 rounded-full border-2 transition-colors ${
                      selectedPack === index
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border group-hover:border-primary/50'
                    }`}
                    animate={{
                      scale: selectedPack === index ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Credit amount */}
                  <div className="text-center">
                    <div className={`text-sm font-semibold transition-colors ${
                      selectedPack === index ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {pack.credits}
                    </div>
                    <div className="text-xs text-muted-foreground">credits</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Selected pack details and button */}
          <motion.div
            key={selectedPack}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold text-foreground">
                  {creditPacks[selectedPack].credits} credits
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                One-time purchase, never expires
              </p>
            </div>

            <Button
              onClick={() => handleBuyCredits(creditPacks[selectedPack].checkoutUrl)}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              ${creditPacks[selectedPack].price} • Buy
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutOfCreditsModal;
