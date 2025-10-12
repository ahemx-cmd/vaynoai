import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import CampaignsList from "@/components/dashboard/CampaignsList";
import UsageCard from "@/components/dashboard/UsageCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
          <div className="px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <MobileSidebar />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Hi, {firstName} ✨
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create and manage your email campaigns
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/create-campaign")} className="btn-premium shadow-md hover-lift">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
                <Avatar className="cursor-pointer hover-lift">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <UsageCard userId={user.id} />
            <CampaignsList userId={user.id} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;