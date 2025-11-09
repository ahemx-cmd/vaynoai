import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, FileText, Download, Layout, CheckCircle2, Star, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PricingSection from "@/components/pricing/PricingSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Testimonials from "@/components/landing/Testimonials";
import vaynoIcon from "@/assets/vayno-icon.png";
import { trackButtonClick } from "@/lib/analytics";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={vaynoIcon} alt="Vayno" className="w-12 h-12" />
              <span className="font-bold text-2xl tracking-tight">Vayno</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                asChild 
                size="sm" 
                className="text-sm"
                onClick={() => trackButtonClick('Sign In', 'nav-bar')}
              >
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button 
                asChild 
                className="btn-premium" 
                size="sm"
                onClick={() => trackButtonClick('Try Free', 'nav-bar')}
              >
                <Link to="/guest-flow">Try Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 mb-6 animate-fade-in">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-base font-medium">AI-Powered Email Campaigns</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Turn your landing page into{" "}
              <span className="gradient-text">ready-to-send</span>{" "}
              email campaigns
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              AI that builds high-converting sequences for you — no copywriting needed. Just paste your URL and get professional emails in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                asChild 
                className="btn-premium shadow-lg hover-lift"
                onClick={() => trackButtonClick('Try Free', 'hero-section')}
              >
                <Link to="/guest-flow" className="flex items-center gap-2">
                  Try Free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="hover-lift"
                onClick={() => trackButtonClick('See How It Works', 'hero-section')}
              >
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              No credit card required
            </p>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20"
          >
            <div className="glass-card rounded-2xl p-2 max-w-4xl mx-auto hover-lift">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 aspect-video flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center p-2">
                    <img src={vaynoIcon} alt="Vayno AI" className="w-full h-full" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Paste URL → AI Generates → Export & Send</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <PricingSection />
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 text-center hover-lift"
          >
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-lg p-4">
              <img src={vaynoIcon} alt="Vayno" className="w-full h-full" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Start generating your first campaign today
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of founders creating high-converting email campaigns in minutes, not hours
            </p>
            <Button 
              size="lg" 
              asChild 
              className="btn-premium shadow-lg hover-lift"
              onClick={() => trackButtonClick('Try Free', 'final-cta')}
            >
              <Link to="/guest-flow" className="flex items-center gap-2">
                Try Free <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={vaynoIcon} alt="Vayno" className="w-10 h-10" />
              <span className="font-bold text-xl">Vayno</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="mailto:teamvaynosupport@gmail.com" className="hover:text-foreground transition-smooth">
                Support
              </a>
              <a href="#" className="hover:text-foreground transition-smooth">Terms</a>
              <a href="#" className="hover:text-foreground transition-smooth">Privacy</a>
              <a href="#" className="hover:text-foreground transition-smooth">Refund Policy</a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Vayno. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;