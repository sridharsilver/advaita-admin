import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, MessageSquare, Image as ImageIcon, Star, Plus, 
  ArrowRight, Shield, Mail, Calendar, Eye, Layers, DollarSign,
  TrendingUp, RefreshCw, CheckCircle2, Clock, Sparkles, User, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export function Dashboard() {
  const [stats, setStats] = useState({
    proposalsCount: 0,
    acceptedProposals: 0,
    inquiriesCount: 0,
    unreadInquiries: 0,
    testimonialsCount: 0,
    pendingTestimonials: 0,
    portfolioCount: 0,
    pendingAgreements: 0,
    activeProjects: 0,
    pendingPayments: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [recentProposals, setRecentProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<"inquiries" | "proposals">("inquiries");

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [portRes, testRes, inqRes, propRes, agreementsRes, projectsRes, invoicesRes] = await Promise.all([
        fetch("/api/portfolio"),
        fetch("/api/admin/testimonials"),
        fetch("/api/admin/messages"),
        fetch("/api/admin/proposals"),
        fetch("/api/admin/agreements"),
        fetch("/api/admin/projects"),
        fetch("/api/admin/invoices")
      ]);

      let portfolioItems = [];
      let testimonialsItems = [];
      let inquiriesItems: any[] = [];
      let proposalsItems: any[] = [];
      let agreementsItems: any[] = [];
      let projectsItems: any[] = [];
      let invoicesItems: any[] = [];

      if (portRes.ok) { const d = await portRes.json(); portfolioItems = Array.isArray(d) ? d : (d.data || []); }
      if (testRes.ok) { const d = await testRes.json(); testimonialsItems = Array.isArray(d) ? d : (d.data || []); }
      if (inqRes.ok) { const d = await inqRes.json(); inquiriesItems = Array.isArray(d) ? d : (d.data || []); }
      if (propRes.ok) { const d = await propRes.json(); proposalsItems = Array.isArray(d) ? d : (d.data || []); }
      if (agreementsRes.ok) { const d = await agreementsRes.json(); agreementsItems = Array.isArray(d) ? d : (d.data || []); }
      if (projectsRes.ok) { const d = await projectsRes.json(); projectsItems = Array.isArray(d) ? d : (d.data || []); }
      if (invoicesRes.ok) { const d = await invoicesRes.json(); invoicesItems = Array.isArray(d) ? d : (d.data || []); }

      setStats({
        portfolioCount: portfolioItems.length,
        testimonialsCount: testimonialsItems.length,
        pendingTestimonials: testimonialsItems.filter((t: any) => (t.status || 'pending') === 'pending').length,
        inquiriesCount: inquiriesItems.length,
        unreadInquiries: inquiriesItems.filter((i: any) => i.status === 'unread').length,
        proposalsCount: proposalsItems.length,
        acceptedProposals: proposalsItems.filter((p: any) => ['Accepted', 'Approved'].includes(p.status)).length,
        pendingAgreements: agreementsItems.filter((a: any) => a.status === 'Pending').length,
        activeProjects: projectsItems.filter((p: any) => p.status === 'Active').length,
        pendingPayments: invoicesItems.filter((i: any) => ['Draft', 'Sent', 'Overdue'].includes(i.status)).length,
      });

      setRecentInquiries(inquiriesItems.slice(0, 4));
      setRecentProposals(proposalsItems.slice(0, 4));
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      toast.error("Failed to load dashboard overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-20 bg-muted/60 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/60 rounded-3xl" />
          ))}
        </div>
        <div className="h-44 bg-muted/60 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-8 max-w-5xl mx-auto space-y-5 pb-24 md:pb-10">
      {/* 1. Mobile-First Greeting Banner */}
      <div className="glass p-5 rounded-3xl border border-border/70 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-gradient-brand opacity-15 blur-2xl" />
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span>{todayStr}</span>
              <span>•</span>
              <span className="text-primary font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Studio Live
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
              {getGreeting()}, Sridhar 👋
            </h2>
          </div>
          
          <button
            onClick={fetchData}
            className="h-9 w-9 rounded-2xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Notification Capsule */}
        {(stats.unreadInquiries > 0 || stats.pendingAgreements > 0 || stats.pendingPayments > 0) && (
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold text-muted-foreground">
            {stats.unreadInquiries > 0 && (
              <Link to="/admin/inquiries" className="px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1 shrink-0 active:scale-95">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {stats.unreadInquiries} unread {stats.unreadInquiries === 1 ? "lead" : "leads"}
              </Link>
            )}
            {stats.pendingAgreements > 0 && (
              <Link to="/admin/agreements" className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 flex items-center gap-1 shrink-0 active:scale-95">
                <Clock className="h-3 w-3" />
                {stats.pendingAgreements} pending sign
              </Link>
            )}
            {stats.pendingPayments > 0 && (
              <Link to="/admin/invoices" className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 flex items-center gap-1 shrink-0 active:scale-95">
                <DollarSign className="h-3 w-3" />
                {stats.pendingPayments} unpaid invoices
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 2. Primary Mobile Quick Action Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          <Link
            to="/admin/proposals/new"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-card border border-border/80 shadow-xs active:scale-92 active:bg-muted/50 transition-all text-center"
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-xs">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-foreground truncate w-full">Proposal</span>
          </Link>

          <Link
            to="/admin/projects"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-card border border-border/80 shadow-xs active:scale-92 active:bg-muted/50 transition-all text-center"
          >
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-foreground truncate w-full">Project</span>
          </Link>

          <Link
            to="/admin/invoices"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-card border border-border/80 shadow-xs active:scale-92 active:bg-muted/50 transition-all text-center"
          >
            <div className="h-11 w-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-foreground truncate w-full">Invoice</span>
          </Link>

          <Link
            to="/admin/portfolio"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-card border border-border/80 shadow-xs active:scale-92 active:bg-muted/50 transition-all text-center"
          >
            <div className="h-11 w-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ImageIcon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-foreground truncate w-full">Portfolio</span>
          </Link>
        </div>
      </div>

      {/* 3. Core Touch Metric Cards (2x2 Grid) */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Operational Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Active Projects */}
          <Link
            to="/admin/projects"
            className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-primary/50 active:scale-96 transition-all flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Active Projects</span>
              <div className="h-7 w-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{stats.activeProjects}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                In progress
              </p>
            </div>
          </Link>

          {/* Pending Agreements */}
          <Link
            to="/admin/agreements"
            className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-primary/50 active:scale-96 transition-all flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Agreements</span>
              <div className="h-7 w-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{stats.pendingAgreements}</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                Pending signature
              </p>
            </div>
          </Link>

          {/* Proposals Accepted */}
          <Link
            to="/admin/proposals"
            className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-primary/50 active:scale-96 transition-all flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Proposals</span>
              <div className="h-7 w-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{stats.proposalsCount}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {stats.acceptedProposals} signed & active
              </p>
            </div>
          </Link>

          {/* Pending Invoices / Payments */}
          <Link
            to="/admin/invoices"
            className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs hover:border-primary/50 active:scale-96 transition-all flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Unpaid Invoices</span>
              <div className="h-7 w-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{stats.pendingPayments}</p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                Awaiting payment
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Segmented Activity Switcher (Mobile Tabs for Inquiries vs Proposals) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</span>
          <Link 
            to={activeSegment === "inquiries" ? "/admin/inquiries" : "/admin/proposals"}
            className="text-xs font-bold text-primary flex items-center gap-1 active:scale-95"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Thumb-friendly Segmented Control */}
        <div className="p-1 rounded-2xl bg-muted/80 flex items-center gap-1">
          <button
            onClick={() => setActiveSegment("inquiries")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeSegment === "inquiries"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Messages</span>
            {stats.unreadInquiries > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center">
                {stats.unreadInquiries}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSegment("proposals")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeSegment === "proposals"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Proposals ({recentProposals.length})</span>
          </button>
        </div>

        {/* Segment 1: Inquiries Cards */}
        {activeSegment === "inquiries" && (
          <div className="space-y-2.5">
            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs glass rounded-3xl">
                No recent messages received.
              </div>
            ) : (
              recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 shadow-xs active:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {inq.name ? inq.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-xs leading-tight">{inq.name}</p>
                        <p className="text-[10px] text-muted-foreground">{inq.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {inq.status === "unread" && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold">
                          NEW
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/40 p-2.5 rounded-xl leading-relaxed">
                    {inq.message}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <a
                      href={`mailto:${inq.email}`}
                      className="px-3 py-1.5 rounded-xl bg-muted text-[11px] font-semibold flex items-center gap-1 active:scale-95"
                    >
                      <Mail className="h-3 w-3" /> Reply
                    </a>
                    <Link
                      to="/admin/inquiries"
                      className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[11px] font-semibold active:scale-95"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Segment 2: Proposals Cards */}
        {activeSegment === "proposals" && (
          <div className="space-y-2.5">
            {recentProposals.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs glass rounded-3xl">
                No active proposals drafted.
              </div>
            ) : (
              recentProposals.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between gap-3 shadow-xs active:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs truncate">{prop.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        prop.status === "Accepted" ? "bg-emerald-500/15 text-emerald-600" :
                        prop.status === "Sent" ? "bg-blue-500/15 text-blue-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Client: {prop.client_name || "Direct Client"}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(prop.updated_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`/proposal/${prop.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground active:scale-90"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <Link
                      to={`/admin/proposals/edit/${prop.id}`}
                      className="px-2.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-95"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
