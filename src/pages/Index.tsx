import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PricingSection from "@/components/pricing/PricingSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import HeroAnimation from "@/components/landing/HeroAnimation";
import vaynoIcon from "@/assets/vayno-icon.png";
import { trackButtonClick } from "@/lib/analytics";
import { useRef } from "react";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* Navigation - Premium Glass */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-6 lg:px-12 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={vaynoIcon} 
                alt="Vayno" 
                className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(35,255,128,0.5)]" 
              />
              <span className="font-bold text-2xl tracking-tight text-foreground">
                Vayno
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                asChild 
                size="sm" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => trackButtonClick('Sign In', 'nav-bar')}
              >
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button 
                asChild 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all" 
                size="sm"
                onClick={() => trackButtonClick('Try Free', 'nav-bar')}
              >
                <Link to="/guest-flow">Try free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium with Animations */}
      <section ref={heroRef} className="relative pt-48 pb-32 px-6 lg:px-12 overflow-hidden">
        {/* Orbit ring behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-20">
          <div className="orbit absolute inset-0 rounded-full border border-primary/20" 
               style={{ boxShadow: '0 0 60px rgba(35,255,128,0.1)' }} />
        </div>

        {/* Floating elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute top-40 right-20 hidden lg:block"
        >
          <div className="float glass-card rounded-2xl p-4 border-primary/30">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">+4 sequences created</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute top-60 left-16 hidden lg:block"
        >
          <div className="float glass-card rounded-xl p-3 border-primary/20" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </motion.div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto relative z-10 max-w-7xl"
        >
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Hero Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border-primary/30 mb-10">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Launch-ready sequences</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-10 leading-[0.95] tracking-tighter">
                  Stop writing.<br/>
                  Start <span className="gradient-text">selling</span>.
                </h1>
                
                <p className="text-xl md:text-2xl mb-12 leading-relaxed text-muted-foreground max-w-xl">
                  Drop your product URL. Get a complete email drip sequence in 30 seconds. 
                  No prompts, no edits—just campaigns that convert.
                </p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-8"
                >
                  <Button 
                    size="lg" 
                    asChild 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-16 px-10 text-lg rounded-2xl shadow-[0_0_40px_rgba(35,255,128,0.4)] hover:shadow-[0_0_60px_rgba(35,255,128,0.6)] transition-all group"
                    onClick={() => trackButtonClick('Try Free', 'hero-section')}
                  >
                    <Link to="/guest-flow" className="flex items-center gap-3">
                      Create your first campaign
                      <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>

                <p className="text-sm text-muted-foreground">
                  Free campaign · No signup required
                </p>
              </motion.div>
            </div>

            {/* Right: AI Transformation Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              <HeroAnimation />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 lg:px-12 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Your landing page already has the copy.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We read your product page and write emails that sound like you wrote them.
            </p>
          </motion.div>

          <FeaturesGrid />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three steps to launch-ready campaigns
            </p>
          </motion.div>

          <HowItWorks />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 lg:px-12 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Pick a plan. Start shipping campaigns.
            </p>
          </motion.div>
          <PricingSection />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 lg:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
              Try it now.<br/>Free.
            </h2>
            <p className="text-2xl mb-16 text-muted-foreground max-w-2xl mx-auto">
              One URL. One minute. One complete email sequence.
            </p>
            <Button 
              size="lg" 
              asChild 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-20 px-12 text-xl rounded-2xl shadow-[0_0_60px_rgba(35,255,128,0.5)] hover:shadow-[0_0_80px_rgba(35,255,128,0.7)] transition-all"
              onClick={() => trackButtonClick('Try Free', 'final-cta')}
            >
              <Link to="/guest-flow" className="flex items-center gap-4">
                Create your first campaign
                <ArrowRight className="w-7 h-7" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 relative glass-card">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img 
                src={vaynoIcon} 
                alt="Vayno" 
                className="w-8 h-8" 
              />
              <span className="font-bold text-xl">Vayno</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-10 text-sm">
              <a 
                href="mailto:teamvaynosupport@gmail.com" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </a>
              <a 
                href="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </a>
              <a 
                href="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 Vayno
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
