const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-xl font-bold tracking-tight">
              C. Blake <span className="text-gradient">Enterprise</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              Built With Vision. Managed With Structure.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Equal Housing</a>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} C. Blake Enterprise. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>🏠</span> Equal Housing Opportunity
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
