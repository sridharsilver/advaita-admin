import { useState, useEffect } from "react";
import { Plus, Pencil, Loader2, Image as ImageIcon, Upload, X, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Testimonial {
  id?: number;
  quote: string;
  name: string;
  role: string;
  image_url?: string;
  status?: string;
}

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testimonialData, setTestimonialData] = useState<Testimonial>({
    quote: "", name: "", role: "", image_url: "",
  });
  const [testimonialTab, setTestimonialTab] = useState<"pending" | "active">("pending");
  const [linkCopied, setLinkCopied] = useState(false);
  const [googleLinkCopied, setGoogleLinkCopied] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, settingsRes] = await Promise.all([
        fetch("/api/admin/testimonials"),
        fetch("/api/settings")
      ]);
      if (res.ok) setTestimonials(await res.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (e) {
      toast.error("Failed to fetch testimonials data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/feedback");
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast.success("Feedback link copied!");
  };

  const handleCopyGoogleLink = () => {
    const googleLink = settings.google_review_link || "https://maps.app.goo.gl/q8YxR3xzhQY9hLZX6";
    navigator.clipboard.writeText(googleLink);
    setGoogleLinkCopied(true);
    setTimeout(() => setGoogleLinkCopied(false), 2000);
    toast.success("Google Review link copied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/testimonials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testimonialData),
      });

      if (res.ok) {
        toast.success(`Testimonial successfully saved`);
        setIsEditing(false);
        setIsModalOpen(false);
        setTestimonialData({ quote: "", name: "", role: "", image_url: "" });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save testimonial");
      }
    } catch (e) {
      toast.error("Failed to save testimonial");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Testimonial deleted");
        fetchData();
      } else {
        toast.error("Failed to delete testimonial");
      }
    } catch (e) {
      toast.error("Failed to delete testimonial");
    }
  };

  const handleToggleStatus = async (item: Testimonial) => {
    const newStatus = item.status === 'active' ? 'pending' : 'active';
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status changed to ${newStatus}`);
        fetchData();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleEditTestimonial = (item: Testimonial) => {
    setTestimonialData(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setTestimonialData({ ...testimonialData, image_url: compressedBase64 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const googleReviewText = settings.google_review_text || "Hi! We loved working with you on your project. If you're happy with our services, would you mind leaving us a quick review on Google?";
  const googleReviewLink = settings.google_review_link || "https://maps.app.goo.gl/q8YxR3xzhQY9hLZX6";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and approve client reviews and showcase testimonials.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setTestimonialData({ quote: "", name: "", role: "", image_url: "" });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 gap-2 w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 my-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 h-10 w-10 bg-background hover:bg-background/80 text-foreground border border-border rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit' : 'Add New'} Testimonial</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Quote</label>
                  <textarea 
                    required
                    value={testimonialData.quote}
                    onChange={e => setTestimonialData({...testimonialData, quote: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm min-h-[100px]" 
                    placeholder="Their design team thinks like product strategists..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Client Name</label>
                  <input 
                    required
                    value={testimonialData.name}
                    onChange={e => setTestimonialData({...testimonialData, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm" 
                    placeholder="e.g. Marc Lefevre"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Client Role / Company</label>
                  <input 
                    required
                    value={testimonialData.role}
                    onChange={e => setTestimonialData({...testimonialData, role: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm" 
                    placeholder="e.g. Founder, Aurora Skincare"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Client Photo</label>
                  
                  {testimonialData.image_url ? (
                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-background/50 border border-border group mx-auto">
                      <img src={testimonialData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setTestimonialData({ ...testimonialData, image_url: "" })}>
                        <X className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer bg-background/30 hover:bg-background/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2">
                        <Upload className="w-5 h-5 mb-1 text-muted-foreground" />
                        <p className="mb-0 text-xs text-muted-foreground"><span className="font-medium text-foreground">Upload Avatar</span></p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3 rounded-xl bg-foreground text-background font-medium hover:opacity-90 flex items-center justify-center gap-2 mt-6"
                >
                  {isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isEditing ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-3xl">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-6 border-b border-border pb-4">
              <button 
                onClick={() => setTestimonialTab("pending")} 
                className={`text-sm font-medium transition relative pb-2 ${testimonialTab === "pending" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Pending 
                <span className="ml-2 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full">{testimonials.filter(t => (t.status || 'pending') === 'pending').length}</span>
                {testimonialTab === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
              </button>
              <button 
                onClick={() => setTestimonialTab("active")} 
                className={`text-sm font-medium transition relative pb-2 ${testimonialTab === "active" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Active
                <span className="ml-2 text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">{testimonials.filter(t => t.status === 'active').length}</span>
                {testimonialTab === "active" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
              </button>
            </div>

            {testimonials.filter(t => (t.status || 'pending') === testimonialTab).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {testimonialTab} testimonials found.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {testimonials.filter(t => (t.status || 'pending') === testimonialTab).map(item => (
                  <div key={item.id} className="glass rounded-2xl p-6 flex flex-col h-full border border-border/50">
                    <div className="mb-6 flex-1">
                      <p className="text-lg italic font-medium">"{item.quote}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold border border-border">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold leading-tight">{item.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 mt-4 border-t border-border">
                      <button 
                        onClick={() => handleToggleStatus(item)}
                        className="flex-1 py-1.5 rounded bg-muted hover:bg-muted/80 text-sm font-medium transition-colors border border-border/50"
                      >
                        {item.status === 'active' ? 'Hide' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => handleEditTestimonial(item)}
                        className="flex-1 py-1.5 rounded bg-muted hover:bg-muted/80 text-sm font-medium transition-colors border border-border/50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id!)}
                        className="flex-1 py-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-8 mt-8 border-t border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border/60">
              <div>
                <p className="text-sm font-semibold">Client Feedback Form Link</p>
                <p className="text-xs text-muted-foreground mt-0.5">Share this form link with your clients to collect their testimonial reviews automatically.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent("Hi! We'd love to hear your feedback on your recent project with Advaita Designs. Please leave a review here: " + window.location.origin + "/feedback")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] px-4 py-2 text-xs font-semibold transition hover:bg-[#25D366]/20 gap-1.5 border border-[#25D366]/20"
                >
                  WhatsApp Share
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent("Leave a review for Advaita Designs")}&body=${encodeURIComponent("Hi!\n\nWe'd love to hear your feedback on your recent project with us. Please leave a quick review here:\n" + window.location.origin + "/feedback\n\nThank you!")}`}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 px-4 py-2 text-xs font-semibold transition hover:bg-blue-500/20 gap-1.5 border border-blue-500/20"
                >
                  Email Share
                </a>
                <button 
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center rounded-xl bg-foreground/5 text-foreground px-4 py-2 text-xs font-semibold transition hover:bg-foreground/10 gap-1.5 border border-border"
                >
                  {linkCopied ? "Copied Feedback Link!" : "Copy Feedback Link"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border/60">
              <div>
                <p className="text-sm font-semibold">Google Review Link</p>
                <p className="text-xs text-muted-foreground mt-0.5">Direct your clients to leave a review directly on Google Maps.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`${googleReviewText} ${googleReviewLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] px-4 py-2 text-xs font-semibold transition hover:bg-[#25D366]/20 gap-1.5 border border-[#25D366]/20"
                >
                  WhatsApp Share
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent("Write a Google review for Advaita Designs")}&body=${encodeURIComponent(`${googleReviewText}\n${googleReviewLink}\n\nThank you!`)}`}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 px-4 py-2 text-xs font-semibold transition hover:bg-blue-500/20 gap-1.5 border border-blue-500/20"
                >
                  Email Share
                </a>
                <button 
                  onClick={handleCopyGoogleLink}
                  className="inline-flex items-center justify-center rounded-xl bg-foreground/5 text-foreground px-4 py-2 text-xs font-semibold transition hover:bg-foreground/10 gap-1.5 border border-border"
                >
                  {googleLinkCopied ? "Copied Google Link!" : "Copy Google Link"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
