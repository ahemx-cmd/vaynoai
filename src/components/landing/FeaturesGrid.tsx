import { motion } from "framer-motion";
import { Sparkles, Wand2, FileText, Clock, LayoutDashboard, Zap } from "lucide-react";

const FeaturesGrid = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI Email Generator",
      description: "Smart AI that understands your product and writes compelling copy that converts"
    },
    {
      icon: Wand2,
      title: "One-Click Improvements",
      description: "Instantly enhance any email with AI-powered refinements and optimizations"
    },
    {
      icon: FileText,
      title: "Beautiful HTML Exports",
      description: "Export production-ready HTML emails compatible with all major platforms"
    },
    {
      icon: Clock,
      title: "Drip Sequences",
      description: "Complete sequences including welcome, nurture, sales, and re-engagement emails"
    },
    {
      icon: LayoutDashboard,
      title: "Clean Dashboard",
      description: "Manage all your campaigns in one beautiful, intuitive interface"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate complete email sequences in under 30 seconds, ready to send"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-primary/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Everything you need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features that make email campaign creation effortless
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl hover-lift"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;