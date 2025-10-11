import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const PricingSection = () => {
  const [isLifetime, setIsLifetime] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "5 generations per month",
        "Email sequences (3-5 emails)",
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
      features: [
        "50 generations per month",
        "Email sequences (3-5 emails)",
        "HTML export",
        "One-click improvements",
        "Priority support"
      ],
      cta: "Get Started",
      popular: !isLifetime,
      showToggle: true
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      features: [
        "500 generations per month",
        "Everything in Starter",
        "Early access to features",
        "Batch campaign creation",
        "Premium support",
        "Custom integrations"
      ],
      cta: "Go Pro",
      popular: isLifetime
    }
  ];

  return (
    <div className="container mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground text-lg">Choose the plan that fits your needs</p>
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
                <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            <Card className={`p-8 h-full glass-card transition-smooth hover:scale-105 ${plan.popular ? 'border-primary/50 glow' : ''}`}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                  <span className="text-muted-foreground">/ {plan.period}</span>
                </div>
              </div>

              {plan.showToggle && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-6">
                  <span className={!isLifetime ? 'font-medium' : 'text-muted-foreground'}>Monthly</span>
                  <Switch checked={isLifetime} onCheckedChange={setIsLifetime} />
                  <span className={isLifetime ? 'font-medium' : 'text-muted-foreground'}>Lifetime</span>
                </div>
              )}

              <Button className="w-full mb-6 glow" variant={plan.popular ? "default" : "outline"}>
                {plan.cta}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingSection;