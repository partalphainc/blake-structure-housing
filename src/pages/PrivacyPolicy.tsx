const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto max-w-3xl py-16 px-4">
      <h1 className="text-3xl font-serif font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-4">Effective Date: March 9, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p className="text-muted-foreground">We collect personal information you provide when applying for housing, creating an account, or contacting us. This may include your name, email address, phone number, government-issued identification, proof of income, and rental history.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">We use your information to process housing applications, manage lease agreements, facilitate maintenance requests, communicate important updates, and comply with legal obligations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Information Sharing</h2>
          <p className="text-muted-foreground">We do not sell your personal information. We may share information with property owners/investors (limited to what is necessary for property management), service providers who assist our operations, and law enforcement when required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
          <p className="text-muted-foreground">We implement industry-standard security measures to protect your personal information, including encrypted data storage, secure authentication, and role-based access controls.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Data Retention</h2>
          <p className="text-muted-foreground">We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Documents and records related to housing agreements are retained per applicable regulations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
          <p className="text-muted-foreground">You may request access to, correction of, or deletion of your personal information by contacting us. We will respond to verified requests within 30 days.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
          <p className="text-muted-foreground">For questions about this Privacy Policy, contact us at <a href="mailto:info@cblakeenterprise.com" className="text-primary underline">info@cblakeenterprise.com</a>.</p>
        </section>
      </div>

      <div className="mt-10">
        <a href="/" className="text-primary underline text-sm">← Back to Home</a>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
