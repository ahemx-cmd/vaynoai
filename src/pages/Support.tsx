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
import { MessageCircle, Mail, Book, Video, HelpCircle, Send, ExternalLink } from "lucide-react";
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
            {/* Quick Help Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="glass-card p-6 border-primary/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive guides and tutorials to help you master Vayno.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Docs
                </Button>
              </Card>

              <Card className="glass-card p-6 border-primary/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Step-by-step video guides showing you how to use every feature.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Videos
                </Button>
              </Card>

              <Card className="glass-card p-6 border-primary/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant help from our support team during business hours.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </Card>
            </div>

            {/* Contact Support Form */}
            <Card className="glass-card p-6 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Contact Support</h2>
                  <p className="text-sm text-muted-foreground">Submit a ticket and we'll respond within 24 hours</p>
                </div>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please provide detailed information about your issue or question..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Submit Ticket"}
                </Button>
              </form>
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

            {/* Contact Information */}
            <Card className="glass-card p-6 border-primary/20">
              <h2 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h2>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@vayno.com</p>
                    <p className="text-xs text-muted-foreground mt-1">Average response time: 4-6 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available Monday-Friday, 9 AM - 6 PM EST</p>
                    <p className="text-xs text-muted-foreground mt-1">Instant responses during business hours</p>
                  </div>
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
