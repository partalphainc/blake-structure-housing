import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import ResidentPayments from "./pages/resident/ResidentPayments";
import ResidentMaintenance from "./pages/resident/ResidentMaintenance";
import ResidentDocuments from "./pages/resident/ResidentDocuments";
import ResidentUpload from "./pages/resident/ResidentUpload";
import ResidentMessages from "./pages/resident/ResidentMessages";
import ResidentReview from "./pages/resident/ResidentReview";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import InvestorProperties from "./pages/investor/InvestorProperties";
import InvestorFinancials from "./pages/investor/InvestorFinancials";
import InvestorPayouts from "./pages/investor/InvestorPayouts";
import InvestorTenants from "./pages/investor/InvestorTenants";
import InvestorMaintenance from "./pages/investor/InvestorMaintenance";
import InvestorDocuments from "./pages/investor/InvestorDocuments";
import InvestorInspections from "./pages/investor/InvestorInspections";
import InvestorReports from "./pages/investor/InvestorReports";
import InvestorMessages from "./pages/investor/InvestorMessages";
import InvestorReview from "./pages/investor/InvestorReview";
import InvestorAIAssistant from "./pages/investor/InvestorAIAssistant";
import InvestorSettings from "./pages/investor/InvestorSettings";
import InvestorSupport from "./pages/investor/InvestorSupport";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminUnits from "./pages/admin/AdminUnits";
import AdminLeases from "./pages/admin/AdminLeases";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminMaintenance from "./pages/admin/AdminMaintenance";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTenants from "./pages/admin/AdminTenants";
import AdminInvestors from "./pages/admin/AdminInvestors";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminOAuthCallback from "./pages/admin/AdminOAuthCallback";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminAccounting from "./pages/admin/AdminAccounting";
import AdminReports from "./pages/admin/AdminReports";
import AdminInspections from "./pages/admin/AdminInspections";
import AdminMessaging from "./pages/admin/AdminMessaging";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminMedia from "./pages/admin/AdminMedia";
import Trial from "./pages/Trial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/trial" element={<Trial />} />

          {/* Resident Portal */}
          <Route path="/resident" element={<ResidentDashboard />} />
          <Route path="/resident/payments" element={<ResidentPayments />} />
          <Route path="/resident/maintenance" element={<ResidentMaintenance />} />
          <Route path="/resident/messages" element={<ResidentMessages />} />
          <Route path="/resident/documents" element={<ResidentDocuments />} />
          <Route path="/resident/upload" element={<ResidentUpload />} />
          <Route path="/resident/review" element={<ResidentReview />} />

          {/* Investor Portal */}
          <Route path="/investor" element={<InvestorDashboard />} />
          <Route path="/investor/properties" element={<InvestorProperties />} />
          <Route path="/investor/financials" element={<InvestorFinancials />} />
          <Route path="/investor/payouts" element={<InvestorPayouts />} />
          <Route path="/investor/tenants" element={<InvestorTenants />} />
          <Route path="/investor/maintenance" element={<InvestorMaintenance />} />
          <Route path="/investor/documents" element={<InvestorDocuments />} />
          <Route path="/investor/inspections" element={<InvestorInspections />} />
          <Route path="/investor/reports" element={<InvestorReports />} />
          <Route path="/investor/messages" element={<InvestorMessages />} />
          <Route path="/investor/review" element={<InvestorReview />} />
          <Route path="/investor/ai-assistant" element={<InvestorAIAssistant />} />
          <Route path="/investor/settings" element={<InvestorSettings />} />
          <Route path="/investor/support" element={<InvestorSupport />} />

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tenants" element={<AdminTenants />} />
          <Route path="/admin/investors" element={<AdminInvestors />} />
          <Route path="/admin/properties" element={<AdminProperties />} />
          <Route path="/admin/units" element={<AdminUnits />} />
          <Route path="/admin/leases" element={<AdminLeases />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/maintenance" element={<AdminMaintenance />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/activity" element={<AdminActivityLog />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/oauth-callback" element={<AdminOAuthCallback />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/vendors" element={<AdminVendors />} />
          <Route path="/admin/accounting" element={<AdminAccounting />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/inspections" element={<AdminInspections />} />
          <Route path="/admin/messaging" element={<AdminMessaging />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/crm" element={<AdminCRM />} />
          <Route path="/admin/media" element={<AdminMedia />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
