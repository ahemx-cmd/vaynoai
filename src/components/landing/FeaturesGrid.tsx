import { motion } from "framer-motion";
import { Wand2, FileText, Clock, LayoutDashboard, Zap, Sparkles } from "lucide-react";

const FeaturesGrid = () => {
  const features = [
    {
      icon: null,
      title: "AI Email Generator",
      description: "Smart AI that understands your product and writes compelling copy that converts",
      isCustomIcon: true
    },
    {
      icon: Wand2,
      title: "One-Click Improvements",
      description: "Instantly enhance any email with AI-powered refinements and optimizations",
      isCustomIcon: false
    },
    {
      icon: FileText,
      title: "Beautiful HTML Exports",
      description: "Export production-ready HTML emails compatible with all major platforms",
      isCustomIcon: false
    },
    {
      icon: Clock,
      title: "Drip Sequences",
      description: "Complete sequences including welcome, nurture, sales, and re-engagement emails",
      isCustomIcon: false
    },
    {
      icon: LayoutDashboard,
      title: "Clean Dashboard",
      description: "Manage all your campaigns in one beautiful, intuitive interface",
      isCustomIcon: false
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate complete email sequences in under 30 seconds, ready to send",
      isCustomIcon: false
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
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
              className="glass-card p-6 rounded-2xl hover-lift transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-2 border-transparent hover:border-primary/20 group"
            >
              <motion.div 
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.isCustomIcon ? (
                  <Sparkles className="w-7 h-7 text-primary" />
                ) : (
                  feature.icon && <feature.icon className="w-7 h-7 text-primary" />
                )}
              </motion.div>
              <h3 className="text-lg font-semibold mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;