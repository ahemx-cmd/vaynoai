import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { MessageCircle, Mail, Book, Video, HelpCircle, Send, ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Support = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const faqs = [
    {
      question: "How do I generate my first email campaign?",
      answer: "Click on 'New Campaign' in the sidebar, enter your product or landing page URL, select your sequence type and drip duration, then click 'Generate'. Our AI will analyze your page and create a professional email sequence in minutes."
    },
    {
      question: "What's the difference between sequence types?",
      answer: "Each sequence type is optimized for a specific marketing goal: Welcome Series introduces your brand, Product Launch announces new products, Sales/Promotion drives conversions with urgency, Abandoned Cart recovers lost sales, Re-engagement wins back inactive users, Nurture builds trust over time, Onboarding guides new users, Feature Announcement highlights updates, Pre-Launch builds excitement, and Customer Testimonial leverages social proof."
    },
    {
      question: "How does the drip duration work?",
      answer: "Drip duration determines how your emails are spaced over time. A 7-Day Drip sends 3-5 emails over one week, 14-Day Drip sends 5-7 emails over two weeks, and 30-Day Drip sends 7-10 emails over a month. The AI automatically spaces them optimally for engagement."
    },
    {
      question: "Can I edit the generated emails?",
      answer: "Yes! After generation, you can edit any email's subject line or content directly in the campaign view. You can also use the 'Improve Email' feature to have AI refine specific parts while keeping your edits."
    },
    {
      question: "What happens when I reach my generation limit?",
      answer: "Free users get 5 generations, Starter gets 50/month, and Pro gets 500/month. When you hit your limit, you'll need to wait for your monthly reset or upgrade your plan to continue generating campaigns. Check Usage & Limits to monitor your progress."
    },
    {
      question: "How do I remove the 'Powered by Vayno' watermark?",
      answer: "The watermark appears on Free plan exports only. Upgrade to Starter ($9/month) or Pro ($19/month) to export clean, professional emails without any branding."
    },
    {
      question: "Can I export my campaigns to my email service provider?",
      answer: "Yes! Click 'Export HTML' on any campaign to download all emails as a single HTML file. You can then import this into platforms like Mailchimp, Klaviyo, ConvertKit, or any ESP that accepts HTML emails."
    },
    {
      question: "What is Smart Preview?",
      answer: "Smart Preview (Starter and Pro plans) shows you how your emails will look in different email clients (Gmail, Outlook, Apple Mail, mobile) before you send them. This helps catch formatting issues early."
    },
    {
      question: "How does Auto-Translate work?",
      answer: "Auto-Translate (Pro plan only) lets you instantly localize your entire email sequence into multiple languages while maintaining tone, CTAs, and marketing effectiveness. Perfect for global campaigns."
    },
    {
      question: "What is Batch Campaigns?",
      answer: "Batch Campaigns (Pro plan only) allows you to upload multiple URLs at once and generate campaigns for all of them simultaneously. Ideal for agencies or businesses managing multiple products or clients."
    }
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      // In a real app, this would send to a support ticket system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Support ticket submitted! We'll get back to you within 24 hours.");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 border-b border-border/40 glass-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <MobileSidebar />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Support & Help Center</h1>
                <p className="text-sm text-muted-foreground">Get assistance from the Vayno team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8"
          >

            {/* Contact Support - Email Only */}
            <Card className="glass-card p-8 border-primary/20 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Get in Touch</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Have a question or need assistance? Our support team is here to help you get the most out of Vayno.
                </p>
                
                <Card className="glass-card p-6 border-primary/20 inline-block">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold mb-1">Email Support</p>
                      <a 
                        href="mailto:teamvayno@gmail.com" 
                        className="text-primary hover:underline font-medium"
                      >
                        teamvayno@gmail.com
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">We typically respond within 4-6 hours</p>
                    </div>
                  </div>
                </Card>

                <div className="mt-8 p-6 rounded-lg bg-muted/30 text-left">
                  <h3 className="font-semibold mb-3">📧 What to Include in Your Email</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>A clear subject line describing your issue or question</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Detailed description of the problem or feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Screenshots if relevant (helps us understand better)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Your account email or campaign ID if applicable</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* FAQs */}
            <Card className="glass-card p-6 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                  <p className="text-sm text-muted-foreground">Find quick answers to common questions</p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>

            {/* Additional Resources */}
            <Card className="glass-card p-6 border-primary/20">
              <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Book className="w-5 h-5 text-primary" />
                    Getting Started Guide
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    New to Vayno? Learn how to create your first campaign, understand sequence types, and export your emails.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span>Choose the right sequence type for your goal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span>Select optimal drip duration for engagement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span>Edit and customize generated content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span>Export to your email service provider</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Tips for Better Results
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Use clear, well-structured landing pages for better AI analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Include product descriptions, pricing, and key benefits on your page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Review and personalize the generated content before exporting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Use Smart Preview to check email rendering across devices</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Common Issues & Solutions
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Generation failed:</strong> Ensure URL is accessible and includes product information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Reached limit:</strong> Check Usage & Limits page or upgrade your plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Watermark removal:</strong> Upgrade to Starter or Pro plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Export issues:</strong> Try different browsers or contact support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Support;
