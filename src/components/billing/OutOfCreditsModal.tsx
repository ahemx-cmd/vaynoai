import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Crown, CreditCard, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
      name: "Starter Pack",
      price: 5,
      credits: 40,
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/16aeceac-4f0a-47ae-8203-9ae6f99013ac?logo=0"
    },
    {
      id: 1,
      name: "Growth Pack",
      price: 12,
      credits: 120,
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/12456995-3424-4096-8c74-65cd8c9c341f?logo=0",
      popular: true
    },
    {
      id: 2,
      name: "Pro Pack",
      price: 25,
      credits: 300,
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/2c1440a4-7c97-42b7-a0a2-98e33325e540?logo=0"
    },
    {
      id: 3,
      name: "Agency Pack",
      price: 60,
      credits: 800,
      checkoutUrl: "https://vayno.lemonsqueezy.com/buy/a19b6d64-5966-44a8-9834-b5a0f65cbf5a?logo=0"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: 19,
      icon: CreditCard,
      color: "from-primary to-accent",
      checkoutUrl: "https://vaynoai.lemonsqueezy.com/buy/3eab4f94-d13a-47e3-b2c7-63a7ed0aff11",
      features: ["150 credits per month", "Remove watermark", "Priority AI speed"]
    },
    {
      name: "Pro",
      price: 29,
      icon: Crown,
      color: "from-accent to-primary",
      checkoutUrl: "https://vaynoai.lemonsqueezy.com/buy/e47ec95f-aa1e-43fc-a57f-bb91fc20139e",
      features: ["400 credits per month", "Everything in Starter", "Auto-Translate"]
    }
  ];

  const handleBuyCredits = (checkoutUrl: string) => {
    const urlWithUserId = `${checkoutUrl}&checkout[custom][user_id]=${userId}`;
    window.open(urlWithUserId, '_blank');
  };

  const handleUpgrade = (checkoutUrl: string) => {
    const urlWithUserId = `${checkoutUrl}&checkout[custom][user_id]=${userId}`;
    window.open(urlWithUserId, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden border-0 bg-background/95 backdrop-blur-xl shadow-2xl p-0">
        <div className="relative overflow-hidden">
          {/* Floating animation background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
          
          <div className="relative p-8">
            <DialogHeader className="text-center space-y-3 mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-2"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                You're out of credits
              </DialogTitle>
              <p className="text-muted-foreground text-lg">Choose how you'd like to continue</p>
            </DialogHeader>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Buy Credits Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-card p-6 h-full hover-lift border-border/50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Buy Credits</h3>
                        <p className="text-sm text-muted-foreground">Top-up to keep generating campaigns</p>
                      </div>
                    </div>

                    {/* Horizontal Carousel for Credit Packs */}
                    <div className="relative px-12">
                      <Carousel className="w-full" opts={{ align: "center", loop: true }}>
                        <CarouselContent className="-ml-2">
                          {creditPacks.map((pack, index) => (
                            <CarouselItem key={pack.id} className="pl-2 basis-full">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedPack(index)}
                                className={`cursor-pointer transition-all duration-300 ${
                                  selectedPack === index ? 'opacity-100' : 'opacity-40 blur-[2px]'
                                }`}
                              >
                                <Card className={`glass-card p-6 transition-all duration-300 ${
                                  selectedPack === index 
                                    ? 'border-primary/50 shadow-lg shadow-primary/20' 
                                    : 'border-border/30'
                                }`}>
                                  {pack.popular && (
                                    <div className="mb-3">
                                      <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold">
                                        Most Popular
                                      </span>
                                    </div>
                                  )}
                                  <div className="text-center space-y-2">
                                    <h4 className="font-bold text-lg">{pack.name}</h4>
                                    <div>
                                      <span className="text-4xl font-bold">${pack.price}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                      <Zap className="w-4 h-4 text-primary" />
                                      <span className="text-lg font-semibold">{pack.credits} credits</span>
                                    </div>
                                  </div>
                                </Card>
                              </motion.div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="glass-card border-border/50" />
                        <CarouselNext className="glass-card border-border/50" />
                      </Carousel>
                    </div>

                    <Button
                      onClick={() => handleBuyCredits(creditPacks[selectedPack].checkoutUrl)}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white shadow-lg"
                      size="lg"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Buy {creditPacks[selectedPack].name}
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Upgrade Plan Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-card p-6 h-full hover-lift border-border/50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Upgrade Plan</h3>
                        <p className="text-sm text-muted-foreground">Unlock monthly credits + advanced features</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        return (
                          <motion.div
                            key={plan.name}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card className="glass-card p-4 hover:border-primary/50 transition-all duration-300 cursor-pointer border-border/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold">{plan.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      ${plan.price}/month
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">{plan.features[0]}</p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => handleUpgrade(plans[0].checkoutUrl)}
                      variant="outline"
                      className="w-full glass-card border-border/50 hover:border-primary/50"
                      size="lg"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Plans
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-sm text-muted-foreground"
            >
              Not sure what to choose? Start with a small top-up.
            </motion.p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutOfCreditsModal;
