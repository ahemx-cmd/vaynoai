import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap, Crown, CreditCard, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import CreditPacks from "./CreditPacks";

interface OutOfCreditsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const OutOfCreditsModal = ({ open, onClose, userId }: OutOfCreditsModalProps) => {
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

  const handleUpgrade = (checkoutUrl: string) => {
    const urlWithUserId = `${checkoutUrl}&checkout[custom][user_id]=${userId}`;
    window.open(urlWithUserId, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add Credits to Continue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Credit Packs Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Buy Credit Packs</h3>
            <CreditPacks userId={userId} />
          </div>

          <Separator />

          {/* Upgrade Plan Section */}
          <div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Or Upgrade Your Plan</h3>
              <p className="text-sm text-muted-foreground">Get monthly credits that refresh automatically</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card p-6 hover-lift h-full flex flex-col">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>

                      <ul className="space-y-2 mb-6 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleUpgrade(plan.checkoutUrl)}
                        className="w-full"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Upgrade to {plan.name}
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutOfCreditsModal;
