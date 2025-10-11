import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Founder, TechFlow SaaS",
      content: "Generated 7 emails that actually made sales! Vayno saved me hours of copywriting and the results speak for themselves.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Lead, GrowthKit",
      content: "The AI understands our brand voice perfectly. We've cut our email campaign creation time from days to minutes.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Solo Founder, DesignHub",
      content: "As a non-marketer, this tool is a lifesaver. Professional emails without hiring a copywriter. Absolutely worth it.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Loved by founders</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what people are saying about Vayno
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card p-6 hover-lift h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;