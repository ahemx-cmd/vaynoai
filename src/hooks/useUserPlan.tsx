import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserPlan = () => {
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_usage")
        .select("plan")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setPlan(data.plan);
      }
      
      setLoading(false);
    };

    fetchUserPlan();

    // Listen for changes to user_usage
    const channel = supabase
      .channel("user_usage_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_usage",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object" && "plan" in payload.new) {
            setPlan(payload.new.plan as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isTrial = plan === "trial";
  const isStarter = plan === "starter";
  const isPro = plan === "pro";
  const isLifetime = plan === "lifetime";

  return { plan, isTrial, isStarter, isPro, isLifetime, loading };
};
