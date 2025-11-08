import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trackPlanUpgrade } from "@/lib/analytics";

const ChoosePlan = () => {
  const navigate = useNavigate();
  const [isLifetime, setIsLifetime] = useState(true); // Default to lifetime to feature it
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      setLoading(false);
    });
  }, [navigate]);

  const handleCheckout = (checkoutUrl: string, planName: string, price: number) => {
    trackPlanUpgrade(planName, price);
    
    if (userId) {
      const urlWithUserId = `${checkoutUrl}&checkout[custom][user_id]=${userId}`;
      window.open(urlWithUserId, '_blank');
    } else {
      window.open(checkoutUrl, '_blank');
    }
  };

  const handleSkipToFree = () => {
    // Check if there's a pending campaign from guest signup
    const pendingCampaignId = localStorage.getItem("pendingCampaignId");
    if (pendingCampaignId) {
      localStorage.removeItem("pendingCampaignId");
      navigate(`/campaign/${pendingCampaignId}`);
    } else {
      navigate("/dashboard");
    }
  };

  const plans = [
    {
      name: "Starter",
      price: isLifetime ? "$59" : "$19",
      period: isLifetime ? "one-time" : "per month",
      description: "For growing businesses",
      features: [
        "150 credits per month",
        "Remove watermark",
        "Priority AI speed",
        "Email support"
      ],
      popular: !isLifetime,
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
      popular: false,
      checkoutUrl: "https://vayno.lemonsqueezy.com/checkout/buy/b8a3207d-80e9-4092-8cfc-5f15c00511b1?logo=0"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Choose Your Plan to Continue</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI-driven email campaigns
          </p>
        </motion.div>

        {/* Lifetime Deal Banner */}
        {isLifetime && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
              <h3 className="text-2xl font-bold">🎉 Limited Time: Lifetime Deal Available!</h3>
              <Zap className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-center text-muted-foreground">
              Get lifetime access for a one-time payment. No recurring fees. Ever.
            </p>
          </motion.div>
        )}

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <span className={!isLifetime ? 'font-medium' : 'text-muted-foreground'}>Monthly</span>
          <Switch 
            checked={isLifetime} 
            onCheckedChange={setIsLifetime}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent"
          />
          <span className={isLifetime ? 'font-medium flex items-center gap-2' : 'text-muted-foreground'}>
            Lifetime 
            {isLifetime && <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Save 85%</span>}
          </span>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
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
              {isLifetime && plan.name === "Starter" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg animate-pulse">
                    <Zap className="w-3 h-3" />
                    Lifetime Deal
                  </span>
                </div>
              )}
              <Card className={`p-8 h-full glass-card hover-lift ${(plan.popular || (isLifetime && plan.name === "Starter")) ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                  {isLifetime && plan.name === "Starter" && (
                    <p className="text-sm text-primary font-medium mt-2">Pay once, use forever ✨</p>
                  )}
                </div>

                <Button 
                  className={`w-full mb-6 ${(plan.popular || (isLifetime && plan.name === "Starter")) ? 'btn-premium shadow-lg' : ''}`} 
                  variant={(plan.popular || (isLifetime && plan.name === "Starter")) ? "default" : "outline"}
                  onClick={() => {
                    const price = plan.name === "Starter" ? (isLifetime ? 59 : 19) : 29;
                    handleCheckout(plan.checkoutUrl, plan.name, price);
                  }}
                >
                  Get Started
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

        {/* Skip to Free */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <button
            onClick={handleSkipToFree}
            className="text-muted-foreground hover:text-primary transition-colors underline text-sm"
          >
            Let me try it first with the free plan
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ChoosePlan;
