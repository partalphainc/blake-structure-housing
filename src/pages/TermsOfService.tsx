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
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
          <p className="text-muted-foreground">You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and notify us immediately of any unauthorized access to your account.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Acceptable Use</h2>
          <p className="text-muted-foreground">You agree not to misuse our services, submit false information on applications, interfere with the operation of the platform, or violate any applicable laws or regulations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Housing Agreements</h2>
          <p className="text-muted-foreground">All housing placements are governed by separate lease or structured housing agreements. These Terms of Service do not replace or modify any housing agreement you may enter into with C. Blake Enterprise.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
          <p className="text-muted-foreground">C. Blake Enterprise is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you have paid to us in the preceding 12 months.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
          <p className="text-muted-foreground">We may suspend or terminate your access to our services at any time for violation of these terms or applicable housing agreements, with notice as required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Equal Housing</h2>
          <p className="text-muted-foreground">C. Blake Enterprise is committed to equal housing opportunity. We do not discriminate on the basis of race, color, religion, sex, national origin, disability, or familial status.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
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
