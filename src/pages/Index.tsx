import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Lock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PricingSection from "@/components/pricing/PricingSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent glow" />
            <span className="font-bold text-xl gradient-text">Vayno</span>
          </Link>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild className="glow">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">AI-Powered Email Campaigns</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 max-w-4xl mx-auto">
              Turn Your Landing Page Into{" "}
              <span className="gradient-text">Complete Email Campaigns</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Paste any product URL and get a full email sequence in seconds. Welcome series, nurture campaigns, sales emails — all ready to send.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild className="glow">
                <Link to="/auth" className="flex items-center gap-2">
                  Start Free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="#pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto border-2 border-primary/20 glow">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-20 h-20 text-primary animate-glow-pulse" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Founders Love Vayno</h2>
            <p className="text-muted-foreground text-lg">Everything you need to launch email campaigns faster</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Generate complete email sequences in under 30 seconds. No more hours of copywriting."
              },
              {
                icon: Lock,
                title: "Brand-Matched Copy",
                description: "AI analyzes your landing page to match your brand voice and product messaging perfectly."
              },
              {
                icon: TrendingUp,
                title: "High Converting",
                description: "50-500 word emails with proven structures. Personalized CTAs that drive results."
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl hover:scale-105 transition-smooth hover:glow"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 glow">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <PricingSection />
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 text-center max-w-4xl mx-auto border-2 border-primary/20 glow"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Launch Your First Campaign?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of founders creating high-converting email campaigns
            </p>
            <Button size="lg" asChild className="glow">
              <Link to="/auth" className="flex items-center gap-2">
                Start For Free <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Vayno. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;