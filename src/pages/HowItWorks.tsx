import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Mail, FileText, Download, Sparkles, CreditCard, RefreshCw, CheckCircle2, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import vaynoIcon from "@/assets/vayno-icon.png";

const HowItWorks = () => {
  const steps = [
    {
      icon: Globe,
      number: "01",
      title: "Paste Your URL",
      description: "Simply paste your landing page URL into Vayno. Our AI will analyze your product, features, and value proposition."
    },
    {
      icon: Sparkles,
      number: "02",
      title: "AI Generates Your Campaign",
      description: "Our advanced AI creates a complete 5-email sequence tailored to your product, with compelling copy and strategic timing."
    },
    {
      icon: Download,
      number: "03",
      title: "Export & Send",
      description: "Download your campaign as individual files or a ZIP archive. Import directly into your favorite email tool and start converting."
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate professional email campaigns in minutes instead of hours or days of manual copywriting."
    },
    {
      icon: Mail,
      title: "High-Converting Copy",
      description: "AI-powered emails designed to engage your audience and drive conversions with proven frameworks."
    },
    {
      icon: FileText,
      title: "Ready to Use",
      description: "Export in multiple formats and import directly into any email marketing platform you use."
    },
    {
      icon: Sparkles,
      title: "Smart Sequences",
      description: "Strategic 5-email sequences that nurture leads from awareness to conversion automatically."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={vaynoIcon} alt="Vayno" className="w-12 h-12" />
              <span className="font-bold text-2xl tracking-tight">Vayno</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" asChild size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="btn-premium" size="sm">
                <Link to="/create-campaign">Try Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              How <span className="gradient-text">Vayno</span> Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your landing page into high-converting email campaigns with AI in three simple steps
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="p-8 h-full glass-card hover-lift">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-2">{step.number}</div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Why Choose Vayno?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for founders and marketers who want professional email campaigns without the hassle
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full glass-card hover-lift">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Credits System Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 glass-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold">How Credits Work</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">One Credit = One Email Generated</h3>
                    <p className="text-muted-foreground">
                      Each email in your campaign costs 1 credit. A typical 5-email sequence uses 5 credits.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <RefreshCw className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Credits Reset When Exhausted</h3>
                    <p className="text-muted-foreground">
                      Your monthly credits reset automatically once you've used all of them. No rollover — fresh credits every reset period.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Credit Top-Up Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Need more credits before your reset? We're working on a credit top-up feature so you can purchase additional credits anytime.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm">
                    <strong>Free Trial:</strong> New users get 20 free credits to try Vayno.<br />
                    <strong>Starter Plan:</strong> 150 credits per month ($19/mo or $59 lifetime)<br />
                    <strong>Pro Plan:</strong> 400 credits per month ($29/mo)
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Perfect For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vayno helps various professionals create winning email campaigns
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "SaaS Founders",
                description: "Launch product updates, onboard new users, and nurture trial users into paying customers."
              },
              {
                title: "Marketing Teams",
                description: "Scale your email marketing efforts without hiring expensive copywriters or agencies."
              },
              {
                title: "Course Creators",
                description: "Promote your courses, engage students, and build authority in your niche with automated sequences."
              }
            ].map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full glass-card hover-lift">
                  <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 text-center hover-lift"
          >
            <div className="w-20 h-20 rounded-2xl bg-card flex items-center justify-center mx-auto mb-6 shadow-lg p-4">
              <img src={vaynoIcon} alt="Vayno" className="w-full h-full" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with 20 free credits — no credit card required
            </p>
            <Button size="lg" asChild className="btn-premium shadow-lg hover-lift">
              <Link to="/create-campaign" className="flex items-center gap-2">
                Try Free <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
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

export default HowItWorks;
