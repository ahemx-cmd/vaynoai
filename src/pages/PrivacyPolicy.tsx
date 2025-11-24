import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import vaynoIcon from "@/assets/vayno-icon.png";

const PrivacyPolicy = () => {
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last Updated: January 2025
            </p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Vayno. We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our AI-powered email sequence generation service ("Service").
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use 
                of information in accordance with this policy. If you do not agree with our policies and practices, 
                please do not use the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect various types of information to provide and improve our Service to you:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6">2.1 Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you register for an account, we collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Email address (required for account creation and communication)</li>
                <li>Full name (optional, for personalization)</li>
                <li>Password (encrypted and securely stored)</li>
                <li>Profile picture (optional)</li>
                <li>Company or business information (optional)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">2.2 Business and Campaign Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you use our Service to create email campaigns, we collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Product or service URLs you provide for analysis</li>
                <li>Campaign names and descriptions</li>
                <li>Brand guidelines and preferences</li>
                <li>Generated email sequences and any edits you make</li>
                <li>Campaign settings (sequence type, duration, CTA preferences)</li>
                <li>Target audience information you provide</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">2.3 Usage and Analytics Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect certain information about your interaction with the Service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Usage statistics (campaigns created, emails generated, features used)</li>
                <li>Device information (browser type, operating system, device identifiers)</li>
                <li>IP address and general location information</li>
                <li>Log data (access times, pages viewed, app features accessed)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Performance data and error reports</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">2.4 Payment and Billing Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                For paid subscriptions, we collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Billing address and contact information</li>
                <li>Payment method details (processed securely through third-party payment processors)</li>
                <li>Transaction history and invoices</li>
                <li>Subscription plan and usage tier</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Note: We do not directly store full credit card numbers. Payment processing is handled by secure 
                third-party payment processors who comply with PCI-DSS standards.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">2.5 Communications</h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect information from your communications with us:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Support tickets and help requests</li>
                <li>Feedback and survey responses</li>
                <li>Email correspondence</li>
                <li>Comments or reviews you provide</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect for various purposes, including:
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">3.1 Service Provision and Improvement</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Providing, operating, and maintaining the Service</li>
                <li>Generating AI-powered email sequences based on your inputs</li>
                <li>Personalizing your experience and improving Service functionality</li>
                <li>Developing new features and services</li>
                <li>Analyzing usage patterns to optimize performance</li>
                <li>Training and improving our AI models</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">3.2 Account Management</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Creating and managing your account</li>
                <li>Authenticating users and preventing unauthorized access</li>
                <li>Processing subscriptions and managing billing</li>
                <li>Enforcing usage limits and subscription terms</li>
                <li>Providing customer support</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">3.3 Communication</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Sending transactional emails (account confirmations, password resets, invoices)</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Sending service updates, feature announcements, and important notices</li>
                <li>Marketing communications (only with your consent, with easy opt-out options)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">3.4 Security and Compliance</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Detecting and preventing fraud, abuse, and security incidents</li>
                <li>Monitoring and analyzing security threats</li>
                <li>Enforcing our Terms of Service</li>
                <li>Complying with legal obligations and responding to legal requests</li>
                <li>Protecting the rights and safety of our users and others</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">3.5 Analytics and Research</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Understanding how users interact with the Service</li>
                <li>Conducting research to improve our AI technology</li>
                <li>Generating aggregate statistics and insights (anonymized)</li>
                <li>Testing new features and functionality</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. How We Share Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">4.1 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                We work with third-party service providers who perform services on our behalf:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Cloud hosting and infrastructure providers (for data storage and processing)</li>
                <li>Payment processors (for handling transactions securely)</li>
                <li>Email service providers (for transactional and marketing emails)</li>
                <li>Analytics providers (for usage analytics and performance monitoring)</li>
                <li>AI and machine learning service providers (for email generation)</li>
                <li>Customer support tools</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                These service providers have access to your information only to perform specific tasks on our behalf 
                and are obligated not to disclose or use it for any other purpose.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">4.2 Business Transfers</h3>
              <p className="text-muted-foreground leading-relaxed">
                If Vayno is involved in a merger, acquisition, asset sale, or bankruptcy, your information may be 
                transferred as part of that transaction. We will notify you via email and/or prominent notice on our 
                Service of any change in ownership or uses of your personal information.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">4.3 Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose your information if required to do so by law or in response to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Valid legal processes (subpoenas, court orders, search warrants)</li>
                <li>Government or regulatory requests</li>
                <li>Protecting the rights, property, or safety of Vayno, our users, or others</li>
                <li>Enforcing our Terms of Service</li>
                <li>Investigating potential violations or fraud</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">4.4 With Your Consent</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share your information with third parties when you give us explicit consent to do so, such as 
                when you choose to integrate Vayno with other services or share campaigns with collaborators.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">4.5 Aggregated or Anonymized Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share aggregated or anonymized information that cannot reasonably be used to identify you. 
                This includes statistical data about Service usage, trends, and insights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Encryption of data in transit using SSL/TLS protocols</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication for internal systems</li>
                <li>Employee training on data protection and security</li>
                <li>Incident response procedures</li>
                <li>Regular backups to prevent data loss</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
                strive to use commercially acceptable means to protect your personal information, we cannot guarantee 
                its absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide the Service and fulfill the 
                purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Specifically:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Account information: Retained until you delete your account, plus 30 days for recovery</li>
                <li>Campaign data: Retained while your account is active, plus 90 days after deletion</li>
                <li>Usage logs: Retained for up to 2 years for security and analytics purposes</li>
                <li>Billing records: Retained for 7 years to comply with tax and accounting regulations</li>
                <li>Support communications: Retained for 3 years</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                After the retention period expires, we will securely delete or anonymize your personal information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Your Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">7.1 Access and Portability</h3>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to request access to the personal information we hold about you and to receive a 
                copy of your data in a portable format.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">7.2 Correction</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can update or correct your personal information at any time through your account settings or by 
                contacting us.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">7.3 Deletion</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can request deletion of your personal information. We will comply with your request unless we have 
                a legitimate reason to retain the information, such as legal obligations or pending transactions.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">7.4 Opt-Out of Marketing</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can opt out of marketing communications at any time by clicking the "unsubscribe" link in emails 
                or by updating your communication preferences in your account settings.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">7.5 Object to Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may object to certain types of processing of your personal information, such as processing for 
                direct marketing purposes.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">7.6 Restrict Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may request that we restrict the processing of your personal information in certain circumstances.
              </p>

              <p className="text-muted-foreground leading-relaxed mt-6">
                To exercise any of these rights, please contact us at teamvaynosupport@gmail.com. We will respond to 
                your request within 30 days.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to collect and track information about your use of 
                the Service. Cookies are small data files stored on your device.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">8.1 Types of Cookies We Use</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the Service to function properly (authentication, security)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Track your activity for advertising purposes (with your consent)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">8.2 Managing Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings. However, disabling certain cookies may limit 
                your ability to use some features of the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Third-Party Services and Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service may contain links to third-party websites or integrate with third-party services. We are 
                not responsible for the privacy practices of these third parties. We encourage you to review their 
                privacy policies before providing any personal information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is not intended for children under the age of 13. We do not knowingly collect personal 
                information from children under 13. If we become aware that we have collected personal information 
                from a child under 13, we will take steps to delete such information.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">11. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                These countries may have data protection laws that are different from the laws of your country.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We take appropriate measures to ensure that your personal information receives an adequate level of 
                protection in the jurisdictions in which we process it, including through the use of standard 
                contractual clauses or other approved transfer mechanisms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">12. California Privacy Rights (CCPA)</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are a California resident, you have specific rights regarding your personal information under 
                the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information held by us</li>
                <li>Right to opt-out of the sale of personal information (Note: We do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your CCPA rights</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, please contact us at teamvaynosupport@gmail.com.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">13. GDPR Compliance (European Users)</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the European Economic Area (EEA), you have rights under the General Data 
                Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Right of access to your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restriction of processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Rights related to automated decision-making and profiling</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Our legal basis for processing your personal information includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Performance of a contract (providing the Service)</li>
                <li>Legitimate interests (improving the Service, security, fraud prevention)</li>
                <li>Your consent (marketing communications, optional features)</li>
                <li>Legal obligations (compliance with laws)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">14. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, 
                legal requirements, or other factors. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Posting the updated Privacy Policy on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a prominent notice on the Service</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We encourage you to review this Privacy Policy periodically. Your continued use of the Service after 
                any changes constitutes your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">15. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <div className="space-y-2 mt-4">
                <p className="text-foreground font-medium">Vayno Privacy Team</p>
                <p className="text-primary font-medium">
                  Email: teamvaynosupport@gmail.com
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-6">
                We will respond to your inquiry within 30 days and work with you to resolve any concerns.
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-border/50">
              <p className="text-muted-foreground leading-relaxed">
                By using Vayno, you acknowledge that you have read and understood this Privacy Policy and agree to 
                the collection, use, and disclosure of your information as described herein.
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

export default PrivacyPolicy;
