import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Rocket, Zap, Bug, Info } from "lucide-react";
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

  const updates = [
    {
      version: "2.5.0",
      date: "October 11, 2025",
      type: "major",
      icon: Rocket,
      color: "from-primary to-accent",
      changes: [
        {
          type: "feature",
          title: "Sequence Type Selection",
          description: "Choose from 14 pre-optimized email sequence types including Welcome Series, Product Launch, Sales/Promotion, Abandoned Cart, Re-engagement, and more. Each type is tailored for specific marketing goals."
        },
        {
          type: "feature",
          title: "Drip Duration Control",
          description: "Select your email sequence pacing with 7-Day, 14-Day, or 30-Day drip options. The AI automatically spaces emails optimally for maximum engagement."
        },
        {
          type: "feature",
          title: "Smart Watermarking System",
          description: "Free users now see a subtle 'Powered by Vayno' footer on exports and previews. Starter and Pro users export completely clean, professional emails."
        }
      ]
    },
    {
      version: "2.4.0",
      date: "October 5, 2025",
      type: "minor",
      icon: Sparkles,
      color: "from-accent to-primary",
      changes: [
        {
          type: "feature",
          title: "Enhanced Mobile Dashboard",
          description: "New hamburger menu with glassmorphism design for seamless mobile navigation. Access all features with beautiful animations and smooth transitions."
        },
        {
          type: "improvement",
          title: "Improved AI Generation Speed",
          description: "Reduced average generation time by 35% through optimized AI model selection and caching. Your campaigns generate faster than ever."
        },
        {
          type: "feature",
          title: "Usage Analytics Dashboard",
          description: "Track your generation usage with detailed insights, projections, and visual progress indicators. Never run out of generations unexpectedly."
        }
      ]
    },
    {
      version: "2.3.0",
      date: "September 28, 2025",
      type: "minor",
      icon: Zap,
      color: "from-primary to-accent",
      changes: [
        {
          type: "feature",
          title: "Batch Campaign Generation (Pro)",
          description: "Pro users can now upload multiple URLs and generate campaigns for all of them simultaneously. Perfect for agencies and multi-product businesses."
        },
        {
          type: "feature",
          title: "Auto-Translate Feature (Pro)",
          description: "Instantly localize your entire email sequence into multiple languages while maintaining tone and effectiveness. Go global in one click."
        },
        {
          type: "feature",
          title: "Smart Preview (Starter+)",
          description: "See how your emails render across Gmail, Outlook, Apple Mail, and mobile devices before sending. Catch formatting issues early."
        }
      ]
    },
    {
      version: "2.2.0",
      date: "September 15, 2025",
      type: "minor",
      icon: Sparkles,
      color: "from-accent to-primary",
      changes: [
        {
          type: "feature",
          title: "Email Content Editing",
          description: "Edit any generated email's subject line or content directly in the campaign view. Your changes are saved automatically."
        },
        {
          type: "feature",
          title: "HTML Export",
          description: "Export your entire email sequence as a single HTML file. Import directly into any ESP like Mailchimp, Klaviyo, or ConvertKit."
        },
        {
          type: "improvement",
          title: "Improved Copy Quality",
          description: "Enhanced AI prompts produce more persuasive, conversion-focused copy with better CTAs and emotional triggers."
        }
      ]
    },
    {
      version: "2.1.0",
      date: "September 1, 2025",
      type: "minor",
      icon: Zap,
      color: "from-primary to-accent",
      changes: [
        {
          type: "feature",
          title: "URL-to-Landing Analysis",
          description: "AI now extracts product names, descriptions, pricing, and key benefits from your landing page before generation for better context."
        },
        {
          type: "improvement",
          title: "Campaign Management",
          description: "View all your campaigns in one place with status indicators, creation dates, and quick actions. Delete or regenerate with one click."
        },
        {
          type: "bugfix",
          title: "Generation Error Handling",
          description: "Fixed edge cases where AI generation would fail silently. Now shows clear error messages and retry options."
        }
      ]
    },
    {
      version: "2.0.0",
      date: "August 18, 2025",
      type: "major",
      icon: Rocket,
      color: "from-accent to-primary",
      changes: [
        {
          type: "feature",
          title: "Multi-Tier Pricing",
          description: "Introduced Free (5 generations), Starter ($9/month, 50 generations), and Pro ($19/month, 500 generations) plans with clear feature separation."
        },
        {
          type: "feature",
          title: "User Dashboard",
          description: "Brand new dashboard with campaign overview, usage tracking, and quick actions. See everything at a glance."
        },
        {
          type: "feature",
          title: "Authentication System",
          description: "Secure login and signup with email verification. Your campaigns and data are now protected."
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Sparkles className="w-4 h-4" />;
      case "improvement":
        return <Zap className="w-4 h-4" />;
      case "bugfix":
        return <Bug className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      feature: { label: "New", variant: "default" as const, class: "bg-green-500/10 text-green-500" },
      improvement: { label: "Improved", variant: "secondary" as const, class: "bg-blue-500/10 text-blue-500" },
      bugfix: { label: "Fixed", variant: "outline" as const, class: "bg-orange-500/10 text-orange-500" }
    };
    return badges[type as keyof typeof badges] || badges.feature;
  };

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
            {updates.map((update, index) => {
              const UpdateIcon = update.icon;
              
              return (
                <motion.div
                  key={update.version}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card p-6 border-primary/20">
                    {/* Update Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${update.color} flex items-center justify-center shrink-0`}>
                          <UpdateIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">Version {update.version}</h3>
                            <Badge variant={update.type === "major" ? "default" : "secondary"}>
                              {update.type === "major" ? "Major Update" : "Minor Update"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{update.date}</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="mb-6" />

                    {/* Changes List */}
                    <div className="space-y-4">
                      {update.changes.map((change, changeIndex) => {
                        const badge = getTypeBadge(change.type);
                        
                        return (
                          <div key={changeIndex} className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                            <div className="shrink-0 mt-1">
                              {getTypeIcon(change.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{change.title}</h4>
                                <Badge variant={badge.variant} className={badge.class}>
                                  {badge.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {change.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Coming Soon Card */}
            <Card className="glass-card p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      A/B Testing for email subject lines and content
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Team collaboration and shared campaigns
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Direct ESP integrations (Mailchimp, Klaviyo, ConvertKit)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Custom brand voice training
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Performance analytics and engagement tracking
                    </li>
                  </ul>
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
