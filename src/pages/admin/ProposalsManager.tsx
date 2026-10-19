import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2, FileText, FileSignature, Printer, Copy, ExternalLink, QrCode, Search, Eye, Download, Calendar, MoreVertical, X, MessageCircle, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

// ── Tooltip Icon Button ─────────────────────────────────────────────────────
type IconBtnProps = {
  label: string;
  children: React.ReactNode;
  onClick?: (() => void) | undefined;
  as?: "button" | "link" | "a";
  to?: string;
  href?: string;
  target?: string;
  hoverClass?: string;
};

function IconBtn({ label, children, onClick, as = "button", to, href, target, hoverClass = "hover:bg-muted" }: IconBtnProps) {
  const cls = `relative group flex flex-col items-center p-2 rounded-xl transition ${hoverClass}`;
  const tooltip = (
    <span className="hidden md:group-hover:inline-block pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background z-50 shadow">
      {label}
    </span>
  );
  if (as === "link" && to) {
    return (
      <Link to={to} className={cls}>
        {children}
        {tooltip}
      </Link>
    );
  }
  if (as === "a" && href) {
    return (
      <a href={href} target={target} rel="noopener noreferrer" className={cls}>
        {children}
        {tooltip}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
      {tooltip}
    </button>
  );
}
// ───────────────────────────────────────────────────────────────────────────

export function ProposalsManager() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalSearch, setProposalSearch] = useState("");
  const [proposalStatusFilter, setProposalStatusFilter] = useState("all");
  const [proposalQR, setProposalQR] = useState<string | null>(null);
  const [activeProposalMenu, setActiveProposalMenu] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/proposals");
      if (res.ok) setProposals(await res.json());
    } catch (e) {
      toast.error("Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleOutsideClick = () => {
      setActiveProposalMenu(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleCopyProposalLink = (slug: string) => {
    const url = `${window.location.origin}/proposal/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Proposal link copied to clipboard!");
  };

  const handleDuplicateProposal = async (id: number) => {
    try {
      const res = await fetch("/api/admin/proposals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "duplicate" }),
      });
      if (res.ok) {
        toast.success("Proposal duplicated successfully!");
        fetchData();
      } else {
        toast.error("Failed to duplicate proposal");
      }
    } catch (e) {
      toast.error("Error duplicating proposal");
    }
  };

  const handleDeleteProposal = async (id: number) => {
    if (!confirm("Are you sure you want to delete this proposal?")) return;
    try {
      const res = await fetch(`/api/admin/proposals?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Proposal deleted successfully!");
        fetchData();
      } else {
        toast.error("Failed to delete proposal");
      }
    } catch (e) {
      toast.error("Error deleting proposal");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-10 min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Proposals</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Draft, send, and monitor professional creative and design proposals.</p>
        </div>
        <Link 
          to="/admin/proposals/new"
          className="inline-flex items-center justify-center rounded-xl sm:rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 gap-2 w-full sm:w-auto text-center shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Proposal
        </Link>
      </div>

      <div className="space-y-4 sm:space-y-6 min-w-0">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center bg-background/50 border border-border rounded-2xl p-3 sm:p-4 min-w-0">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={proposalSearch}
              onChange={(e) => setProposalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={proposalStatusFilter}
              onChange={(e) => setProposalStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-background border border-border text-sm focus:border-primary outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-3xl">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        ) : proposals.filter(p => {
          const matchesSearch = p.title.toLowerCase().includes(proposalSearch.toLowerCase()) || p.client_name.toLowerCase().includes(proposalSearch.toLowerCase());
          const matchesStatus = proposalStatusFilter === "all" || p.status === proposalStatusFilter;
          return matchesSearch && matchesStatus;
        }).length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-3xl text-muted-foreground flex flex-col items-center justify-center">
            <FileText className="h-10 w-10 mb-2 opacity-50" />
            <p>No proposals found.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 animate-fade-in min-w-0">
            {proposals
              .filter(p => {
                const matchesSearch = p.title.toLowerCase().includes(proposalSearch.toLowerCase()) || p.client_name.toLowerCase().includes(proposalSearch.toLowerCase());
                const matchesStatus = proposalStatusFilter === "all" || p.status === proposalStatusFilter;
                return matchesSearch && matchesStatus;
              })
              .map(p => {
                // Compute expiry info
                const expiryInfo = (() => {
                  if (!p.valid_until) return null;
                  const expiry = new Date(p.valid_until);
                  expiry.setHours(23, 59, 59, 999);
                  const now = new Date();
                  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) return { label: "Expired", color: "bg-red-500/10 text-red-600" };
                  if (diffDays === 0) return { label: "Expires today", color: "bg-orange-500/10 text-orange-600" };
                  if (diffDays <= 3) return { label: `Expires in ${diffDays}d`, color: "bg-amber-500/10 text-amber-600" };
                  return { label: `Valid ${diffDays}d`, color: "bg-emerald-500/10 text-emerald-600" };
                })();

                const statusBorderColor =
                  p.status === "Approved" ? "border-l-emerald-500" :
                  p.status === "Sent"     ? "border-l-blue-500" :
                  p.status === "Rejected" ? "border-l-red-500" :
                  "border-l-slate-300 dark:border-l-slate-600";

                return (
                <div key={p.id} className={`glass border border-border/50 border-l-4 ${statusBorderColor} rounded-2xl p-4 sm:p-6 hover:shadow-sm transition-all relative overflow-visible min-w-0 max-w-full`}>
                  <div className="flex items-start justify-between gap-2.5 sm:gap-4 min-w-0">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg break-words line-clamp-2 max-w-full">{p.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          p.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                          p.status === "Sent" ? "bg-blue-500/10 text-blue-600" :
                          p.status === "Rejected" ? "bg-red-500/10 text-red-500" :
                          "bg-slate-500/10 text-slate-500"
                        }`}>
                          {p.status}
                        </span>
                        {expiryInfo && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${expiryInfo.color}`}>
                            {expiryInfo.label}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
                        <span className="truncate max-w-full">Client: {p.client_name} {p.company_name && `(${p.company_name})`}</span>
                        {p.project_type && (
                          <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-md shrink-0">{p.project_type}</span>
                        )}
                        {p.password && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-mono select-all shrink-0" title="Auto-generated Passcode">
                            🔑 {p.password}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons + Cover Thumbnail */}
                    <div className="flex items-start gap-1 sm:gap-2 shrink-0">
                      {p.cover_image && (
                        <img
                          src={p.cover_image}
                          alt="Cover"
                          className="hidden sm:block w-14 h-10 object-cover rounded-lg border border-border/50 shrink-0"
                        />
                      )}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                      <IconBtn label="Edit" as="link" to={`/admin/proposals/edit/${p.id}`}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </IconBtn>
                      <IconBtn label="Preview" as="a" href={`/proposal/${p.slug}`} target="_blank">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </IconBtn>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProposalMenu(activeProposalMenu === p.id ? null : p.id);
                          }}
                          className="p-2 hover:bg-muted rounded-xl transition flex items-center justify-center relative group"
                          aria-label="More options"
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="hidden md:group-hover:inline-block pointer-events-none absolute -bottom-7 right-0 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background z-50 shadow">
                            More
                          </span>
                        </button>
                        
                        {activeProposalMenu === p.id && (
                          <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-xl shadow-xl py-1.5 z-50">
                            <button onClick={() => handleDuplicateProposal(p.id)} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-muted text-left">
                              <Copy className="h-3.5 w-3.5" /> Duplicate
                            </button>
                            <button onClick={() => setProposalQR(`${window.location.origin}/proposal/${p.slug}`)} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-muted text-left">
                              <QrCode className="h-3.5 w-3.5" /> QR Code
                            </button>
                            <button onClick={() => handleCopyProposalLink(p.slug)} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-muted text-left">
                              <ExternalLink className="h-3.5 w-3.5" /> Copy Link
                            </button>
                            <div className="border-t border-border my-1" />
                            <a
                              href={`https://wa.me/${p.client_phone ? p.client_phone.replace(/\D/g, "") : ""}?text=${encodeURIComponent(`Hi ${p.client_name},\n\nPlease find your project proposal here:\n${window.location.origin}/proposal/${p.slug}\n\n*Passcode: ${p.password}*\n(Please enter this passcode to view the proposal)\n\nLooking forward to hearing from you!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-[#25D366]/10 text-[#25D366]"
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> Send via WhatsApp
                            </a>
                            <a
                              href={`mailto:${p.client_email || ""}?subject=${encodeURIComponent(`Proposal: ${p.title}`)}&body=${encodeURIComponent(`Hi ${p.client_name},\n\nPlease find your project proposal here:\n${window.location.origin}/proposal/${p.slug}\n\n*Passcode: ${p.password}*\n(Please enter this passcode to view the proposal)\n\nFeel free to review the proposal and let me know if you have any questions.\n\nBest regards`)}`}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-blue-500/10 text-blue-500"
                            >
                              <Mail className="h-3.5 w-3.5" /> Send via Email
                            </a>
                            {p.status === "Approved" && (
                              <>
                                <div className="border-t border-border my-1" />
                                <a
                                  href={`https://wa.me/${p.client_phone ? p.client_phone.replace(/\D/g, "") : ""}?text=${encodeURIComponent(`Hi ${p.client_name},\n\nPlease review and digitally sign your service agreement here:\n${window.location.origin}/proposal/${p.slug}/contract\n\nLooking forward to working with you!`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-emerald-500/10 text-emerald-600"
                                >
                                  <FileSignature className="h-3.5 w-3.5" /> Contract via WhatsApp
                                </a>
                                <a
                                  href={`mailto:${p.client_email || ""}?subject=${encodeURIComponent(`Service Agreement: ${p.title}`)}&body=${encodeURIComponent(`Hi ${p.client_name},\n\nPlease review and digitally sign your service agreement here:\n${window.location.origin}/proposal/${p.slug}/contract\n\nSimply open the link, review the terms, and sign with your full name.\n\nBest regards`)}`}
                                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-emerald-500/10 text-emerald-600"
                                >
                                  <FileSignature className="h-3.5 w-3.5" /> Contract via Email
                                </a>
                                <a href={`/proposal/${p.slug}/contract`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-muted text-emerald-600">
                                  <FileSignature className="h-3.5 w-3.5" /> View Digital Contract
                                </a>
                                <a href={`/proposal/${p.slug}/contract?mode=physical`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-muted text-amber-600">
                                  <Printer className="h-3.5 w-3.5" /> View Physical Contract
                                </a>
                              </>
                            )}
                            <div className="border-t border-border my-1" />
                            <button onClick={() => handleDeleteProposal(p.id)} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-red-500/10 text-red-500 text-left">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/40 text-xs text-muted-foreground min-w-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="flex items-center gap-1 shrink-0">
                        <Eye className="h-3.5 w-3.5" /> {p.views || 0} Views
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Download className="h-3.5 w-3.5" /> {p.downloads || 0} Downloads
                      </span>
                    </div>
                    {p.updated_at && (
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-3.5 w-3.5" /> Updated: {new Date(p.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )})}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {proposalQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setProposalQR(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setProposalQR(null)} className="absolute top-4 right-4 h-8 w-8 hover:bg-muted border border-border rounded-full flex items-center justify-center transition-colors">
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-bold text-lg mb-6">Scan QR Code</h3>
              <div className="inline-block bg-white p-4 rounded-2xl mb-6 shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(proposalQR)}`} 
                  alt="Proposal QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-muted-foreground break-all px-2 select-all font-medium leading-relaxed">{proposalQR}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
