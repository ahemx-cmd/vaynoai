import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, FileText, Download, Layout, CheckCircle2, Star, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PricingSection from "@/components/pricing/PricingSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Testimonials from "@/components/landing/Testimonials";
import AnimatedText from "@/components/landing/AnimatedText";
import vaynoIcon from "@/assets/vayno-icon.png";
import { trackButtonClick } from "@/lib/analytics";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={vaynoIcon} 
                alt="Vayno" 
                className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" 
              />
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Vayno
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                asChild 
                size="sm" 
                className="text-sm font-medium"
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
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent" />
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        
        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 border-primary/30 bg-primary/10 mb-8 animate-fade-in backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-primary animate-glow-pulse" />
              <span className="text-sm font-semibold tracking-wide">AI-POWERED EMAIL CAMPAIGNS</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
              From landing page to email campaigns while you{" "}
              <AnimatedText />
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              AI that builds high-converting sequences for you — no copywriting needed. Just paste your URL and get professional emails in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Button 
                size="lg" 
                asChild 
                className="btn-premium shadow-lg hover-lift group"
                onClick={() => trackButtonClick('Try Free', 'hero-section')}
              >
                <Link to="/guest-flow" className="flex items-center gap-2">
                  Try Free 
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="hover-lift group"
                onClick={() => trackButtonClick('See How It Works', 'hero-section')}
              >
                <Link to="/how-it-works" className="flex items-center gap-2">
                  See How It Works
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-8 font-medium">
              ✨ No credit card required
            </p>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="mt-24"
          >
            <div className="glass-card rounded-3xl p-3 max-w-4xl mx-auto hover-lift shadow-2xl">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-12 aspect-video flex flex-col items-center justify-center gap-6 border border-primary/10">
                <div className="flex items-center gap-6">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-card shadow-lg flex items-center justify-center border-2 border-primary/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Mail className="w-8 h-8 text-primary" />
                  </motion.div>
                  <ArrowRight className="w-8 h-8 text-primary/60 animate-pulse" />
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-xl flex items-center justify-center p-3 border-2 border-primary/30"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img src={vaynoIcon} alt="Vayno AI" className="w-full h-full icon-pulse" />
                  </motion.div>
                  <ArrowRight className="w-8 h-8 text-primary/60 animate-pulse" />
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-card shadow-lg flex items-center justify-center border-2 border-primary/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>
                <p className="text-base text-muted-foreground font-medium">Paste URL → AI Generates → Export & Send</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-background">
        <PricingSection />
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 md:p-16 text-center hover-lift shadow-2xl border-2 border-primary/20"
          >
            <motion.div 
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-8 shadow-xl p-5 border-2 border-primary/30"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src={vaynoIcon} alt="Vayno" className="w-full h-full icon-pulse" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
              Start generating your first campaign today
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Join hundreds of founders creating high-converting email campaigns in minutes, not hours
            </p>
            <Button 
              size="lg" 
              asChild 
              className="btn-premium shadow-lg hover-lift group"
              onClick={() => trackButtonClick('Try Free', 'final-cta')}
            >
              <Link to="/guest-flow" className="flex items-center gap-2">
                Try Free 
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-lg py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 group">
              <img 
                src={vaynoIcon} 
                alt="Vayno" 
                className="w-10 h-10 transition-transform duration-300 group-hover:scale-110" 
              />
              <span className="font-bold text-xl">Vayno</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <a 
                href="mailto:teamvaynosupport@gmail.com" 
                className="text-muted-foreground hover:text-primary transition-all duration-300 link-underline font-medium"
              >
                Support
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-all duration-300 link-underline font-medium">
                Terms
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-all duration-300 link-underline font-medium">
                Privacy
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground font-medium">
              &copy; 2025 Vayno. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;