import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cblakeLogo from "@/assets/cblake-logo.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "For Residents", href: "#residents" },
  { label: "For Investors", href: "#investors" },
  { label: "Available Units", href: "#units" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Promo banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground text-center py-2 px-4">
        <p className="text-xs sm:text-sm font-semibold tracking-wide">
          🎉 Special: Application Fee Waived — <button onClick={() => window.dispatchEvent(new CustomEvent("openApplication"))} className="underline underline-offset-2 hover:opacity-80">Apply Now</button>
        </p>
      </div>

      <nav className="fixed top-8 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/admin-login" className="flex items-center gap-3">
            <img src={cblakeLogo} alt="C. Blake Enterprise" className="w-10 h-10 object-contain" />
            <span className="text-lg font-serif font-bold tracking-tight text-foreground">
              C. Blake <span className="text-gradient">Enterprise</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">
                <LogIn size={16} className="mr-2" />
                Portal Login
              </Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background border-b border-border overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.label}
                  </a>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <LogIn size={16} className="mr-2" />
                    Portal Login
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
