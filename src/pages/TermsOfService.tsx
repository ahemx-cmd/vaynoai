import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import vaynoIcon from "@/assets/vayno-icon.png";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={vaynoIcon} alt="Vayno" className="w-8 h-8" />
            <span className="font-bold text-xl">Vayno</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg">
              Last Updated: January 2025
            </p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Vayno ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access the Service. These Terms apply to all 
                visitors, users, and others who access or use the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Vayno reserves the right to update and change these Terms of Service by posting updates and changes to 
                the Vayno website. You are advised to check the Terms of Service from time to time for any updates or 
                changes that may impact you. Your continued use of the Service after any such changes constitutes your 
                acceptance of the new Terms of Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vayno is an AI-powered email sequence generation platform that enables users to create personalized 
                email campaigns based on their product or service URLs. The Service uses artificial intelligence to 
                analyze content and generate tailored email sequences designed to engage potential customers.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The Service includes, but is not limited to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>AI-powered email sequence generation</li>
                <li>Multiple sequence types (Cold Outreach, Product Launch, Onboarding, Re-engagement)</li>
                <li>Campaign management and organization</li>
                <li>Email customization and editing capabilities</li>
                <li>Translation services for multi-language campaigns</li>
                <li>Export functionality for email sequences</li>
                <li>Analytics and usage tracking</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. User Accounts and Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features of the Service, you must register for an account. When you register, you 
                agree to provide accurate, current, and complete information about yourself. You are responsible for 
                maintaining the confidentiality of your account password and for all activities that occur under your account.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You agree to immediately notify Vayno of any unauthorized use of your account or any other breach of 
                security. Vayno will not be liable for any loss or damage arising from your failure to comply with 
                this security obligation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may not use another person's account without permission. You may not use the Service if you are 
                under the age of 13, or if you have been previously banned from using the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Subscription Plans and Billing</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vayno offers various subscription plans with different features and usage limits. By subscribing to a 
                paid plan, you agree to pay all fees and charges associated with your subscription according to the 
                pricing and payment terms in effect at the time the fee or charge becomes payable.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All fees are non-refundable unless otherwise stated in writing by Vayno. Subscriptions automatically 
                renew at the end of each billing period unless you cancel your subscription before the renewal date. 
                You authorize Vayno to charge your payment method for the renewal subscription fees.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Vayno reserves the right to change its prices at any time. If we change our prices, we will provide 
                you with reasonable notice of such changes by posting the new prices on the Service and/or by sending 
                you an email notification. If you do not wish to pay the new prices, you may cancel your subscription 
                prior to the change going into effect.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Usage limits apply to each subscription plan. If you exceed your plan's limits, you may purchase 
                additional credits or upgrade to a higher-tier plan. Vayno reserves the right to suspend or terminate 
                accounts that consistently exceed usage limits without upgrading.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Acceptable Use Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or 
                impairs the Service. Prohibited activities include, but are not limited to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on the intellectual property rights of others</li>
                <li>Transmitting spam, junk mail, chain letters, or unsolicited communications</li>
                <li>Uploading or sharing malicious code, viruses, or any harmful content</li>
                <li>Attempting to gain unauthorized access to the Service or related systems</li>
                <li>Interfering with or disrupting the Service or servers</li>
                <li>Creating multiple accounts to abuse free trial periods or circumvent usage limits</li>
                <li>Using the Service to send fraudulent, misleading, or deceptive messages</li>
                <li>Harvesting or collecting user information without consent</li>
                <li>Reverse engineering, decompiling, or attempting to extract source code</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Vayno reserves the right to investigate and take appropriate legal action against anyone who violates 
                this provision, including removing the offending content, suspending or terminating the account of 
                such violators, and reporting them to law enforcement authorities.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Intellectual Property Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are owned by Vayno and are protected 
                by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You retain all rights to the content you input into the Service, including product URLs, brand 
                information, and any customizations you make to generated email sequences. However, by using the 
                Service, you grant Vayno a non-exclusive, worldwide, royalty-free license to use, store, and process 
                your content solely for the purpose of providing and improving the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The email sequences generated by Vayno's AI belong to you once created. You may use, modify, and 
                distribute these email sequences as you see fit for your business purposes. However, you may not 
                resell or redistribute the Service itself or claim to provide Vayno's Services as your own.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. AI-Generated Content and Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vayno uses artificial intelligence to generate email sequences. While we strive for accuracy and 
                relevance, AI-generated content may not always be perfect, accurate, or suitable for your specific needs.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>AI-generated content should be reviewed and edited before use</li>
                <li>Vayno does not guarantee the accuracy, completeness, or usefulness of generated content</li>
                <li>You are solely responsible for the content you send using email sequences generated by Vayno</li>
                <li>Vayno is not liable for any consequences resulting from the use of AI-generated content</li>
                <li>Generated content should comply with all applicable laws and regulations in your jurisdiction</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Data Privacy and Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, 
                and protect your personal information. By using the Service, you consent to our collection and use of 
                your data as described in the Privacy Policy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Vayno implements industry-standard security measures to protect your data. However, no method of 
                transmission over the Internet or electronic storage is 100% secure. While we strive to protect your 
                personal information, we cannot guarantee its absolute security.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the security of your account credentials and for all activities 
                that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Third-Party Services and Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service may contain links to third-party websites or services that are not owned or controlled by 
                Vayno. We have no control over and assume no responsibility for the content, privacy policies, or 
                practices of any third-party websites or services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You acknowledge and agree that Vayno shall not be responsible or liable, directly or indirectly, for 
                any damage or loss caused or alleged to be caused by or in connection with the use of any such content, 
                goods, or services available on or through any such third-party websites or services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Service Availability and Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vayno strives to provide reliable and continuous service, but we do not guarantee that the Service 
                will be available at all times. The Service may be temporarily unavailable due to maintenance, updates, 
                or circumstances beyond our control.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time 
                with or without notice. We will not be liable to you or any third party for any modification, suspension, 
                or discontinuance of the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">11. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Vayno and its affiliates, officers, employees, agents, partners, 
                and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, 
                resulting from:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Your access to or use of (or inability to access or use) the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Vayno's total liability to you for all damages, losses, and causes of action exceed 
                the amount you paid to Vayno in the twelve (12) months prior to the claim.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">12. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless Vayno and its affiliates, officers, directors, 
                employees, agents, and licensors from and against any claims, liabilities, damages, judgments, awards, 
                losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Your violation of these Terms</li>
                <li>Your use or misuse of the Service</li>
                <li>Your violation of any rights of another party</li>
                <li>Content you submit, post, or transmit through the Service</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">13. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice 
                or liability, for any reason, including without limitation if you breach these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms 
                which by their nature should survive termination shall survive, including ownership provisions, warranty 
                disclaimers, indemnity, and limitations of liability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your account at any time by contacting us. Upon cancellation, you will not be charged 
                for subsequent billing periods, but no refunds will be provided for the current billing period.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">14. Governing Law and Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in 
                which Vayno is registered, without regard to its conflict of law provisions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising out of or relating to these Terms or the Service shall be resolved through 
                binding arbitration in accordance with the rules of the applicable arbitration association, except 
                that either party may seek injunctive relief in a court of competent jurisdiction.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">15. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
                provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material 
                change will be determined at our sole discretion.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By continuing to access or use the Service after any revisions become effective, you agree to be bound 
                by the revised terms. If you do not agree to the new terms, you must stop using the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">16. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-primary font-medium">
                Email: teamvaynosupport@gmail.com
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-border/50">
              <p className="text-muted-foreground leading-relaxed">
                By using Vayno, you acknowledge that you have read, understood, and agree to be bound by these Terms 
                of Service. If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-lg mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <img src={vaynoIcon} alt="Vayno" className="w-10 h-10" />
              <span className="font-bold text-xl">Vayno</span>
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

export default TermsOfService;
