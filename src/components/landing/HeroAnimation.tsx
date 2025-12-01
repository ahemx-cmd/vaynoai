import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FileText, Mail, Zap, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const HeroAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mouseX.set((e.clientX - centerX) / 25);
      mouseY.set((e.clientY - centerY) / 25);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const emailCards = [
    {
      subject: "Welcome to Vayno",
      preview: "Stop writing emails. Start shipping campaigns.",
      day: "Day 0",
      icon: Mail,
      delay: 2,
      fullContent: `Hey there,

Welcome to Vayno.

You just got access to something most founders spend weeks doing manually: complete email sequences that actually convert.

Here's what happens next:

→ Paste your product URL
→ Wait 30 seconds
→ Get a campaign ready to launch

No prompts. No edits. No overthinking.

Just campaigns that sell.

Ready to create your first sequence?

— The Vayno Team`,
    },
    {
      subject: "This is how Vayno works",
      preview: "Your landing page already has the copy you need.",
      day: "Day 2",
      icon: Zap,
      delay: 2.3,
      fullContent: `The secret is simple:

Your landing page already tells us everything we need.

Features. Benefits. Tone. Value props.

Vayno reads it, understands it, and writes emails that sound like you wrote them.

Most founders waste hours:
❌ Staring at blank email templates
❌ Rewriting the same value props
❌ Tweaking subject lines endlessly

Vayno removes all of that.

One URL → One complete sequence.

That's it.

Try it now. You'll see.

— The Vayno Team`,
    },
    {
      subject: "Founders are shipping faster with Vayno",
      preview: "See what happens when you stop writing and start selling.",
      day: "Day 5",
      icon: FileText,
      delay: 2.6,
      fullContent: `Real results from people like you:

"I spent 6 hours writing a drip sequence. Vayno did it in 30 seconds."
— Sarah K., SaaS Founder

"The emails sound exactly like my brand. I barely edited them."
— Marcus T., Product Lead

"Finally, a tool that just works. No learning curve."
— Emily R., Marketing Director

This isn't magic.

It's engineered AI that understands your product, your audience, and your voice.

And it takes 30 seconds.

Ready to see it for yourself?

— The Vayno Team`,
    },
    {
      subject: "Your first campaign is waiting",
      preview: "One URL. One minute. One complete sequence.",
      day: "Day 7",
      icon: Send,
      delay: 2.9,
      fullContent: `Let's be honest:

You've been thinking about building email sequences.

But you haven't started.

Because it takes too long. Because you're not a copywriter. Because you have 100 other priorities.

Here's the truth:

With Vayno, you're 60 seconds away from a complete campaign.

No templates.
No prompts.
No overthinking.

Just results.

Create your first sequence now — it's free, no signup required.

Stop writing. Start selling.

— The Vayno Team`,
    },
  ];

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Orbit ring background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="w-[500px] h-[500px] rounded-full border border-primary/20"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.1)' }}
        />
      </motion.div>

      {/* Landing page screenshot mockup */}
      <motion.div
        initial={{ opacity: 0, x: -50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-80 glass-card rounded-2xl border-primary/30 overflow-hidden"
        style={{
          x: useTransform(x, [-50, 50], [-10, 10]),
          y: useTransform(y, [-50, 50], [-10, 10]),
        }}
      >
        {/* Mockup landing page content */}
        <div className="p-6 space-y-4 relative z-10">
          <div className="h-4 bg-primary/20 rounded-full w-3/4" />
          <div className="h-3 bg-muted/30 rounded-full w-full" />
          <div className="h-3 bg-muted/30 rounded-full w-5/6" />
          <div className="h-3 bg-muted/30 rounded-full w-4/6" />
          
          <div className="pt-4 space-y-2">
            <div className="h-8 bg-primary/10 rounded-lg border border-primary/20" />
            <div className="h-8 bg-primary/10 rounded-lg border border-primary/20" />
          </div>
        </div>

        {/* Scan line effect */}
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ 
            y: ['0%', '200%'], 
            opacity: [0, 1, 1, 0] 
          }}
          transition={{ 
            duration: 2.5, 
            delay: 1.2,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/40 to-transparent pointer-events-none"
          style={{ 
            height: '80px',
            boxShadow: '0 0 30px rgba(0,0,0,0.3)'
          }}
        />

        {/* Blur overlay during scan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.5, delay: 1.2 }}
          className="absolute inset-0 backdrop-blur-[2px] bg-background/20"
        />
      </motion.div>

      {/* Email cards floating */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-full flex items-center">
        <div className="relative w-full h-[500px]">
          {emailCards.map((card, index) => {
            const rotateX = useTransform(y, [-50, 50], [5, -5]);
            const rotateY = useTransform(x, [-50, 50], [-5, 5]);
            
            return (
              <motion.div
                key={index}
                initial={{ 
                  opacity: 0, 
                  scale: 0.5,
                  x: -100,
                  rotateX: -20,
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: 0,
                  rotateX: 0,
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: card.delay,
                  type: "spring",
                  stiffness: 100
                }}
                style={{
                  position: 'absolute',
                  top: `${index * 25}%`,
                  left: `${index * 10}px`,
                  rotateX: isHovering ? rotateX : 0,
                  rotateY: isHovering ? rotateY : 0,
                  x: useTransform(x, [-50, 50], [-index * 3, index * 3]),
                  y: useTransform(y, [-50, 50], [-index * 3, index * 3]),
                  transformPerspective: 1000,
                  zIndex: emailCards.length - index,
                }}
                className="glass-card rounded-2xl p-5 border-primary/30 cursor-pointer"
                onClick={() => setSelectedEmail(index)}
              >
                <div className="relative z-10">
                  {/* Icon and day badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <card.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-primary">{card.day}</span>
                  </div>

                  {/* Email subject */}
                  <h4 className="text-sm font-bold mb-2 leading-tight">
                    {card.subject}
                  </h4>

                  {/* Email preview */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.preview}
                  </p>

                  {/* Animated dots indicator */}
                  <div className="flex items-center gap-1 mt-3">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      className="w-1 h-1 rounded-full bg-primary"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="w-1 h-1 rounded-full bg-primary"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="w-1 h-1 rounded-full bg-primary"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Connecting lines animation */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <motion.path
          d="M 280 300 Q 400 300 450 200"
          stroke="hsl(0 0% 61% / 0.3)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        />
        <motion.path
          d="M 280 300 Q 400 300 450 300"
          stroke="hsl(0 0% 61% / 0.3)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 2.7 }}
        />
        <motion.path
          d="M 280 300 Q 400 300 450 400"
          stroke="hsl(0 0% 61% / 0.3)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 2.9 }}
        />
      </svg>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Email Content Modal */}
      <Dialog open={selectedEmail !== null} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="glass-card border-primary/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2">
              {selectedEmail !== null && emailCards[selectedEmail]?.subject}
            </DialogTitle>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                {selectedEmail !== null && emailCards[selectedEmail]?.day}
              </span>
            </div>
          </DialogHeader>
          
          <div className="mt-6">
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground">
                {selectedEmail !== null && emailCards[selectedEmail]?.fullContent}
              </pre>
            </div>
          </div>

          {/* Neon glow effect */}
          <div className="absolute inset-0 rounded-lg bg-primary/5 blur-2xl pointer-events-none -z-10" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroAnimation;
