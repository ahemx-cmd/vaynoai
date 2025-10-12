import { motion } from "framer-motion";
import { Link, Download } from "lucide-react";
import vaynoIcon from "@/assets/vayno-icon.png";

const HowItWorks = () => {
  const steps = [
    {
      icon: Link,
      number: "01",
      title: "Paste your landing page URL",
      description: "Simply add the URL of your product page or website",
      isCustomIcon: false
    },
    {
      icon: null,
      number: "02",
      title: "AI analyzes & generates emails",
      description: "Our AI extracts key info and creates a complete email sequence",
      isCustomIcon: true
    },
    {
      icon: Download,
      number: "03",
      title: "Edit, improve, export, send",
      description: "One-click improvements, then export as ready-to-upload HTML",
      isCustomIcon: false
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to professional email campaigns
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 rounded-2xl hover-lift h-full">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                    {step.isCustomIcon ? (
                      <img src={vaynoIcon} alt="AI" className="w-8 h-8" />
                    ) : (
                      step.icon && <step.icon className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <span className="absolute top-0 right-0 text-6xl font-bold text-primary/10">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;