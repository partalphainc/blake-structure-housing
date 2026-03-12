import cblakeLogo from "@/assets/cblake-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src={cblakeLogo} alt="C. Blake Enterprise" className="w-8 h-8 object-contain" />
              <p className="text-xl font-serif font-bold tracking-tight">
                C. Blake <span className="text-gradient">Enterprise</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Residential Housing & Asset Optimization
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              Built With Vision. Managed With Structure.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Equal Housing</a>
          </div>
        </div>

        <div className="separator-pink mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} C. Blake Enterprise. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>🏠</span> Equal Housing Opportunity
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <a href="https://crystalkblake.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline underline-offset-2">crystalkblake.com</a>
          <span className="hidden sm:inline">·</span>
          <a href="https://partalphadevelopment.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline underline-offset-2">partalphadevelopment.com</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
