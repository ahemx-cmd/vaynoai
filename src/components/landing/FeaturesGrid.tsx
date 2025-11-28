import { motion } from "framer-motion";
import { Zap, FileText, Download, Globe, Sparkles, Clock } from "lucide-react";

const FeaturesGrid = () => {
  const features = [
    {
      icon: Zap,
      title: "Generate in Seconds",
      description: "Paste your URL and get a complete email sequence in under 30 seconds. No prompts needed."
    },
    {
      icon: FileText,
      title: "4-12 Email Sequences",
      description: "Choose your drip duration and get perfectly timed campaigns optimized for conversion."
    },
    {
      icon: Download,
      title: "Export as HTML",
      description: "Download ESP-ready HTML files that work with any email platform. One click, done."
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Translate your entire campaign into 30+ languages with one click. Global reach, zero effort."
    },
    {
      icon: Sparkles,
      title: "AI Improvements",
      description: "Refine any email instantly with AI-powered suggestions. Make it better without rewriting."
    },
    {
      icon: Clock,
      title: "Smart Timing",
      description: "Optimized drip schedules based on best practices. Your emails land when prospects are ready."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 border-primary/20 hover-lift group"
        >
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <feature.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default FeaturesGrid;
