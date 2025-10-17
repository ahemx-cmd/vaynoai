import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, MessageCircle, Mail } from "lucide-react";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

const Updates = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const updates: any[] = [];


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
                <h1 className="text-2xl font-bold tracking-tight">What's New</h1>
                <p className="text-sm text-muted-foreground">Latest features, improvements, and updates</p>
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
            {/* No Updates Yet Card */}
            <Card className="glass-card p-8 border-primary/20 text-center">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No New Updates Yet</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We're constantly working on making Vayno better for you. Check back soon for exciting new features and improvements!
                </p>
                
                <div className="w-full p-6 rounded-lg bg-muted/30 text-left">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Have a suggestion or feedback?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    We'd love to hear from you! Your feedback helps us build better features.
                  </p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <a 
                      href="mailto:teamvayno@gmail.com" 
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      teamvayno@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Updates;
