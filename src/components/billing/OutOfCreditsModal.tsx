import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, CreditCard, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface OutOfCreditsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const OutOfCreditsModal = ({ open, onClose, userId }: OutOfCreditsModalProps) => {
  const [view, setView] = useState<'choice' | 'topup' | 'plans'>('choice');
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

  const handleUpgrade = () => {
    setView('plans');
  };

  const handleBack = () => {
    setView('choice');
  };

  const plans = [
    {
      name: "Starter",
      price: 11,
      credits: 150,
      description: "Perfect for getting started",
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/b1c6e286-36a9-4b48-bc80-9b03182d3b83?logo=0",
      features: ["150 credits/month", "All sequence types", "Email export", "Priority support"]
    },
    {
      name: "Pro",
      price: 29,
      credits: 500,
      description: "For growing businesses",
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/b8a3207d-80e9-4092-8cfc-5f15c00511b1?logo=0",
      features: ["500 credits/month", "All sequence types", "Email export", "Priority support", "Advanced analytics"]
    },
    {
      name: "Lifetime",
      price: 59,
      credits: 120,
      description: "One-time payment, forever access",
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/b9b0bdea-ddc5-42b8-8abc-aee080f88fae?logo=0",
      features: ["120 credits/month", "All sequence types", "Email export", "Priority support", "Lifetime updates"],
      isLifetime: true
    }
  ];

  const handlePlanCheckout = (checkoutUrl: string) => {
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
          <p className="text-muted-foreground">
            {view === 'choice' ? 'Choose how to continue' : view === 'topup' ? 'Choose your credit pack' : 'Choose your plan'}
          </p>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {view === 'choice' ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-2 gap-6"
            >
              {/* Top Up Option */}
              <button
                onClick={() => setView('topup')}
                className="group relative p-8 rounded-xl border-2 border-border bg-background/50 hover:border-primary/50 transition-colors text-left"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Top Up</h3>
                    <p className="text-sm text-muted-foreground">
                      Buy credits as you need them. One-time purchase, never expires.
                    </p>
                  </div>
                </div>
              </button>

              {/* Upgrade Option */}
              <button
                onClick={handleUpgrade}
                className="group relative p-8 rounded-xl border-2 border-border bg-background/50 hover:border-primary/50 transition-colors text-left"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Upgrade Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Get monthly credits and unlock premium features with a subscription.
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ) : view === 'topup' ? (
            <motion.div
              key="topup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
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

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-14 px-8 text-lg font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => handleBuyCredits(creditPacks[selectedPack].checkoutUrl)}
                    className="h-14 px-8 text-lg font-semibold"
                  >
                    ${creditPacks[selectedPack].price} • Buy
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Pricing plans grid */}
              <div className="grid grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className="relative p-6 rounded-xl border-2 border-border bg-background/50 flex flex-col"
                  >
                    <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-foreground">
                            ${plan.price}
                          </span>
                          <span className="text-muted-foreground">
                            {plan.isLifetime ? 'one-time' : '/month'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.credits} credits/month
                        </p>
                      </div>

                      <div className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-1 h-1 rounded-full bg-foreground mt-2" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePlanCheckout(plan.checkoutUrl)}
                      className="w-full mt-6"
                    >
                      Get {plan.name}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="px-8"
                >
                  Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default OutOfCreditsModal;
