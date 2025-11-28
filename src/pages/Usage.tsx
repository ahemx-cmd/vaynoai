import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, TrendingUp, Calendar, Crown, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import { useUserPlan } from "@/hooks/useUserPlan";

const Usage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<any>(null);
  const { plan, isTrial, isStarter, isPro, isLifetime } = useUserPlan();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch usage data
      const { data: usageData } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      setUsage(usageData);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const getLimits = () => {
    if (isPro) return { generations: 500, name: "Pro" };
    if (isStarter) return { generations: 150, name: "Starter" };
    if (isLifetime) return { generations: 150, name: "Lifetime" };
    return { generations: 20, name: "Free Trial" };
  };

  const limits = getLimits();
  const generationsUsed = usage?.generations_used || 0;
  const generationsRemaining = Math.max(0, limits.generations - generationsUsed);
  const usagePercentage = (generationsUsed / limits.generations) * 100;

  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1);
  resetDate.setDate(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 border-b border-border/40 glass-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <MobileSidebar />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Usage & Limits</h1>
                <p className="text-sm text-muted-foreground">Monitor your AI generation usage and plan limits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Current Usage Overview */}
            <Card className="glass-card p-6 border-primary/20">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">Current Usage</h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {limits.name} Plan
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track your AI email generation usage for this billing period
                  </p>
                </div>
                {generationsRemaining <= 5 && generationsRemaining > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Low Credits
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email Generations</p>
                    <p className="text-3xl font-bold">
                      {generationsUsed}
                      <span className="text-lg text-muted-foreground font-normal"> / {limits.generations}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-primary">{generationsRemaining}</p>
                  </div>
                </div>

                <Progress value={usagePercentage} className="h-3" />

                <p className="text-xs text-muted-foreground">
                  {usagePercentage.toFixed(1)}% of your monthly limit used
                </p>
              </div>

              {generationsRemaining === 0 && (
                <div className="mt-6 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-destructive mb-1">Generation Limit Reached</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        You've used all your email generations for this month. Upgrade your plan to continue generating campaigns.
                      </p>
                      <Button size="sm" onClick={() => navigate("/billing")}>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Usage Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card p-6 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Plan Allowance</h3>
                    <p className="text-sm text-muted-foreground">Monthly generations</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Limit</span>
                    <span className="font-medium">{limits.generations} generations</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Used This Month</span>
                    <span className="font-medium">{generationsUsed} generations</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="font-medium text-primary">{generationsRemaining} generations</span>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Billing Period</h3>
                    <p className="text-sm text-muted-foreground">Usage resets monthly</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Period</span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Resets On</span>
                    <span className="font-medium">
                      {resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Days Until Reset</span>
                    <span className="font-medium text-primary">
                      {Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Usage History */}
            <Card className="glass-card p-6 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Usage Insights</h2>
                  <p className="text-sm text-muted-foreground">Your generation activity over time</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Average Daily Usage</span>
                    <span className="text-lg font-bold">
                      {(generationsUsed / new Date().getDate()).toFixed(1)} generations
                    </span>
                  </div>
                  <Progress 
                    value={(generationsUsed / new Date().getDate() / limits.generations) * 100} 
                    className="h-2" 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Projected Monthly Usage</span>
                    <span className="text-lg font-bold">
                      {Math.round((generationsUsed / new Date().getDate()) * 30)} generations
                    </span>
                  </div>
                  <Progress 
                    value={((generationsUsed / new Date().getDate()) * 30 / limits.generations) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>

              {((generationsUsed / new Date().getDate()) * 30) > limits.generations && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">
                    📊 Based on your current usage pattern, you might exceed your monthly limit. Consider upgrading to a higher plan for uninterrupted access.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => navigate("/billing")}>
                    View Plans
                  </Button>
                </div>
              )}
            </Card>

            {/* Upgrade Prompt */}
            {!isPro && (
              <Card className="glass-card p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Need More Credits?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade to {isTrial ? "Starter (150 credits/month) or Pro (500 credits/month)" : "Pro (500 credits/month)"} for more credits, advanced features, and priority support.
                    </p>
                    <Button onClick={() => navigate("/billing")}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
