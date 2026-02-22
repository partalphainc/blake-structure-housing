import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Home, UserPen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileEditDialog from "@/components/portal/ProfileEditDialog";
import cblakeLogo from "@/assets/cblake-logo.png";

interface PortalLayoutProps {
  children: ReactNode;
  title: string;
  navItems: { label: string; href: string; icon: ReactNode }[];
  onSignOut: () => void;
  userName?: string;
  userId?: string;
}

const PortalLayout = ({ children, title, navItems, onSignOut, userName, userId }: PortalLayoutProps) => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img src={cblakeLogo} alt="C. Blake" className="w-8 h-8 object-contain" />
          <span className="font-serif font-bold text-foreground text-sm md:text-base">
            {title}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {userName && (
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors hidden md:flex"
            >
              <UserPen className="w-3.5 h-3.5" />
              {userName}
            </button>
          )}
          {/* Mobile profile edit button */}
          <Button variant="ghost" size="icon" onClick={() => setProfileOpen(true)} className="text-muted-foreground md:hidden">
            <UserPen className="w-4 h-4" />
          </Button>
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={onSignOut} className="text-muted-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 flex-col fixed left-0 top-16 bottom-0 border-r border-border bg-card/50 p-4 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${
                location.pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 md:ml-56 p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {userId && (
        <ProfileEditDialog open={profileOpen} onOpenChange={setProfileOpen} userId={userId} />
      )}
    </div>
  );
};

export default PortalLayout;
