import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface CreditPack {
  id: string;
  name: string;
  price: number;
  credits: number;
  checkoutUrl: string;
  popular?: boolean;
}

const creditPacks: CreditPack[] = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 5,
    credits: 40,
    checkoutUrl: "https://vayno.lemonsqueezy.com/buy/16aeceac-4f0a-47ae-8203-9ae6f99013ac?logo=0",
  },
  {
    id: "growth",
    name: "Growth Pack",
    price: 12,
    credits: 120,
    checkoutUrl: "https://vayno.lemonsqueezy.com/buy/12456995-3424-4096-8c74-65cd8c9c341f?logo=0",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: 25,
    credits: 300,
    checkoutUrl: "https://vayno.lemonsqueezy.com/buy/2c1440a4-7c97-42b7-a0a2-98e33325e540?logo=0",
  },
  {
    id: "agency",
    name: "Agency Pack",
    price: 60,
    credits: 800,
    checkoutUrl: "https://vayno.lemonsqueezy.com/buy/a19b6d64-5966-44a8-9834-b5a0f65cbf5a?logo=0",
  },
];

interface CreditPacksProps {
  userId: string;
}

const CreditPacks = ({ userId }: CreditPacksProps) => {
  const handleBuyNow = (pack: CreditPack) => {
    // Add user_id to checkout URL for webhook identification
    const checkoutUrl = `${pack.checkoutUrl}&checkout[custom][user_id]=${userId}`;
    window.open(checkoutUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Buy Credit Packs</h2>
        <p className="text-muted-foreground">
          One-time credit packs that never expire. 1 credit = 1 generated email.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {creditPacks.map((pack, index) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-6 hover-lift relative h-full flex flex-col">
              {pack.popular && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{pack.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">${pack.price}</span>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <p className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    {pack.credits} credits
                  </p>
                  <p className="text-xs">Credits never expire</p>
                </div>
              </div>

              <Button
                onClick={() => handleBuyNow(pack)}
                variant={pack.popular ? "default" : "outline"}
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>• Credits are deducted when generating email sequences (1 credit per email)</p>
        <p>• One-time packs do not roll over monthly - they're yours to keep</p>
        <p>• Credits are used in addition to your subscription plan's monthly credits</p>
      </div>
    </div>
  );
};

export default CreditPacks;
