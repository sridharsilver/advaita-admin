import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Copy, ExternalLink, Loader2, X, ClipboardList, Send, CheckCircle, Eye, Mail, User, Clock, AlertCircle, MessageCircle, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox";
  options?: string[]; // Comma separated for select options
  required: boolean;
}

interface FormTemplate {
  id?: number;
  title: string;
  slug: string;
  description: string;
  fields_json: string;
  created_at?: string;
}

interface Submission {
  id: number;
  form_id: number;
  form_title: string;
  client_name: string;
  client_email: string;
  answers_json: string;
  status: "unread" | "read";
  created_at: string;
}

export function RequirementsManager() {
  const [activeTab, setActiveTab] = useState<"forms" | "submissions">("forms");
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Builder state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  // Submission Viewer state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, subsRes] = await Promise.all([
        fetch("/api/admin/forms"),
        fetch("/api/admin/submissions")
      ]);
      if (formsRes.ok) setForms(await formsRes.json());
      if (subsRes.ok) setSubmissions(await subsRes.json());
    } catch (e) {
      toast.error("Failed to fetch requirements data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyLink = (slug: string) => {
    const link = `${window.location.origin}/requirements/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Requirements form URL copied!");
  };

  const handleAddFormField = () => {
    const newField: FormField = {
      id: "field_" + Date.now(),
      label: "",
      type: "text",
      options: [],
      required: false
    };
    setFields([...fields, newField]);
  };

  const handleRemoveFormField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleFieldChange = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormTitle("");
    setFormSlug("");
    setFormDescription("");
    setFields([
      { id: "field_name", label: "Your Name", type: "text", required: true },
      { id: "field_email", label: "Your Email", type: "text", required: true }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (form: FormTemplate) => {
    setIsEditing(true);
    setEditingId(form.id || null);
    setFormTitle(form.title);
    setFormSlug(form.slug);
    setFormDescription(form.description || "");
    try {
      setFields(JSON.parse(form.fields_json));
    } catch {
      setFields([]);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSlug) {
      toast.error("Please fill in title and slug");
      return;
    }

    if (fields.length === 0) {
      toast.error("Please add at least one field to the form");
      return;
    }

    // Verify all fields have labels
    if (fields.some(f => !f.label.trim())) {
      toast.error("All fields must have a label");
      return;
    }

    const payload = {
      id: editingId,
      title: formTitle,
      slug: formSlug.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
      description: formDescription,
      fields_json: JSON.stringify(fields)
    };

    try {
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/admin/forms", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Form templates successfully saved`);
        setIsModalOpen(false);
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save form");
      }
    } catch {
      toast.error("Error saving form template");
    }
  };

  const handleDeleteForm = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template? All submissions will also be deleted.")) return;
    try {
      const res = await fetch(`/api/admin/forms?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Template deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete template");
      }
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const handleViewSubmission = async (sub: Submission) => {
    setSelectedSubmission(sub);
    if (sub.status === "unread") {
      try {
        await fetch("/api/admin/submissions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sub.id, status: "read" })
        });
        // Update local status
        setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, status: "read" } : s));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteSubmission = async (id: number) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      const res = await fetch(`/api/admin/submissions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Submission deleted");
        setSelectedSubmission(null);
        fetchData();
      } else {
        toast.error("Failed to delete submission");
      }
    } catch {
      toast.error("Failed to delete submission");
    }
  };

  const handleDownloadSubmission = (sub: Submission) => {
    let content = `Client Brief: ${sub.form_title}\n`;
    content += `Client Name: ${sub.client_name}\n`;
    content += `Client Email: ${sub.client_email}\n`;
    content += `Submitted At: ${new Date(sub.created_at).toLocaleString()}\n\n`;
    content += `--- Answers ---\n\n`;

    let answers: Record<string, any> = {};
    try { answers = JSON.parse(sub.answers_json); } catch {}

    Object.entries(answers).forEach(([key, val]) => {
      content += `${key}:\n${typeof val === 'boolean' ? (val ? "Yes" : "No") : val || "—"}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sub.form_title.replace(/[^a-zA-Z0-9]/g, "_")}_${sub.client_name.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Client Requirements</h1>
          <p className="text-sm text-muted-foreground mt-1">Create custom requirement forms and review client briefs.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 gap-2 w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Form Template
        </button>
      </div>

      <div className="w-full space-y-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-3xl">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-border pb-4">
              <button 
                onClick={() => setActiveTab("forms")} 
                className={`text-sm font-medium transition relative pb-2 ${activeTab === "forms" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Form Templates 
                <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{forms.length}</span>
                {activeTab === "forms" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab("submissions")} 
                className={`text-sm font-medium transition relative pb-2 ${activeTab === "submissions" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Client Briefs / Submissions
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${submissions.some(s => s.status === 'unread') ? 'bg-indigo-500/10 text-indigo-500' : 'bg-muted'}`}>
                  {submissions.filter(s => s.status === 'unread').length} Unread
                </span>
                {activeTab === "submissions" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
              </button>
            </div>

            {/* TAB CONTENT: FORMS */}
            {activeTab === "forms" && (
              forms.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 border border-dashed border-border/60 rounded-2xl">
                  No forms created yet. Click "Create Form Template" to begin.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {forms.map(form => {
                    let fieldCount = 0;
                    try { fieldCount = JSON.parse(form.fields_json).length; } catch {}
                    return (
                      <div key={form.id} className="glass rounded-2xl p-6 flex flex-col justify-between h-full border border-border/50 shadow-sm hover:border-border transition-colors">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-lg leading-snug">{form.title}</h3>
                            <span className="text-xs bg-foreground/5 border border-border/50 px-2 py-1 rounded-md text-muted-foreground">
                              {fieldCount} Fields
                            </span>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground mt-1 bg-muted/40 px-2 py-1 rounded w-fit">/{form.slug}</p>
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{form.description || "No description provided."}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-border">
                          <a 
                            href={`https://wa.me/?text=${encodeURIComponent("Thank you for your inquiry! To help us understand your project needs better, kindly fill out this requirements form: " + window.location.origin + "/requirements/" + form.slug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#25D366]/10 text-[#25D366] text-xs font-semibold transition hover:bg-[#25D366]/20 border border-[#25D366]/20"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Share
                          </a>
                          <a 
                            href={`mailto:?subject=${encodeURIComponent("Requirements Form: " + form.title)}&body=${encodeURIComponent("Thank you for your inquiry! To help us understand your project needs better, kindly fill out this requirements form:\n" + window.location.origin + "/requirements/" + form.slug)}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-blue-500/10 text-blue-500 text-xs font-semibold transition hover:bg-blue-500/20 border border-blue-500/20"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </a>
                          <button 
                            onClick={() => handleCopyLink(form.slug)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-muted hover:bg-muted/80 text-xs font-semibold transition-colors border border-border/50"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedId === form.slug ? "Copied" : "Copy"}
                          </button>
                          <div className="hidden sm:block flex-1" />
                          <button 
                            onClick={() => handleOpenEditModal(form)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-muted hover:bg-muted/80 text-xs font-semibold transition-colors border border-border/50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteForm(form.id!)}
                            className="p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* TAB CONTENT: SUBMISSIONS */}
            {activeTab === "submissions" && (
              submissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 border border-dashed border-border/60 rounded-2xl">
                  No client briefs submitted yet. Share form links to collect requirements.
                </div>
              ) : (
                <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="p-4 font-semibold text-muted-foreground">Form</th>
                          <th className="p-4 font-semibold text-muted-foreground">Client Details</th>
                          <th className="p-4 font-semibold text-muted-foreground">Submitted At</th>
                          <th className="p-4 font-semibold text-muted-foreground">Status</th>
                          <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map(sub => (
                          <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                            <td className="p-4 font-semibold">{sub.form_title}</td>
                            <td className="p-4">
                              <div className="font-medium">{sub.client_name}</div>
                              <div className="text-xs text-muted-foreground">{sub.client_email}</div>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(sub.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sub.status === 'unread' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-green-500/10 text-green-500'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sub.status === 'unread' ? 'bg-indigo-500 animate-pulse' : 'bg-green-500'}`} />
                                {sub.status === 'unread' ? 'Unread' : 'Read'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex gap-2">
                                <button 
                                  onClick={() => handleViewSubmission(sub)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-muted hover:bg-muted/80 text-xs font-semibold transition-colors border border-border/50"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </button>
                                <button 
                                  onClick={() => handleDownloadSubmission(sub)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-muted hover:bg-muted/80 text-xs font-semibold transition-colors border border-border/50"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </button>
                                <button 
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* FORM BUILDER MODAL */}
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
              className="relative w-full max-w-3xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 my-auto max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 h-10 w-10 bg-background hover:bg-background/80 text-foreground border border-border rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit' : 'Create'} Requirement Form Template</h2>

              <form onSubmit={handleFormSubmit} className="space-y-6 overflow-y-auto flex-1 pr-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Form Title</label>
                    <input 
                      required
                      value={formTitle}
                      onChange={e => {
                        setFormTitle(e.target.value);
                        if (!isEditing) {
                          setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none text-sm" 
                      placeholder="e.g. Logo Design Brief"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">URL Slug</label>
                    <input 
                      required
                      value={formSlug}
                      onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none text-sm" 
                      placeholder="e.g. logo-design-brief"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Description</label>
                  <textarea 
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none text-sm min-h-[60px]" 
                    placeholder="Provide a brief explanation of what this form is for..."
                  />
                </div>

                {/* Form Fields Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Form Questions / Fields</h3>
                    <button 
                      type="button" 
                      onClick={handleAddFormField}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80 transition-opacity bg-primary/10 px-3 py-1.5 rounded-full"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="p-4 rounded-xl border border-border bg-background/30 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-xs font-bold text-muted-foreground bg-muted h-6 w-6 rounded-full flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                            <div className="sm:col-span-2">
                              <input 
                                required
                                value={field.label}
                                onChange={e => handleFieldChange(field.id, { label: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm" 
                                placeholder="Question Label (e.g. What is your brand name?)"
                              />
                            </div>
                            <div>
                              <select 
                                value={field.type}
                                onChange={e => handleFieldChange(field.id, { type: e.target.value as any })}
                                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm"
                              >
                                <option value="text">Text Input</option>
                                <option value="textarea">Paragraph Answer</option>
                                <option value="select">Multiple Choice (Dropdown)</option>
                                <option value="checkbox">Yes/No Checkbox</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={field.required}
                                  onChange={e => handleFieldChange(field.id, { required: e.target.checked })}
                                  className="rounded border-border text-primary focus:ring-primary"
                                />
                                Required
                              </label>
                            </div>
                          </div>
                          
                          {/* Disable deleting Name/Email since they are crucial for metadata */}
                          {field.id !== "field_name" && field.id !== "field_email" && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFormField(field.id)}
                              className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors mt-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {field.type === "select" && (
                          <div className="pl-10">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Options (Comma separated)</label>
                            <input 
                              required
                              value={field.options?.join(", ") || ""}
                              onChange={e => handleFieldChange(field.id, { options: e.target.value.split(",").map(o => o.trim()).filter(Boolean) })}
                              className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-xs" 
                              placeholder="e.g. Logo Design, Web Development, Full Branding Package"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-6 flex gap-3">
                  <button 
                    type="submit" 
                    className="flex-1 py-3.5 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isEditing ? 'Save Template Changes' : 'Create Requirements Form'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBMISSION VIEWER MODAL */}
      <AnimatePresence>
        {selectedSubmission && (
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
              className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 my-auto max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setSelectedSubmission(null)}
                className="absolute top-4 right-4 z-10 h-10 w-10 bg-background hover:bg-background/80 text-foreground border border-border rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-border pb-4 mb-6">
                <span className="text-xs bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full font-bold">
                  {selectedSubmission.form_title} Brief
                </span>
                <h2 className="text-2xl font-bold mt-3">{selectedSubmission.client_name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {selectedSubmission.client_email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Submitted on {new Date(selectedSubmission.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 pr-2 mb-6">
                {(() => {
                  let answers: Record<string, any> = {};
                  try { answers = JSON.parse(selectedSubmission.answers_json); } catch {}
                  return Object.entries(answers).map(([key, val]) => (
                    <div key={key} className="p-4 rounded-xl border border-border/60 bg-muted/20">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">{key}</h4>
                      <p className="text-foreground text-sm whitespace-pre-line leading-relaxed font-medium">
                        {typeof val === 'boolean' ? (val ? "Yes" : "No") : val || "—"}
                      </p>
                    </div>
                  ));
                })()}
              </div>

              <div className="border-t border-border pt-4 flex gap-3">
                <button 
                  onClick={() => handleDownloadSubmission(selectedSubmission)}
                  className="flex-1 py-3.5 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Text
                </button>
                <button 
                  onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                  className="flex-1 py-3.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-3.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
