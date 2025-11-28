import { motion } from "framer-motion";
import { Link2, Download, Sparkles } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Paste Your URL",
      description: "Drop in your landing page or product URL. That's it.",
      icon: Link2,
    },
    {
      number: "02", 
      title: "AI Scans & Writes",
      description: "We analyze your page and generate a complete email sequence in seconds.",
      icon: Sparkles,
    },
    {
      number: "03",
      title: "Export & Launch",
      description: "Download HTML files ready for any ESP. Load them up and start converting.",
      icon: Download,
    }
  ];

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="relative group"
          >
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/3 left-full w-full h-[2px] -z-10">
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
                  viewport={{ once: true }}
                  className="h-full bg-gradient-to-r from-primary/40 to-transparent origin-left"
                />
              </div>
            )}

            <div className="glass-card rounded-3xl p-10 border-primary/20 hover-lift h-full">
              {/* Step number badge */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center backdrop-blur-xl shadow-[0_0_30px_rgba(35,255,128,0.3)]">
                <span className="text-2xl font-bold gradient-text">{step.number}</span>
              </div>

              {/* Icon */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>

              {/* Pulse indicator */}
              {index === 1 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-8 right-8 w-3 h-3 rounded-full bg-primary"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
