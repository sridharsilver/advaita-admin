import { useState, useEffect } from "react";
import { Loader2, MessageSquare, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

export function InquiriesManager() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) setInquiries(await res.json());
    } catch (e) {
      toast.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleInquiryStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Marked as ${newStatus}`);
        fetchData();
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Inquiry deleted");
        fetchData();
      }
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">Review contact requests and inquiry forms submitted by visitors.</p>
      </div>

      <div className="w-full space-y-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-3xl">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-3xl text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
            <p>No inquiries found.</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-fade-in">
            {inquiries.map(item => (
              <div key={item.id} className={`glass rounded-2xl p-6 border transition-all ${item.status === 'unread' ? 'border-l-4 border-l-primary border-border/80 shadow-md' : 'opacity-80 border-border/40'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.status === 'unread' && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">New</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {item.email}</span>
                      {item.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {item.phone}</span>}
                      {item.company && <span className="px-1.5 py-0.5 bg-muted rounded">{item.company}</span>}
                      {item.created_at && (
                        <span className="flex items-center gap-1 ml-auto sm:ml-0 text-[10px] uppercase font-medium tracking-wider text-slate-400">
                          <Calendar className="h-3 w-3" /> {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap">
                    {item.budget && <span className="px-3 py-1 bg-background/50 rounded-full border border-border">Budget: {item.budget}</span>}
                  </div>
                </div>
                <div className="bg-background/30 p-4 rounded-xl text-sm mb-6 whitespace-pre-wrap leading-relaxed border border-border/30">
                  {item.message}
                </div>
                <div className="flex gap-2 border-t border-border pt-4 mt-auto">
                  <a href={`mailto:${item.email}`} className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition">Reply</a>
                  <button onClick={() => handleToggleInquiryStatus(item.id, item.status)} className="px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition border border-border/50">
                    Mark as {item.status === 'unread' ? 'Read' : 'Unread'}
                  </button>
                  <button onClick={() => handleDeleteInquiry(item.id)} className="px-4 py-2 bg-red-500/10 text-red-500 text-sm font-medium rounded-lg hover:bg-red-500/20 transition ml-auto">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
