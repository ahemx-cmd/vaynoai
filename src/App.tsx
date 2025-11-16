import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePageTracking } from "./hooks/usePageTracking";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateCampaign from "./pages/CreateCampaign";
import Onboarding from "./pages/Onboarding";
import AnalyzingCampaign from "./pages/AnalyzingCampaign";
import CampaignView from "./pages/CampaignView";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import Usage from "./pages/Usage";
import Support from "./pages/Support";
import Updates from "./pages/Updates";
import NotFound from "./pages/NotFound";
import RecoveryRedirect from "./components/auth/RecoveryRedirect";
import ChoosePlan from "./pages/ChoosePlan";
import SharedCampaignView from "./pages/SharedCampaignView";
import HowItWorks from "./pages/HowItWorks";
import GuestCampaignFlow from "./pages/GuestCampaignFlow";

const queryClient = new QueryClient();

const AppRoutes = () => {
  usePageTracking();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/choose-plan" element={<ChoosePlan />} />
      <Route path="/guest-flow" element={<GuestCampaignFlow />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-campaign" element={<CreateCampaign />} />
      <Route path="/campaign/:id/analyzing" element={<AnalyzingCampaign />} />
      <Route path="/campaign/:id" element={<CampaignView />} />
      <Route path="/shared/:shareToken" element={<SharedCampaignView />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/usage" element={<Usage />} />
      <Route path="/support" element={<Support />} />
      <Route path="/updates" element={<Updates />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RecoveryRedirect />
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
