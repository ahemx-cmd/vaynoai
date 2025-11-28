import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, FileText, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PricingSection from "@/components/pricing/PricingSection";
import vaynoIcon from "@/assets/vayno-icon.png";
import dashboardPreview from "@/assets/dashboard-preview.png";
import { trackButtonClick } from "@/lib/analytics";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-2xl border-b border-border/20">
        <div className="container mx-auto px-6 lg:px-12 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img 
                src={vaynoIcon} 
                alt="Vayno" 
                className="w-9 h-9 transition-transform duration-200 group-hover:scale-105" 
              />
              <span className="font-semibold text-xl tracking-tight text-foreground">
                Vayno
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                asChild 
                size="sm" 
                className="text-sm font-medium hover:text-foreground"
                onClick={() => trackButtonClick('Sign In', 'nav-bar')}
              >
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button 
                asChild 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20" 
                size="sm"
                onClick={() => trackButtonClick('Try Free', 'nav-bar')}
              >
                <Link to="/guest-flow">Try free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Asymmetric, Bold */}
      <section className="relative pt-40 pb-24 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Left: Hero Content - 7 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 pt-8"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/8 mb-8">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">Launch-ready sequences</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.05] tracking-tight">
                Stop writing.<br/>
                Start <span className="text-primary">selling</span>.
              </h1>
              
              <p className="text-lg md:text-xl mb-10 leading-relaxed max-w-xl" style={{ color: 'hsl(215 15% 60%)' }}>
                Drop your product URL. Get a complete email drip sequence in 30 seconds. 
                No prompts, no edits—just campaigns that convert.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-14 px-8 shadow-lg shadow-primary/25 group"
                  onClick={() => trackButtonClick('Try Free', 'hero-section')}
                >
                  <Link to="/guest-flow" className="flex items-center gap-2">
                    Create your first campaign
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              <p className="text-sm" style={{ color: 'hsl(215 15% 50%)' }}>
                Free campaign · No signup required
              </p>
            </motion.div>

            {/* Right: Dashboard Preview - 5 cols, offset */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 mt-16 lg:mt-0"
            >
              <div className="rounded-3xl overflow-hidden border border-border/30 shadow-2xl">
                <img 
                  src={dashboardPreview} 
                  alt="Vayno Dashboard" 
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Prop - Offset Grid */}
      <section className="py-32 px-6 lg:px-12 bg-gradient-to-b from-transparent to-card/20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-20 items-center">
            {/* Left: Visual - 2 cols */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-10 border border-border/30">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded-full w-full" />
                    <div className="h-3 bg-muted rounded-full w-5/6" />
                    <div className="h-3 bg-muted rounded-full w-4/6" />
                  </div>
                  <div className="pt-4 flex gap-2">
                    <div className="h-20 bg-primary/10 rounded-2xl flex-1 border border-primary/20" />
                    <div className="h-20 bg-primary/10 rounded-2xl flex-1 border border-primary/20" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Content - 3 cols */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight max-w-2xl">
                  Your landing page already has the copy.
                </h2>
                <p className="text-lg mb-8 leading-relaxed max-w-xl" style={{ color: 'hsl(215 15% 58%)' }}>
                  We read your product page and write emails that sound like you wrote them. 
                  No brainstorming. No writer's block. No endless revisions.
                </p>
                <div className="space-y-4">
                  {[
                    "4–12 emails per sequence",
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
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-base" style={{ color: 'hsl(215 15% 60%)' }}>{point}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 px-6 lg:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h2>
            <p className="text-lg" style={{ color: 'hsl(215 15% 58%)' }}>
              Pick a plan. Start shipping campaigns.
            </p>
          </div>
          <PricingSection />
        </div>
      </section>

      {/* Final CTA - Bold, Centered */}
      <section className="py-32 px-6 lg:px-12 bg-gradient-to-b from-card/10 to-transparent">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Try it now.<br/>Free.
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'hsl(215 15% 58%)' }}>
              One URL. One minute. One complete email sequence.
            </p>
            <Button 
              size="lg" 
              asChild 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-16 px-10 text-base shadow-2xl shadow-primary/30"
              onClick={() => trackButtonClick('Try Free', 'final-cta')}
            >
              <Link to="/guest-flow" className="flex items-center gap-3">
                Create your first campaign
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-border/20 py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2.5">
              <img 
                src={vaynoIcon} 
                alt="Vayno" 
                className="w-7 h-7" 
              />
              <span className="font-semibold text-base">Vayno</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <a 
                href="mailto:teamvaynosupport@gmail.com" 
                className="transition-colors duration-200"
                style={{ color: 'hsl(215 15% 55%)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(158 100% 45%)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(215 15% 55%)'}
              >
                Support
              </a>
              <a 
                href="/terms" 
                className="transition-colors duration-200"
                style={{ color: 'hsl(215 15% 55%)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(158 100% 45%)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(215 15% 55%)'}
              >
                Terms
              </a>
              <a 
                href="/privacy" 
                className="transition-colors duration-200"
                style={{ color: 'hsl(215 15% 55%)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(158 100% 45%)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(215 15% 55%)'}
              >
                Privacy
              </a>
            </div>
            
            <p className="text-xs" style={{ color: 'hsl(215 15% 50%)' }}>
              © 2025 Vayno
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
