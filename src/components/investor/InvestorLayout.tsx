import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, BarChart3, Wallet, Users, Wrench,
  ClipboardList, FileBarChart, MessageSquare, FolderOpen, Bot,
  Settings, Star, LifeBuoy, Bell, Download, Menu, X, LogOut, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import cblakeLogo from "@/assets/cblake-logo.png";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/investor", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Properties", href: "/investor/properties", icon: <Building2 className="w-4 h-4" /> },
  { label: "Financials", href: "/investor/financials", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Payouts", href: "/investor/payouts", icon: <Wallet className="w-4 h-4" /> },
  { label: "Tenants", href: "/investor/tenants", icon: <Users className="w-4 h-4" /> },
  { label: "Maintenance", href: "/investor/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Inspections", href: "/investor/inspections", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Reports", href: "/investor/reports", icon: <FileBarChart className="w-4 h-4" /> },
  { label: "Messages", href: "/investor/messages", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Documents", href: "/investor/documents", icon: <FolderOpen className="w-4 h-4" /> },
  { label: "AI Assistant", href: "/investor/ai-assistant", icon: <Bot className="w-4 h-4" /> },
  { label: "Settings", href: "/investor/settings", icon: <Settings className="w-4 h-4" /> },
  { label: "Leave Review", href: "/investor/review", icon: <Star className="w-4 h-4" /> },
  { label: "Support", href: "/investor/support", icon: <LifeBuoy className="w-4 h-4" /> },
];

const mobileNavItems = navItems.slice(0, 5);

interface InvestorLayoutProps {
  children: ReactNode;
  userName?: string;
  userId?: string;
  onSignOut: () => void;
}

const InvestorLayout = ({ children, userName, userId, onSignOut }: InvestorLayoutProps) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "IN";

  const isActive = (href: string) =>
    href === "/investor" ? location.pathname === "/investor" : location.pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#faf8f8]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#f0e8ea] z-40 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#f0e8ea]">
          <img src={cblakeLogo} alt="C. Blake Enterprise" className="w-9 h-9 object-contain" />
          <div>
            <p className="font-serif font-bold text-[#2c2c2c] text-sm leading-tight">C. Blake</p>
            <p className="text-[10px] text-[#9b8a8d] tracking-wide uppercase">Enterprise</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-[#b8a4a8] uppercase tracking-widest px-3 mb-2">Investor Portal</p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive(item.href)
                  ? "bg-[#d4738a]/10 text-[#d4738a] font-semibold"
                  : "text-[#6b5b5e] hover:text-[#2c2c2c] hover:bg-[#faf0f2]"
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${isActive(item.href) ? "text-[#d4738a]" : "text-[#b8a4a8] group-hover:text-[#d4738a]"}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive(item.href) && <ChevronRight className="w-3 h-3 ml-auto text-[#d4738a]" />}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-[#f0e8ea]">
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 text-sm text-[#9b8a8d] hover:text-[#d4738a] transition-colors w-full px-3 py-2 rounded-lg hover:bg-[#faf0f2]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`md:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e8ea]">
          <div className="flex items-center gap-3">
            <img src={cblakeLogo} alt="C. Blake Enterprise" className="w-8 h-8 object-contain" />
            <div>
              <p className="font-serif font-bold text-[#2c2c2c] text-sm">C. Blake Enterprise</p>
              <p className="text-[10px] text-[#9b8a8d]">Investor Portal</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="text-[#9b8a8d] hover:text-[#2c2c2c]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="overflow-y-auto py-4 px-3 space-y-0.5 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive(item.href)
                  ? "bg-[#d4738a]/10 text-[#d4738a] font-semibold"
                  : "text-[#6b5b5e] hover:text-[#2c2c2c] hover:bg-[#faf0f2]"
              }`}
            >
              <span className={isActive(item.href) ? "text-[#d4738a]" : "text-[#b8a4a8]"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#f0e8ea]">
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 text-sm text-[#9b8a8d] hover:text-[#d4738a] transition-colors w-full px-3 py-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#f0e8ea] flex items-center gap-3 px-4 md:px-6 h-16 shadow-sm">
          {/* Hamburger */}
          <button
            className="md:hidden text-[#6b5b5e] hover:text-[#d4738a] transition-colors"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page label on mobile */}
          <div className="md:hidden flex-1">
            <span className="font-serif font-bold text-[#2c2c2c] text-sm">Investor Portal</span>
          </div>

          {/* Spacer on desktop */}
          <div className="hidden md:block flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-[#9b8a8d] hover:text-[#d4738a] hover:bg-[#faf0f2] transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d4738a] rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-[#f0e8ea] z-50 p-4">
                  <p className="font-semibold text-sm text-[#2c2c2c] mb-3">Notifications</p>
                  <div className="space-y-2">
                    {[
                      { msg: "Payout of $5,920 scheduled for Mar 28", time: "2h ago", dot: "bg-[#d4738a]" },
                      { msg: "Lease ending soon — Unit 2B, Oak Ave", time: "1d ago", dot: "bg-amber-400" },
                      { msg: "Maintenance completed — HVAC repair", time: "2d ago", dot: "bg-green-400" },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-[#f0e8ea] last:border-0">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                        <div>
                          <p className="text-xs text-[#2c2c2c]">{n.msg}</p>
                          <p className="text-[10px] text-[#9b8a8d] mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="text-xs text-[#d4738a] mt-2 hover:underline">
                    Dismiss all
                  </button>
                </div>
              )}
            </div>

            {/* Message Mgmt Button */}
            <Link to="/investor/messages">
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:flex items-center gap-1.5 border-[#d4738a]/30 text-[#d4738a] hover:bg-[#d4738a]/5 hover:border-[#d4738a] text-xs h-8"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Message Management</span>
                <span className="lg:hidden">Message</span>
              </Button>
            </Link>

            {/* Download Statement */}
            <Link to="/investor/payouts">
              <Button
                size="sm"
                className="hidden sm:flex items-center gap-1.5 bg-[#d4738a] hover:bg-[#c4637a] text-white text-xs h-8"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Download Statement</span>
                <span className="lg:hidden">Statement</span>
              </Button>
            </Link>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#f0e8ea]">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-[#2c2c2c] leading-tight">{userName || "Investor"}</p>
                <p className="text-[10px] text-[#9b8a8d]">Property Owner</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4738a] to-[#c4637a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#f0e8ea] flex justify-around items-center py-2 px-2 shadow-lg">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors min-w-0 ${
              isActive(item.href) ? "text-[#d4738a]" : "text-[#9b8a8d]"
            }`}
          >
            <span className={isActive(item.href) ? "text-[#d4738a]" : "text-[#b8a4a8]"}>{item.icon}</span>
            <span className="text-[10px] truncate max-w-[52px]">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 px-2 py-1 text-[#9b8a8d]"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>
    </div>
  );
};

export default InvestorLayout;
