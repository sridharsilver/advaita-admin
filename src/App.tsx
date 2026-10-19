import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";

// Lazy-loaded Admin route components
const Login = lazy(() => import("@/pages/admin/Login").then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard").then(m => ({ default: m.Dashboard })));
const PortfolioManager = lazy(() => import("@/pages/admin/PortfolioManager").then(m => ({ default: m.PortfolioManager })));
const TestimonialsManager = lazy(() => import("@/pages/admin/TestimonialsManager").then(m => ({ default: m.TestimonialsManager })));
const InquiriesManager = lazy(() => import("@/pages/admin/InquiriesManager").then(m => ({ default: m.InquiriesManager })));
const ProposalsManager = lazy(() => import("@/pages/admin/ProposalsManager").then(m => ({ default: m.ProposalsManager })));
const SettingsManager = lazy(() => import("@/pages/admin/SettingsManager").then(m => ({ default: m.SettingsManager })));
const ProposalBuilder = lazy(() => import("@/pages/admin/ProposalBuilder").then(m => ({ default: m.ProposalBuilder })));
const ClientsManager = lazy(() => import("@/pages/admin/ClientsManager").then(m => ({ default: m.ClientsManager })));
const AgreementsManager = lazy(() => import("@/pages/admin/AgreementsManager").then(m => ({ default: m.AgreementsManager })));
const ProjectsManager = lazy(() => import("@/pages/admin/ProjectsManager").then(m => ({ default: m.ProjectsManager })));
const InvoicesManager = lazy(() => import("@/pages/admin/InvoicesManager").then(m => ({ default: m.InvoicesManager })));
const RequirementsManager = lazy(() => import("@/pages/admin/RequirementsManager").then(m => ({ default: m.RequirementsManager })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Quick Redirects to Admin Root */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="portfolio" element={<PortfolioManager />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="inquiries" element={<InquiriesManager />} />
            <Route path="proposals" element={<ProposalsManager />} />
            <Route path="agreements" element={<AgreementsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="invoices" element={<InvoicesManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="clients" element={<ClientsManager />} />
            <Route path="requirements" element={<RequirementsManager />} />
            <Route path="proposals/new" element={<ProposalBuilder />} />
            <Route path="proposals/edit/:id" element={<ProposalBuilder />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
