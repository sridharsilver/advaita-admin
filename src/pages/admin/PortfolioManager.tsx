import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface PortfolioItem {
  id?: number;
  title: string;
  category: string;
  image_url: string;
  tone: string;
  description: string;
  project_link: string;
}

export function PortfolioManager() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PortfolioItem>({
    title: "", category: "", image_url: "", tone: "from-gray-400/30 to-gray-500/30", description: "", project_link: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) setItems(await res.json());
    } catch (e) {
      toast.error("Failed to fetch portfolio items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/portfolio", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`Project successfully saved`);
        setIsEditing(false);
        setIsModalOpen(false);
        setFormData({ title: "", category: "", image_url: "", tone: "from-gray-400/30 to-gray-500/30", description: "", project_link: "" });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save project");
      }
    } catch (e) {
      toast.error("Failed to save project");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        fetchData();
      } else {
        toast.error("Failed to delete project");
      }
    } catch (e) {
      toast.error("Failed to delete project");
    }
  };

  const handleEditPortfolio = (item: PortfolioItem) => {
    setFormData(item);
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
        setFormData({ ...formData, image_url: compressedBase64 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the showcase projects displayed on the home page.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setFormData({ title: "", category: "", image_url: "", tone: "from-gray-400/30 to-gray-500/30", description: "", project_link: "" });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 gap-2 w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Project
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
              className="relative w-full max-w-xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 my-auto animate-fade-in"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 h-10 w-10 bg-background hover:bg-background/80 text-foreground border border-border rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit' : 'Add New'} Project</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none" 
                    placeholder="e.g. Aurora Skincare"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Category</label>
                  <input 
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none" 
                    placeholder="e.g. Branding"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Project Image</label>
                  {formData.image_url ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-background/50 border border-border group">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: "" })}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-background/30 hover:bg-background/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to upload</span></p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (Max 2MB)</p>
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm min-h-[80px]" 
                    placeholder="Detailed project description..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Project Link</label>
                  <input 
                    required
                    value={formData.project_link}
                    onChange={e => setFormData({...formData, project_link: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm" 
                    placeholder="https://..."
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3 rounded-xl bg-foreground text-background font-medium hover:opacity-90 flex items-center justify-center gap-2 mt-6"
                >
                  {isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isEditing ? 'Save Changes' : 'Create Project'}
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
        ) : items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-3xl text-muted-foreground">
            <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
            <p>No projects found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {items.map(item => (
              <div key={item.id} className="glass rounded-3xl overflow-hidden group border border-border/50">
                <div className="aspect-video relative overflow-hidden bg-background/50">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${item.tone} opacity-50 group-hover:scale-105 transition-transform duration-500`} />
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-[color:var(--brand-orange)] tracking-widest uppercase mb-2 block">{item.category}</span>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{item.description}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditPortfolio(item)}
                      className="flex-1 py-2 rounded bg-muted hover:bg-muted/80 text-sm font-medium transition-colors border border-border/50"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id!)}
                      className="flex-1 py-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
