import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Menu, 
  Home, 
  Sparkles, 
  FolderOpen, 
  User, 
  CreditCard, 
  BarChart3, 
  LogOut,
  MessageCircle,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const MobileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
    setOpen(false);
  };

  const menuSections = [
    {
      title: "Main",
      items: [
        { 
          icon: Home, 
          label: "Dashboard", 
          sublabel: "View and manage your campaigns",
          path: "/dashboard" 
        },
        { 
          icon: Sparkles, 
          label: "New Campaign", 
          sublabel: "Start a new campaign",
          path: "/create-campaign" 
        },
        { 
          icon: FolderOpen, 
          label: "My Campaigns", 
          sublabel: "View saved and past campaigns",
          path: "/dashboard" 
        },
      ]
    },
    {
      title: "Account",
      items: [
        { 
          icon: User, 
          label: "My Profile", 
          sublabel: "Manage your profile info",
          path: "/profile" 
        },
        { 
          icon: CreditCard, 
          label: "Billing & Plans", 
          sublabel: "Manage subscription and payments",
          path: "/billing" 
        },
        { 
          icon: BarChart3, 
          label: "Usage & Limits", 
          sublabel: "View remaining generations",
          path: "/usage" 
        },
      ]
    },
    {
      title: "Help & Resources",
      items: [
        { 
          icon: MessageCircle, 
          label: "Support / Chat", 
          sublabel: "Get help from the Vayno team",
          path: "/support" 
        },
        { 
          icon: Bell, 
          label: "What's New / Updates", 
          sublabel: "View new features and changelog",
          path: "/updates" 
        },
      ]
    }
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 glass-card border-primary/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6 border-b border-border/20">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Vayno</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
            {menuSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-3 py-3 rounded-lg transition-smooth group",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 shrink-0 mt-0.5",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-medium text-sm",
                            isActive ? "text-primary" : "text-foreground"
                          )}>
                            {item.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.sublabel}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-border/20">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
