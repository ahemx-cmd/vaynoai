import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Sparkles, Crown, X, Gem } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import CampaignsList from "@/components/dashboard/CampaignsList";
import { useUserPlan } from "@/hooks/useUserPlan";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLifetimeBanner, setShowLifetimeBanner] = useState(true);
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const { isTrial } = useUserPlan();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
        navigate("/auth");
      } else {
        fetchCredits(session.user.id);
      }
    }
  );

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    if (!session) {
      navigate("/auth");
    } else {
      fetchCredits(session.user.id);
    }
    setLoading(false);
  });

    // Set up realtime subscription for credit updates
    const channel = supabase
      .channel("credits_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_usage",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            const newData = payload.new as any;
            if (user && newData.user_id === user.id) {
              setCreditsRemaining(newData.generations_limit - newData.generations_used);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      channel.unsubscribe();
    };
  }, [navigate, user]);

  const fetchCredits = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_usage")
      .select("generations_used, generations_limit")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setCreditsRemaining(data.generations_limit - data.generations_used);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const userInitials = user.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || user.email?.[0].toUpperCase() || "U";

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex">
      <DashboardSidebar />
      
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MobileSidebar />
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight truncate">
                    Hi, {firstName} ✨
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                    Create and manage your email campaigns
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="font-semibold text-sm sm:text-base">{creditsRemaining}</span>
                </div>
                <Button 
                  onClick={() => navigate("/create-campaign")} 
                  className="btn-premium shadow-md hover-lift"
                  size="sm"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">New Campaign</span>
                </Button>
                <Avatar 
                  className="cursor-pointer hover-lift h-9 w-9 sm:h-10 sm:w-10"
                  onClick={() => navigate("/profile")}
                >
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            {showLifetimeBanner && isTrial && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 rounded-xl p-4 sm:p-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 animate-pulse" />
                <button
                  onClick={() => setShowLifetimeBanner(false)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="relative flex flex-col sm:flex-row items-center gap-4 pr-8">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base sm:text-xl font-bold mb-1 flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      <span>Limited Time: Lifetime Deal Available!</span>
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Get access to the Starter plan features forever. Pay once, use forever – no monthly fees!
                    </p>
                  </div>
                  <Button 
                    className="flex-shrink-0 w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover-lift text-sm sm:text-base"
                    size="sm"
                    onClick={() => window.open('https://vaynoai.lemonsqueezy.com/buy/c58b5d67-6c25-490c-846f-3e7963b5b804', '_blank')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Get Lifetime Deal ($59)</span>
                    <span className="sm:hidden">Get Deal ($59)</span>
                  </Button>
                </div>
              </motion.div>
            )}
            <CampaignsList userId={user.id} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;