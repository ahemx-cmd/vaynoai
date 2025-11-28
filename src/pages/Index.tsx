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

          {/* Visual proof - offset to the right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 hidden lg:block"
          >
            <div className="glass-card rounded-2xl p-4 backdrop-blur-xl border-primary/10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Generated in 28s</span>
                </div>
                <div className="bg-card/50 rounded-lg p-3 space-y-2">
                  <div className="h-2 bg-muted-foreground/20 rounded w-3/4" />
                  <div className="h-2 bg-muted-foreground/20 rounded w-full" />
                  <div className="h-2 bg-muted-foreground/20 rounded w-2/3" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-primary/10 rounded flex-1 border border-primary/20" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social proof + value prop - asymmetric */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Your landing page already has the copy.<br/>
                We just turn it into emails.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                No brainstorming. No writer's block. No endless revisions. 
                Vayno reads your product page and writes emails that sound like you wrote them.
              </p>
              <div className="space-y-4">
                {[
                  "4-12 emails per sequence",
                  "Export as ESP-ready HTML",
                  "Improve any email in one click"
                ].map((point, i) => (
                  <motion.div
                    key={point}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Welcome Email</p>
                      <p className="text-sm text-muted-foreground">Day 0 · 180 words</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Value Email</p>
                      <p className="text-sm text-muted-foreground">Day 2 · 220 words</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Social Proof</p>
                      <p className="text-sm text-muted-foreground">Day 5 · 190 words</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
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