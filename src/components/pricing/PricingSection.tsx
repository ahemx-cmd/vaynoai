import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackPlanUpgrade, trackButtonClick } from "@/lib/analytics";

const PricingSection = () => {
  const [isLifetime, setIsLifetime] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  const handleCheckout = (checkoutUrl: string, planName: string, price: number) => {
    trackPlanUpgrade(planName, price);
    
    if (userId) {
      const urlWithUserId = `${checkoutUrl}&checkout[custom][user_id]=${userId}`;
      window.open(urlWithUserId, '_blank');
    } else {
      window.open(checkoutUrl, '_blank');
    }
  };

  const plans = [
    {
      name: "Starter",
      price: isLifetime ? "$59" : "$19",
      period: isLifetime ? "one-time" : "per month",
      description: "For growing businesses",
      features: [
        isLifetime ? "150 credits per month" : "150 credits per month",
        "Remove watermark",
        "Priority AI speed",
        "Email support"
      ],
      cta: "Get Started",
      popular: true,
      showToggle: true,
      checkoutUrl: isLifetime 
        ? "https://vayno.lemonsqueezy.com/checkout/buy/b9b0bdea-ddc5-42b8-8abc-aee080f88fae?logo=0"
        : "https://vayno.lemonsqueezy.com/checkout/buy/b1c6e286-36a9-4b48-bc80-9b03182d3b83?logo=0"
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For power users",
      features: [
        "400 credits per month",
        "Everything in Starter",
        "Auto-Translate",
        "Priority AI & early access"
      ],
      cta: "Go Pro",
      popular: false,
      checkoutUrl: "https://vayno.lemonsqueezy.com/checkout/buy/b8a3207d-80e9-4092-8cfc-5f15c00511b1?logo=0"
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </span>
              </div>
            )}
            <Card className={`p-8 h-full glass-card hover-lift ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">/ {plan.period}</span>}
                </div>
              </div>

              {plan.showToggle && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 mb-6">
                  <span className={!isLifetime ? 'font-medium text-sm' : 'text-muted-foreground text-sm'}>Monthly</span>
                  <Switch checked={isLifetime} onCheckedChange={setIsLifetime} />
                  <span className={isLifetime ? 'font-medium text-sm' : 'text-muted-foreground text-sm'}>Lifetime</span>
                </div>
              )}

              <Button 
                className={`w-full mb-6 ${plan.popular ? 'btn-premium shadow-lg' : ''}`} 
                variant={plan.popular ? "default" : "outline"}
                onClick={() => {
                  const price = plan.name === "Starter" ? (isLifetime ? 59 : 19) : 29;
                  handleCheckout(plan.checkoutUrl, plan.name, price);
                }}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingSection;