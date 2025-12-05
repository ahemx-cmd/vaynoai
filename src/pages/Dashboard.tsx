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
    let currentUserId: string | null = null;
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      currentUserId = session?.user?.id ?? null;
      
      if (!session) {
        navigate("/auth", { replace: true });
      } else {
        fetchCredits(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only update state if the user actually changed
        if (session?.user?.id !== currentUserId) {
          setSession(session);
          setUser(session?.user ?? null);
          currentUserId = session?.user?.id ?? null;
          
          if (!session) {
            navigate("/auth", { replace: true });
          } else {
            fetchCredits(session.user.id);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Separate effect for realtime credits - only set up when we have a user
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`credits_updates_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_usage",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            const newData = payload.new as any;
            setCreditsRemaining(newData.generations_limit - newData.generations_used);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MobileSidebar />
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight truncate">
                    {firstName}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                    Your campaigns
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
                  className="btn-premium"
                  size="sm"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">New</span>
                </Button>
                <Avatar 
                  className="cursor-pointer transition-opacity hover:opacity-80 h-9 w-9 sm:h-10 sm:w-10"
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
          >
            <CampaignsList userId={user.id} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;