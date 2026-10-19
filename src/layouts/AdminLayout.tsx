import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { registerServiceWorker } from "@/lib/pushNotifications";
import { 
  LayoutDashboard, LogOut, Image, MessageSquare, 
  FileText, Settings, User, ExternalLink, Shield, Layers, 
  DollarSign, Users, ClipboardList, Plus, X, Sparkles, ChevronRight
} from "lucide-react";

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/admin") return "dashboard";
    if (path.startsWith("/admin/portfolio")) return "portfolio";
    if (path.startsWith("/admin/testimonials")) return "testimonials";
    if (path.startsWith("/admin/inquiries")) return "inquiries";
    if (path.startsWith("/admin/proposals")) return "proposals";
    if (path.startsWith("/admin/agreements")) return "agreements";
    if (path.startsWith("/admin/projects")) return "projects";
    if (path.startsWith("/admin/invoices")) return "invoices";
    if (path.startsWith("/admin/clients")) return "clients";
    if (path.startsWith("/admin/settings")) return "settings";
    if (path.startsWith("/admin/requirements")) return "requirements";
    return "dashboard";
  };
  const activeTab = getActiveTab();

  // Simple client-side check if token cookie exists
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = document.cookie.includes("admin_token=");
      if (!hasToken && location.pathname !== "/admin/login") {
        navigate("/admin/login");
      } else if (hasToken && location.pathname === "/admin/login") {
        navigate("/admin");
      } else if (hasToken) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, [location.pathname, navigate]);

  // Fetch quick unread badge count
  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/admin/messages")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : (data.data || []);
          const unread = list.filter((m: any) => m.status === "unread").length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  // Inject PWA manifest for admin pages
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = "/admin-manifest.json";
  }, []);

  // Register the service worker for push notifications
  useEffect(() => {
    if (isAuthenticated) {
      registerServiceWorker();
    }
  }, [isAuthenticated]);

  // Auto-close sheets on route change
  useEffect(() => {
    setShowMoreMenu(false);
    setShowQuickAdd(false);
  }, [location.pathname]);

  const handleLogout = () => {
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { to: "/admin/portfolio", label: "Portfolio", icon: Image, id: "portfolio" },
    { to: "/admin/testimonials", label: "Testimonials", icon: User, id: "testimonials" },
    { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, id: "inquiries", badge: unreadCount },
    { to: "/admin/proposals", label: "Proposals", icon: FileText, id: "proposals" },
    { to: "/admin/agreements", label: "Agreements", icon: Shield, id: "agreements" },
    { to: "/admin/projects", label: "Projects", icon: Layers, id: "projects" },
    { to: "/admin/invoices", label: "Invoices", icon: DollarSign, id: "invoices" },
    { to: "/admin/clients", label: "Clients", icon: Users, id: "clients" },
    { to: "/admin/requirements", label: "Requirements", icon: ClipboardList, id: "requirements" },
    { to: "/admin/settings", label: "Settings", icon: Settings, id: "settings" },
  ];

  if (loading) return null;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row tap-highlight-none selection:bg-primary/20">
        {/* Desktop Left Sidebar */}
        {isAuthenticated && (
          <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card fixed h-screen top-0 left-0 z-40">
            <div className="px-6 h-16 border-b border-border flex items-center gap-3 font-semibold">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="tracking-tight text-base font-bold block leading-none">Advaita Admin</span>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cloudflare D1 Live
                </span>
              </div>
            </div>
            
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Link 
                    key={item.to}
                    to={item.to} 
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border space-y-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Live Website
              </a>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${isAuthenticated ? "md:pl-64 pb-20 md:pb-0" : ""}`}>
          {/* Mobile Top App Bar */}
          {isAuthenticated && (
            <header className="border-b border-border/80 bg-background/85 sticky top-0 z-30 px-4 h-15 flex items-center justify-between backdrop-blur-xl safe-top">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="capitalize text-sm font-bold tracking-tight leading-none text-foreground">
                    {activeTab === "inquiries" ? "Inquiries" : activeTab === "requirements" ? "Requirements" : activeTab}
                  </h1>
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Quick Add Button */}
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                  aria-label="Quick Action"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <ThemeToggle />

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                  title="View Website"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </header>
          )}

          <main className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname + location.search}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Bottom Thumb Navigation Bar */}
        {isAuthenticated && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/80 flex items-center justify-around z-40 px-2 safe-bottom shadow-2xl">
            {/* 1. Dashboard */}
            <Link 
              to="/admin" 
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl active:scale-95 transition-all ${
                activeTab === "dashboard" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutDashboard className={`h-5 w-5 ${activeTab === "dashboard" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className="text-[10px] mt-1 font-medium">Home</span>
            </Link>

            {/* 2. Inquiries with Badge */}
            <Link 
              to="/admin/inquiries" 
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl relative active:scale-95 transition-all ${
                activeTab === "inquiries" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <MessageSquare className={`h-5 w-5 ${activeTab === "inquiries" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">Inquiries</span>
            </Link>

            {/* 3. Proposals */}
            <Link 
              to="/admin/proposals" 
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl active:scale-95 transition-all ${
                activeTab === "proposals" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className={`h-5 w-5 ${activeTab === "proposals" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className="text-[10px] mt-1 font-medium">Proposals</span>
            </Link>

            {/* 4. Projects */}
            <Link 
              to="/admin/projects" 
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl active:scale-95 transition-all ${
                activeTab === "projects" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className={`h-5 w-5 ${activeTab === "projects" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className="text-[10px] mt-1 font-medium">Projects</span>
            </Link>

            {/* 5. More Menu Button */}
            <button
              onClick={() => setShowMoreMenu(true)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl active:scale-95 transition-all ${
                showMoreMenu ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="h-5 w-5 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-sm bg-current" />
                  <span className="h-1.5 w-1.5 rounded-sm bg-current" />
                  <span className="h-1.5 w-1.5 rounded-sm bg-current" />
                  <span className="h-1.5 w-1.5 rounded-sm bg-current" />
                </div>
              </div>
              <span className="text-[10px] mt-1 font-medium">Menu</span>
            </button>
          </nav>
        )}

        {/* Mobile Quick Add Bottom Sheet Modal */}
        <AnimatePresence>
          {showQuickAdd && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowQuickAdd(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-50 p-5 safe-bottom shadow-2xl md:hidden"
              >
                <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Quick Actions</h3>
                  <button 
                    onClick={() => setShowQuickAdd(false)}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <Link
                    to="/admin/proposals/new"
                    className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-start gap-2 active:scale-95 transition-transform"
                  >
                    <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">New Proposal</p>
                      <p className="text-[11px] text-muted-foreground">Draft proposal & terms</p>
                    </div>
                  </Link>

                  <Link
                    to="/admin/invoices"
                    className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-start gap-2 active:scale-95 transition-transform"
                  >
                    <div className="h-9 w-9 rounded-xl bg-purple-500 text-white flex items-center justify-center">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">New Invoice</p>
                      <p className="text-[11px] text-muted-foreground">Payment request</p>
                    </div>
                  </Link>

                  <Link
                    to="/admin/projects"
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-start gap-2 active:scale-95 transition-transform"
                  >
                    <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">New Project</p>
                      <p className="text-[11px] text-muted-foreground">Client milestones</p>
                    </div>
                  </Link>

                  <Link
                    to="/admin/portfolio"
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-start gap-2 active:scale-95 transition-transform"
                  >
                    <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                      <Image className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Add Portfolio</p>
                      <p className="text-[11px] text-muted-foreground">Showcase work</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Full Menu Drawer Sheet */}
        <AnimatePresence>
          {showMoreMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMoreMenu(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-card border-t border-border rounded-t-3xl z-50 flex flex-col safe-bottom shadow-2xl md:hidden overflow-hidden"
              >
                <div className="p-4 pb-2 border-b border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-none">All Management Tools</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Advaita Creative Studio</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMoreMenu(false)}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1">
                    Operations & Finance
                  </div>
                  {[
                    { to: "/admin/agreements", label: "Agreements & Contracts", icon: Shield, desc: "Signed agreements" },
                    { to: "/admin/invoices", label: "Invoices & Payments", icon: DollarSign, desc: "Billing & payouts" },
                    { to: "/admin/clients", label: "Clients & Contacts", icon: Users, desc: "Client database" },
                    { to: "/admin/requirements", label: "Requirements Forms", icon: ClipboardList, desc: "Project intake" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-tight">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    );
                  })}

                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 pt-3 py-1">
                    Showcase & Branding
                  </div>
                  {[
                    { to: "/admin/portfolio", label: "Portfolio Projects", icon: Image, desc: "Visual showcase" },
                    { to: "/admin/testimonials", label: "Testimonials & Reviews", icon: User, desc: "Client feedback" },
                    { to: "/admin/settings", label: "Studio Settings", icon: Settings, desc: "Profile, AI & branding" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-tight">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    );
                  })}

                  <div className="pt-3 border-t border-border/80 space-y-2">
                    <a
                      href="/"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Live Public Website
                    </a>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 active:scale-98 transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out of Admin
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
