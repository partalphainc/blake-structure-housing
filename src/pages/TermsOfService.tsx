const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto max-w-3xl py-16 px-4">
      <h1 className="text-3xl font-serif font-bold mb-8">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-4">Effective Date: March 9, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">By accessing or using C. Blake Enterprise's website and services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Services</h2>
          <p className="text-muted-foreground">C. Blake Enterprise provides structured residential housing solutions, property management services, and related portals for residents, investors, and administrators. All housing is provided under documented agreements.</p>
          <p className="text-muted-foreground mt-2">Message and data rates may apply. Message frequency varies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Program Description</h2>
          <p className="text-muted-foreground">Users can expect to receive informational updates regarding housing applications, appointment reminders, and lease documents.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Opt-Out Instructions</h2>
          <p className="text-muted-foreground">You can cancel the SMS service at any time. Just text <strong>STOP</strong> to our number. After you send the SMS message <strong>STOP</strong> to us, we will send you an SMS message to confirm that you have been unsubscribed.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Help Instructions</h2>
          <p className="text-muted-foreground">If you are experiencing issues with the messaging program you can reply with the keyword <strong>HELP</strong> for more assistance, or you can get help directly at <a href="mailto:support@cblakeent.com" className="text-primary underline">support@cblakeent.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Fees</h2>
          <p className="text-muted-foreground">Carriers are not liable for delayed or undelivered messages. As always, message and data rates may apply for any messages sent to you from us and to us from you.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Frequency</h2>
          <p className="text-muted-foreground">Message frequency varies based on your interaction with our housing application process.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. User Accounts</h2>
          <p className="text-muted-foreground">You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and notify us immediately of any unauthorized access to your account.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Acceptable Use</h2>
          <p className="text-muted-foreground">You agree not to misuse our services, submit false information on applications, interfere with the operation of the platform, or violate any applicable laws or regulations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Housing Agreements</h2>
          <p className="text-muted-foreground">All housing placements are governed by separate lease or structured housing agreements. These Terms of Service do not replace or modify any housing agreement you may enter into with C. Blake Enterprise.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. Limitation of Liability</h2>
          <p className="text-muted-foreground">C. Blake Enterprise is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you have paid to us in the preceding 12 months.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">12. Termination</h2>
          <p className="text-muted-foreground">We may suspend or terminate your access to our services at any time for violation of these terms or applicable housing agreements, with notice as required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">13. Equal Housing</h2>
          <p className="text-muted-foreground">C. Blake Enterprise is committed to equal housing opportunity. We do not discriminate on the basis of race, color, religion, sex, national origin, disability, or familial status.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">14. Contact</h2>
          <p className="text-muted-foreground">For questions about these Terms, contact us at <a href="mailto:info@cblakeenterprise.com" className="text-primary underline">info@cblakeenterprise.com</a>.</p>
        </section>
      </div>

      <div className="mt-10">
        <a href="/" className="text-primary underline text-sm">← Back to Home</a>
      </div>
    </div>
  </div>
);

export default TermsOfService;
