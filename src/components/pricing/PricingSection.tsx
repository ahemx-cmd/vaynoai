import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const PricingSection = () => {
  const [isLifetime, setIsLifetime] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out Vayno",
      features: [
        "5 generations per month",
        "3-5 email sequences",
        "HTML export",
        "Basic support"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Starter",
      price: isLifetime ? "$79" : "$9",
      period: isLifetime ? "one-time" : "per month",
      description: "For growing businesses",
      features: [
        "50 generations per month",
        "3-5 email sequences",
        "HTML export",
        "One-click improvements",
        "Priority support"
      ],
      cta: "Get Started",
      popular: true,
      showToggle: true
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For power users",
      features: [
        "500 generations per month",
        "Everything in Starter",
        "Early access to features",
        "Batch campaign creation",
        "Premium support",
        "Custom integrations"
      ],
      cta: "Go Pro",
      popular: false
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

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/ {plan.period}</span>
                </div>
              </div>

              {plan.showToggle && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 mb-6">
                  <span className={!isLifetime ? 'font-medium text-sm' : 'text-muted-foreground text-sm'}>Monthly</span>
                  <Switch checked={isLifetime} onCheckedChange={setIsLifetime} />
                  <span className={isLifetime ? 'font-medium text-sm' : 'text-muted-foreground text-sm'}>Lifetime</span>
                </div>
              )}

              <Button className={`w-full mb-6 ${plan.popular ? 'btn-premium shadow-lg' : ''}`} variant={plan.popular ? "default" : "outline"}>
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