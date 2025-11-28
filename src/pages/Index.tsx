import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, FileText, Download, Layout, CheckCircle2, Star, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PricingSection from "@/components/pricing/PricingSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Testimonials from "@/components/landing/Testimonials";
import AnimatedText from "@/components/landing/AnimatedText";
import vaynoIcon from "@/assets/vayno-icon.png";
import productDashboard from "@/assets/product-dashboard.png";
import productCampaign from "@/assets/product-campaign-view.png";
import productEmail from "@/assets/product-email-preview.png";
import { trackButtonClick } from "@/lib/analytics";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={vaynoIcon} 
                alt="Vayno" 
                className="w-10 h-10 transition-transform duration-200 group-hover:scale-105" 
              />
              <span className="font-bold text-2xl tracking-tight">
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
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button 
                asChild 
                className="btn-premium" 
                size="sm"
                onClick={() => trackButtonClick('Try Free', 'nav-bar')}
              >
                <Link to="/guest-flow">Try free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent" />
        
        <div className="container mx-auto relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <span className="text-xs font-medium uppercase tracking-wider">Launch-ready sequences</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight">
              Stop writing.<br/>
              Start <span className="text-primary">selling</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Drop your product URL. Get a full email drip sequence in 30 seconds. 
              No prompts. No edits. Just campaigns that convert.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button 
                size="lg" 
                asChild 
                className="btn-premium group h-12"
                onClick={() => trackButtonClick('Try Free', 'hero-section')}
              >
                <Link to="/guest-flow" className="flex items-center gap-2">
                  Create your first campaign
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Free campaign. No signup required.
            </p>
          </motion.div>

          {/* Product preview - offset to the right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] hidden lg:block"
          >
            <div className="relative">
              <img 
                src={productDashboard} 
                alt="Vayno Dashboard" 
                className="rounded-xl border border-primary/20 shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                Real product, no mockups
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product showcase section */}
      <section className="py-32 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-7xl">
          {/* Main feature with large screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your landing page already has the copy.<br/>
                We just turn it into emails.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No brainstorming. No writer's block. No endless revisions.
              </p>
            </div>
            <div className="relative">
              <img 
                src={productCampaign} 
                alt="Campaign email sequence view" 
                className="rounded-2xl border border-primary/20 shadow-2xl w-full"
              />
            </div>
          </motion.div>

          {/* Two-column grid with smaller screenshots */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-3">Built for speed</h3>
                <p className="text-muted-foreground">
                  Drop your URL, get a complete sequence in 30 seconds. No templates. No prompts.
                </p>
              </div>
              <div className="space-y-3 mb-8">
                {[
                  "4-12 emails per sequence",
                  "Export as ESP-ready HTML",
                  "Improve any email in one click"
                ].map((point, i) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
              <img 
                src={productDashboard} 
                alt="Campaign dashboard" 
                className="rounded-xl border border-primary/20 shadow-lg w-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:pt-16"
            >
              <img 
                src={productEmail} 
                alt="Email preview interface" 
                className="rounded-xl border border-primary/20 shadow-lg w-full mb-6"
              />
              <div className="mt-6">
                <h3 className="text-2xl font-bold mb-3">Ready to send</h3>
                <p className="text-muted-foreground">
                  Every email exports as clean HTML. Upload to your ESP and you're live.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-background">
        <PricingSection />
      </section>

      {/* Final CTA - Strong and minimal */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Try it now. Free.
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              One URL. One minute. One complete email sequence.
            </p>
            <Button 
              size="lg" 
              asChild 
              className="btn-premium shadow-lg h-14 px-8 text-base"
              onClick={() => trackButtonClick('Try Free', 'final-cta')}
            >
              <Link to="/guest-flow" className="flex items-center gap-2">
                Create your first campaign
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/30 backdrop-blur-lg py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src={vaynoIcon} 
                alt="Vayno" 
                className="w-8 h-8" 
              />
              <span className="font-bold text-lg">Vayno</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a 
                href="mailto:teamvaynosupport@gmail.com" 
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Support
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Terms
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Privacy
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground">
              © 2025 Vayno
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;