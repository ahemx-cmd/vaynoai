import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface UsageCardProps {
  userId: string;
}

const UsageCard = ({ userId }: UsageCardProps) => {
  const navigate = useNavigate();
  const [usage, setUsage] = useState({
    used: 0,
    limit: 5,
    plan: "free",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      const { data, error } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching usage:", error);
      } else if (data) {
        setUsage({
          used: data.generations_used,
          limit: data.generations_limit,
          plan: data.plan,
        });
      }
      setLoading(false);
    };

    fetchUsage();

    // Set up realtime subscription
    const channel = supabase
      .channel("user_usage_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_usage",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            const newData = payload.new as any;
            setUsage({
              used: newData.generations_used,
              limit: newData.generations_limit,
              plan: newData.plan,
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="animate-pulse h-24" />
      </Card>
    );
  }

  const percentage = (usage.used / usage.limit) * 100;
  const creditsRemaining = usage.limit - usage.used;
  const isLowCredits = creditsRemaining < 10;
  const isOutOfCredits = creditsRemaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card p-6 hover-lift">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">🔋 Credit Balance</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {usage.plan === 'trial' ? 'Free Trial' : `${usage.plan} Plan`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>
              {creditsRemaining} credits remaining
            </span>
            {isLowCredits && !isOutOfCredits && (
              <span className="text-yellow-500 font-medium">
                Running low!
              </span>
            )}
            {isOutOfCredits && (
              <span className="text-destructive font-medium">
                Out of credits
              </span>
            )}
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {usage.used} / {usage.limit} credits used
          </p>
        </div>

        {(isLowCredits || isOutOfCredits) && (
          <Button 
            variant="outline" 
            className="w-full mt-4 hover-lift" 
            size="sm"
            onClick={() => navigate('/billing')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {isOutOfCredits ? 'Get More Credits' : 'Upgrade Plan'}
          </Button>
        )}
      </Card>
    </motion.div>
  );
};

export default UsageCard;