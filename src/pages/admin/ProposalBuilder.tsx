import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Eye, Save,
  Upload, X, Settings, List, FileText, Check, DollarSign, 
  Calendar, Layers, Sparkles, Loader2, Sun, Moon, ChevronRight,
  CheckCircle2, Mail, Phone, Globe, ChevronDown, PlusCircle
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/advaita-logo.webp";
import { useTheme } from "@/components/ThemeProvider";
import RichTextEditor from "@/components/RichTextEditor";

interface Section {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  items?: any[];
  config?: Record<string, any>;
}

const SECTION_TEMPLATES: Record<string, Partial<Section>> = {
  hero: {
    title: "Project Proposal",
    subtitle: "Prepared for [Client Name]",
    content: "Crafting digital excellence and tailored solutions for your brand.",
    config: { gradient: "from-indigo-600 via-purple-600 to-pink-600" }
  },
  about: {
    title: "About Advaita Designs",
    content: "<p>Advaita Designs is a premium digital agency. We specialize in building cutting-edge websites, visual branding, and interactive experiences that elevate brands to new heights.</p><p>Our design philosophy is rooted in minimalism, visual excellence, and modern craftsmanship. We don't just build websites; we create digital assets that drive conversions.</p>"
  },
  understanding: {
    title: "Project Understanding",
    content: "<p>We understand that you are looking to redesign your digital presence to better reflect your premium service offerings. The primary goal is to establish trust, build authority, and provide a seamless, modern interface for potential leads.</p>"
  },
  goals: {
    title: "Goals & Objectives",
    items: [
      { title: "Brand Elevation", description: "Establish a visually stunning identity that sets you apart from competitors." },
      { title: "Performance Optimization", description: "Deliver ultra-fast page load times and perfect responsiveness across all devices." },
      { title: "Conversion Growth", description: "Design a strategic user journey that seamlessly guides visitors toward booking calls." }
    ]
  },
  scope: {
    title: "Scope of Work",
    items: [
      { title: "Discovery & Strategy", description: "User persona definitions, content structuring, and creative wireframing." },
      { title: "UI/UX Design", description: "Figma design mockups of all major pages with interactive prototyping." },
      { title: "Development", description: "High-performance code built using React, Vite, Tailwind CSS, and headless integrations." }
    ]
  },
  deliverables: {
    title: "Key Deliverables",
    items: [
      { name: "Responsive React Website", detail: "A complete website with pixel-perfect design on mobile, tablet, and desktop." },
      { name: "Visual Identity Assets", detail: "Updated logo files, custom icons, typography rules, and interactive brand components." },
      { name: "CMS Integration", detail: "An easy-to-use editor interface for modifying text, blog posts, and portfolio items." }
    ]
  },
  process: {
    title: "Our Process",
    items: [
      { step: "01", name: "Onboarding & Strategy", desc: "Setting goals, timeline alignment, and wireframe creation." },
      { step: "02", name: "UI/UX High-Fidelity Design", desc: "Figma UI prototyping and branding styles approval." },
      { step: "03", name: "Development & SEO Setup", desc: "Clean frontend coding, animations, and search engine optimization." },
      { step: "04", name: "Launch & Support", desc: "Domain transfer, quality assurance testing, and editor training." }
    ]
  },
  timeline: {
    title: "Project Timeline",
    items: [
      { milestone: "Wireframes & Branding Strategy", duration: "Week 1 - 2" },
      { milestone: "High-Fidelity UI/UX Designs", duration: "Week 3 - 4" },
      { milestone: "Frontend & Backend Development", duration: "Week 5 - 7" },
      { milestone: "QA Testing & Website Launch", duration: "Week 8" }
    ]
  },
  pricing: {
    title: "Pricing Packages",
    config: { showGST: true, gstRate: 18, currency: "INR" },
    items: [
      {
        name: "Premium Redesign",
        price: 150000,
        popular: true,
        features: ["Custom UI/UX Design (Figma)", "Up to 5 Pages React/Vite App", "Standard SEO Optimization", "1 Month Post-launch Support"]
      },
      {
        name: "Enterprise Web App",
        price: 280000,
        popular: false,
        features: ["All Premium Features", "Headless CMS Integration", "Advanced Interactions & Micro-animations", "Custom D1 Database Setup", "3 Months Support"]
      }
    ]
  },
  addons: {
    title: "Optional Add-ons",
    items: [
      { name: "Extra Revision Round", price: 15000, description: "Add one extra round of design revisions during mockup phase." },
      { name: "Logo & Visual Branding", price: 40000, description: "A comprehensive brand identity deck including typography, logos, and business cards." }
    ]
  },
  terms: {
    title: "Terms & Conditions",
    content: "<p><strong>1. Payment Terms:</strong> 50% upfront deposit to initiate development, 30% after design approvals, and 20% prior to official domain launch.</p><p><strong>2. Timelines:</strong> Project timelines are estimates. Delays in receiving assets/feedback may shift launch dates.</p><p><strong>3. Content:</strong> Copywriting and product photography should be provided by client unless explicitly added as add-ons.</p>"
  },
  contact: {
    title: "Ready to Move Forward?",
    content: "Simply click the 'Accept Proposal' button on this page. We'll automatically receive a notification and draft the service agreement.",
    config: { email: "hello@advaitadesigns.com", phone: "+91 98765 43210" }
  },
  thankyou: {
    title: "Thank You!",
    content: "We're excited about the possibility of collaborating with you to build something exceptional. Let's create a website that represents the true level of your work."
  }
};

export function ProposalBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Metadata States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectType, setProjectType] = useState("Web Design & Development");
  const [clientType, setClientType] = useState("remote");
  const [coverImage, setCoverImage] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState("Draft");
  const [sections, setSections] = useState<Section[]>([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewDarkMode, setIsPreviewDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme: globalTheme } = useTheme();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [polishing, setPolishing] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiRawText, setAiRawText] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [previewSections, setPreviewSections] = useState<any[] | null>(null);
  const [aiGeneratedTitle, setAiGeneratedTitle] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => {
        if (data.clients) setAvailableClients(data.clients);
      })
      .catch(() => {});
  }, []);

  const handleLoadClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = parseInt(e.target.value);
    const client = availableClients.find(c => c.id === clientId);
    if (client) {
      setClientName(client.name);
      setCompanyName(client.company_name || "");
      setClientEmail(client.email || "");
      toast.success(`Loaded client: ${client.name}`);
    }
  };

  const sectionHasContent = (section: Section): 'filled' | 'partial' | 'empty' => {
    if (section.items && section.items.length > 0) return 'filled';
    if (section.content && section.content.replace(/<[^>]+>/g, '').trim().length > 20) return 'filled';
    if (section.content && section.content.replace(/<[^>]+>/g, '').trim().length > 0) return 'partial';
    return 'empty';
  };

  const getSectionPreview = (section: Section): string => {
    if (section.items && section.items.length > 0) {
      const first = section.items[0];
      return first.title || first.name || first.milestone || `${section.items.length} items`;
    }
    const text = (section.content || '').replace(/<[^>]+>/g, '').trim();
    return text.slice(0, 120) + (text.length > 120 ? '...' : '');
  };

  // Temporarily override the global dark mode class for the live preview modal
  useEffect(() => {
    if (isPreviewOpen) {
      document.documentElement.classList.toggle("dark", isPreviewDarkMode);
    } else {
      document.documentElement.classList.toggle("dark", globalTheme === "dark");
    }
    return () => {
      document.documentElement.classList.toggle("dark", globalTheme === "dark");
    };
  }, [isPreviewOpen, isPreviewDarkMode, globalTheme]);

  // Load site settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          setSettings(await res.json());
        }
      } catch (e) {
        console.error("Error loading settings", e);
      }
    };
    fetchSettings();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditMode && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [title, isEditMode]);

  // Load existing proposal data
  useEffect(() => {
    if (isEditMode) {
      const fetchProposal = async () => {
        try {
          const res = await fetch("/api/admin/proposals");
          if (res.ok) {
            const list = await res.json();
            const proposal = list.find((p: any) => p.id === Number(id));
            if (proposal) {
              setTitle(proposal.title);
              setSlug(proposal.slug);
              setClientName(proposal.client_name);
              setCompanyName(proposal.company_name || "");
              setClientEmail(proposal.client_email || "");
              setProjectType(proposal.project_type || "");
              setClientType(proposal.client_type || "remote");
              setCoverImage(proposal.cover_image || "");
              setValidUntil(proposal.valid_until || "");
              setStatus(proposal.status);
              setPassword(proposal.password || "");
              setSections(JSON.parse(proposal.content_json));
            } else {
              toast.error("Proposal not found");
              navigate("/admin");
            }
          } else {
            toast.error("Failed to load proposals list");
          }
        } catch (e) {
          toast.error("Error loading proposal details");
        } finally {
          setLoading(false);
        }
      };
      fetchProposal();
    } else {
      // Default Sections for new proposals
      setSections([
        { id: "1", type: "hero", ...SECTION_TEMPLATES.hero } as Section,
        { id: "2", type: "about", ...SECTION_TEMPLATES.about } as Section,
        { id: "3", type: "understanding", ...SECTION_TEMPLATES.understanding } as Section,
        { id: "4", type: "goals", ...SECTION_TEMPLATES.goals } as Section,
        { id: "5", type: "scope", ...SECTION_TEMPLATES.scope } as Section,
        { id: "6", type: "timeline", ...SECTION_TEMPLATES.timeline } as Section,
        { id: "7", type: "pricing", ...SECTION_TEMPLATES.pricing } as Section,
        { id: "8", type: "terms", ...SECTION_TEMPLATES.terms } as Section,
        { id: "9", type: "contact", ...SECTION_TEMPLATES.contact } as Section
      ]);
    }
  }, [id, isEditMode, navigate]);

  // Image Upload handler
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setCoverImage(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Section manipulation
  const addSection = (type: string) => {
    const template = SECTION_TEMPLATES[type];
    if (!template) return;
    const newSec: Section = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: template.title || "New Section",
      subtitle: template.subtitle,
      content: template.content,
      items: template.items ? JSON.parse(JSON.stringify(template.items)) : undefined,
      config: template.config ? JSON.parse(JSON.stringify(template.config)) : undefined
    };
    setSections([...sections, newSec]);
    toast.success(`Added ${type.toUpperCase()} section`);
  };

  const removeSection = (secId: string) => {
    setSections(sections.filter(s => s.id !== secId));
    toast.success("Section removed");
  };

  const toggleSection = (secId: string) => {
    setCollapsedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const nextIdx = direction === "up" ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[nextIdx];
    updated[nextIdx] = temp;
    setSections(updated);
  };

  const updateSectionField = (secId: string, field: string, value: any) => {
    setSections(sections.map(s => s.id === secId ? { ...s, [field]: value } : s));
  };

  const updateSectionConfig = (secId: string, key: string, value: any) => {
    setSections(sections.map(s => s.id === secId ? {
      ...s,
      config: { ...(s.config || {}), [key]: value }
    } : s));
  };

  const handleSave = async () => {
    if (!title || !slug || !clientName) {
      toast.error("Please fill in the Title, Client Name, and Proposal URL.");
      return;
    }

    const payload = {
      id: isEditMode ? Number(id) : undefined,
      title,
      slug,
      client_name: clientName,
      company_name: companyName,
      client_email: clientEmail,
      project_type: projectType,
      client_type: clientType,
      cover_image: coverImage,
      status,
      valid_until: validUntil,
      content_json: JSON.stringify(sections),
      password
    };

    try {
      const endpoint = "/api/admin/proposals";
      const method = isEditMode ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Proposal saved successfully!`);
        navigate("/admin");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save proposal");
      }
    } catch (e) {
      toast.error("An error occurred while saving.");
    }
  };

  const handlePolish = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section?.content?.trim()) {
      toast.error("Please add some content first");
      return;
    }

    setPolishing(sectionId);
    try {
      const res = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: section.content })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to polish");
      }

      const data = await res.json();
      updateSectionField(sectionId, "content", data.polished);
      toast.success("Content polished ✨");
    } catch (e: any) {
      toast.error(e.message || "Failed to polish content");
    } finally {
      setPolishing(null);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiRawText.trim()) {
      toast.error("Please paste your rough notes first");
      return;
    }

    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiRawText })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate sections");
      }

      const data = await res.json();

      if (!data?.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
        throw new Error("AI returned no sections. Try adding more detail to your notes.");
      }

      setPreviewSections(data.sections);
      if (data.title) setAiGeneratedTitle(data.title);
      toast.success(`AI generated ${data.sections.length} sections — review and apply below`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate sections");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplySections = () => {
    if (!previewSections) return;

    const newSections = [...sections];
    let updatedCount = 0;

    for (const genSec of previewSections) {
      const existingIdx = newSections.findIndex(s => s.type === genSec.type);
      if (existingIdx >= 0) {
        newSections[existingIdx] = { ...newSections[existingIdx] };
        if (genSec.title) newSections[existingIdx].title = genSec.title;
        if (genSec.content) newSections[existingIdx].content = genSec.content;
        if (genSec.items) newSections[existingIdx].items = JSON.parse(JSON.stringify(genSec.items));
        updatedCount++;
      } else {
        const template = SECTION_TEMPLATES[genSec.type];
        newSections.push({
          id: Math.random().toString(36).substr(2, 9),
          type: genSec.type,
          title: genSec.title || template?.title || genSec.type,
          content: genSec.content || template?.content,
          subtitle: template?.subtitle,
          items: genSec.items ? JSON.parse(JSON.stringify(genSec.items)) : template?.items ? JSON.parse(JSON.stringify(template.items)) : undefined,
          config: template?.config ? { ...template.config } : undefined
        });
        updatedCount++;
      }
    }

    setSections(newSections);
    if (aiGeneratedTitle) setTitle(aiGeneratedTitle);
    setPreviewSections(null);
    setAiGeneratedTitle(null);
    setIsAiModalOpen(false);
    setAiRawText("");
    toast.success(`Applied ${updatedCount} sections ✨`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FAF9F6] min-h-screen">
        <Loader2 className="h-8 w-8 text-slate-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white text-slate-900 min-h-screen flex flex-col relative pb-32">
      {/* Top sticky nav */}
      <header className="border-b border-slate-100 sticky top-0 bg-white z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition -ml-1.5">
              <ArrowLeft className="h-4 w-4 text-slate-500" />
            </button>
            <span className="text-sm font-semibold text-slate-800">{isEditMode ? `Edit Proposal` : "New Proposal"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setIsAiModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition text-xs flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> AI
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
              <Settings className="h-4 w-4" />
            </button>
            <button onClick={() => setIsPreviewOpen(true)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-xs flex items-center gap-1.5">
              <Eye className="h-3 w-3" /> Preview
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition text-xs flex items-center gap-1.5">
              <Save className="h-3 w-3" /> Save
            </button>
          </div>
        </div>
      </header>

      {/* Main Single Column Layout */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-10">
        <main className="w-full space-y-8">
          
          {/* Document Sheet */}
          <div className="space-y-10">
            
            {/* Cover Page / Header editor */}
            <div className="pb-8 border-b border-slate-100 space-y-6">
              
              <div className="flex justify-center">
                <img src={logo} alt="Advaita Logo" className="h-8 object-contain opacity-80" />
              </div>

              <div className="space-y-3 max-w-xl mx-auto text-center">
                <input
                  required
                  type="text"
                  placeholder="Proposal Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-center text-2xl font-bold tracking-tight bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-2 py-1 outline-none transition placeholder:text-slate-300"
                />
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    placeholder="Project Type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="text-xs text-slate-500 bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none transition text-center placeholder:text-slate-300"
                  />
                  <span className="text-slate-200">·</span>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                    className="text-xs text-slate-500 bg-transparent border-0 outline-none cursor-pointer"
                  >
                    <option value="remote">Remote</option>
                    <option value="local">Local</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 pt-6 border-t border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Client</span>
                    {availableClients.length > 0 && (
                      <select 
                        onChange={handleLoadClient} value=""
                        className="text-[10px] font-medium text-indigo-600 bg-transparent border-0 outline-none cursor-pointer"
                      >
                        <option value="" disabled>Load client...</option>
                        {availableClients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input required type="text" placeholder="Name" value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-sm font-medium bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none transition placeholder:text-slate-300"
                  />
                  <input type="text" placeholder="Company" value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs text-slate-600 bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none transition placeholder:text-slate-300"
                  />
                  <input type="email" placeholder="Email" value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full text-xs text-slate-500 bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none transition placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">From</span>
                  <p className="text-sm font-medium text-slate-800">{settings.legal_name || "Sridhar Silver"}</p>
                  <p className="text-xs text-slate-500">{settings.email || "hello@advaita.design"}</p>
                </div>
              </div>
            </div>

            {/* Document Dynamic Sections */}
            {sections.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium">No sections added yet. Click items in the sidebar to build your document.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sections.map((section, index) => (
                  <div key={section.id} className="group/sec rounded-xl border border-transparent hover:border-slate-100 transition p-4">
                    {/* Section Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">{section.type}</span>
                        {collapsedSections[section.id] && (
                          <span className="text-sm font-medium text-slate-700 truncate">{section.title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/sec:opacity-100 transition shrink-0">
                        <button onClick={() => moveSection(index, "up")} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => moveSection(index, "down")} disabled={index === sections.length - 1} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => removeSection(section.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => toggleSection(section.id)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition">
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${collapsedSections[section.id] ? '' : 'rotate-180'}`} />
                        </button>
                      </div>
                    </div>

                    {!collapsedSections[section.id] && (
                    <>
                    <div className="mt-3 space-y-3">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSectionField(section.id, "title", e.target.value)}
                        className="text-base font-semibold bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none w-full transition placeholder:text-slate-300"
                      />
                      {section.subtitle !== undefined && (
                        <input
                          type="text"
                          value={section.subtitle || ""}
                          placeholder="Section subtitle"
                          onChange={(e) => updateSectionField(section.id, "subtitle", e.target.value)}
                          className="text-xs text-slate-500 bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none w-full transition placeholder:text-slate-300"
                        />
                      )}
                    </div>

                    {/* Text Blocks */}
                    {["hero", "about", "understanding", "terms", "thankyou", "contact"].includes(section.type) && (
                      <div className="mt-3">
                        <RichTextEditor
                          content={section.content || ""}
                          onChange={(html) => updateSectionField(section.id, "content", html)}
                          placeholder="Start writing..."
                        />
                        <div className="flex justify-end mt-1.5">
                          <button onClick={() => handlePolish(section.id)} disabled={polishing === section.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-50"
                          >
                            {polishing === section.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            Polish with AI
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Goals / Scope */}
                    {["goals", "scope"].includes(section.type) && (
                      <div className="mt-3 space-y-2">
                        {section.items?.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-3 group/item">
                            <div className="flex-1 space-y-1">
                              <input type="text" placeholder="Title" value={item.title}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].title = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="w-full text-sm font-medium bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none placeholder:text-slate-300"
                              />
                              <textarea placeholder="Description" value={item.description} rows={2}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].description = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="w-full text-xs text-slate-500 bg-transparent border-0 outline-none resize-none placeholder:text-slate-300"
                              />
                            </div>
                            <button onClick={() => {
                              const newItems = section.items?.filter((_, idx) => idx !== itemIdx);
                              updateSectionField(section.id, "items", newItems);
                            }} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition mt-0.5">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newItems = [...(section.items || []), { title: "", description: "" }];
                          updateSectionField(section.id, "items", newItems);
                        }} className="text-xs font-medium text-slate-400 hover:text-slate-600 transition flex items-center gap-1 px-1 py-1">
                          <Plus className="h-3 w-3" /> Add item
                        </button>
                      </div>
                    )}

                    {/* Deliverables */}
                    {section.type === "deliverables" && (
                      <div className="mt-3 space-y-2">
                        {section.items?.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-3 group/item">
                            <div className="flex-1 space-y-1">
                              <input type="text" placeholder="Deliverable name" value={item.name}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].name = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="w-full text-sm font-medium bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none placeholder:text-slate-300"
                              />
                              <textarea placeholder="Details" value={item.detail} rows={2}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].detail = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="w-full text-xs text-slate-500 bg-transparent border-0 outline-none resize-none placeholder:text-slate-300"
                              />
                            </div>
                            <button onClick={() => {
                              const newItems = section.items?.filter((_, idx) => idx !== itemIdx);
                              updateSectionField(section.id, "items", newItems);
                            }} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition mt-0.5">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newItems = [...(section.items || []), { name: "", detail: "" }];
                          updateSectionField(section.id, "items", newItems);
                        }} className="text-xs font-medium text-slate-400 hover:text-slate-600 transition flex items-center gap-1 px-1 py-1">
                          <Plus className="h-3 w-3" /> Add deliverable
                        </button>
                      </div>
                    )}

                    {/* Our Process */}
                    {section.type === "process" && (
                      <div className="mt-3 space-y-2">
                        {section.items?.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-3 group/item">
                            <span className="text-xs font-bold text-slate-300 w-6 pt-1 shrink-0">{item.step}</span>
                            <div className="flex-1 space-y-1">
                              <input type="text" placeholder="Step name" value={item.name}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].name = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="w-full text-sm font-medium bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none placeholder:text-slate-300"
                              />
                              <input type="text" placeholder="Brief description" value={item.desc}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].desc = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="w-full text-xs text-slate-500 bg-transparent border-0 outline-none px-1 placeholder:text-slate-300"
                              />
                            </div>
                            <button onClick={() => {
                              const newItems = section.items?.filter((_, idx) => idx !== itemIdx);
                              updateSectionField(section.id, "items", newItems);
                            }} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition mt-0.5">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newItems = [...(section.items || []), { step: String(section.items!.length + 1).padStart(2, "0"), name: "", desc: "" }];
                          updateSectionField(section.id, "items", newItems);
                        }} className="text-xs font-medium text-slate-400 hover:text-slate-600 transition flex items-center gap-1 px-1 py-1">
                          <Plus className="h-3 w-3" /> Add step
                        </button>
                      </div>
                    )}

                    {/* Project Timeline */}
                    {section.type === "timeline" && (
                      <div className="mt-3 space-y-2">
                        {section.items?.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-3 group/item">
                            <div className="flex-1 space-y-1">
                              <input type="text" placeholder="Milestone" value={item.milestone}
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].milestone = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="w-full text-sm font-medium bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none placeholder:text-slate-300"
                              />
                            </div>
                            <input type="text" placeholder="Duration" value={item.duration}
                              onChange={(e) => {
                                const newItems = [...(section.items || [])];
                                newItems[itemIdx].duration = e.target.value;
                                updateSectionField(section.id, "items", newItems);
                              }}
                              className="w-28 text-xs text-slate-500 bg-transparent border-0 border-b border-transparent focus:border-slate-200 px-1 py-0.5 outline-none text-right placeholder:text-slate-300"
                            />
                            <button onClick={() => {
                              const newItems = section.items?.filter((_, idx) => idx !== itemIdx);
                              updateSectionField(section.id, "items", newItems);
                            }} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition mt-0.5">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newItems = [...(section.items || []), { milestone: "", duration: "" }];
                          updateSectionField(section.id, "items", newItems);
                        }} className="text-xs font-medium text-slate-400 hover:text-slate-600 transition flex items-center gap-1 px-1 py-1">
                          <Plus className="h-3 w-3" /> Add milestone
                        </button>
                      </div>
                    )}

                    {/* Pricing Packages */}
                    {section.type === "pricing" && (
                      <div className="space-y-4 mt-3">
                        <div className="flex flex-wrap gap-4 items-center justify-between border border-slate-150 bg-slate-50/50 p-3 rounded-xl text-xs font-bold text-slate-600">
                          <label className="flex items-center gap-2 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={section.config?.showGST || false}
                              onChange={(e) => updateSectionConfig(section.id, "showGST", e.target.checked)}
                              className="rounded border-slate-350 focus:ring-slate-900 h-4 w-4"
                            />
                            Include 18% GST Billing
                          </label>
                          <div className="flex items-center gap-2">
                            <span>Currency:</span>
                            <select
                              value={section.config?.currency || "INR"}
                              onChange={(e) => updateSectionConfig(section.id, "currency", e.target.value)}
                              className="px-2 py-1 rounded bg-white border border-slate-250 text-xs font-bold"
                            >
                              <option value="INR">INR (₹)</option>
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {section.items?.map((item, itemIdx) => (
                            <div key={itemIdx} className="border border-slate-200 p-4 rounded-xl bg-slate-50/20 relative space-y-3 group/item">
                              <div className="flex justify-between items-center gap-2 border-b border-slate-100 pb-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  placeholder="Package Name"
                                  onChange={(e) => {
                                    const newItems = [...(section.items || [])];
                                    newItems[itemIdx].name = e.target.value;
                                    updateSectionField(section.id, "items", newItems);
                                  }}
                                  className="font-extrabold text-sm bg-transparent outline-none w-full"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                  <label className="flex items-center gap-1 text-[10px] select-none cursor-pointer font-bold text-slate-500">
                                    <input
                                      type="checkbox"
                                      checked={item.popular || false}
                                      onChange={(e) => {
                                        const newItems = [...(section.items || [])];
                                        newItems[itemIdx].popular = e.target.checked;
                                        updateSectionField(section.id, "items", newItems);
                                      }}
                                      className="rounded border-slate-300 h-3 w-3"
                                    />
                                    Popular
                                  </label>
                                  <button
                                    onClick={() => {
                                      const newItems = section.items?.filter((_, idx) => idx !== itemIdx);
                                      updateSectionField(section.id, "items", newItems);
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-400">{section.config?.currency === "USD" ? "$" : section.config?.currency === "EUR" ? "€" : "₹"}</span>
                                <input
                                  type="number"
                                  value={item.price}
                                  placeholder="Price"
                                  onChange={(e) => {
                                    const newItems = [...(section.items || [])];
                                    newItems[itemIdx].price = Number(e.target.value);
                                    updateSectionField(section.id, "items", newItems);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-black text-xs"
                                />
                              </div>

                              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Features</span>
                                {item.features?.map((feat: string, featIdx: number) => (
                                  <div key={featIdx} className="flex gap-1.5 items-center">
                                    <input
                                      type="text"
                                      value={feat}
                                      onChange={(e) => {
                                        const newItems = [...(section.items || [])];
                                        newItems[itemIdx].features[featIdx] = e.target.value;
                                        updateSectionField(section.id, "items", newItems);
                                      }}
                                      className="w-full px-2 py-0.5 rounded bg-white border border-slate-150 text-[11px]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newItems = [...(section.items || [])];
                                        newItems[itemIdx].features = newItems[itemIdx].features.filter((_: any, idx: number) => idx !== featIdx);
                                        updateSectionField(section.id, "items", newItems);
                                      }}
                                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = [...(section.items || [])];
                                    newItems[itemIdx].features = [...(newItems[itemIdx].features || []), "New feature point"];
                                    updateSectionField(section.id, "items", newItems);
                                  }}
                                  className="text-[10px] text-slate-900 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Plus className="h-2.5 w-2.5" /> Add Feature
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            const newItems = [...(section.items || []), { name: "New Tier", price: 0, features: ["Feature 1"], popular: false }];
                            updateSectionField(section.id, "items", newItems);
                          }}
                          className="w-full py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1 hover:bg-slate-100 transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Pricing Tier
                        </button>
                      </div>
                    )}

                    {/* Optional Add-ons */}
                    {section.type === "addons" && (
                      <div className="space-y-3 mt-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          {section.items?.map((item, itemIdx) => (
                            <div key={itemIdx} className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 relative space-y-2 group/item">
                              <button
                                onClick={() => {
                                  const newItems = section.items?.filter((_, idx) => idx !== itemIdx);
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover/item:opacity-100 transition"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              <input
                                type="text"
                                value={item.name}
                                placeholder="Addon Name"
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].name = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="font-bold text-xs bg-transparent outline-none w-4/5"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400">₹</span>
                                <input
                                  type="number"
                                  value={item.price}
                                  placeholder="Price"
                                  onChange={(e) => {
                                    const newItems = [...(section.items || [])];
                                    newItems[itemIdx].price = Number(e.target.value);
                                    updateSectionField(section.id, "items", newItems);
                                  }}
                                  className="w-28 px-2 py-0.5 bg-white border border-slate-250 rounded font-bold text-xs"
                                />
                              </div>
                              <input
                                type="text"
                                value={item.description}
                                placeholder="Short description"
                                onChange={(e) => {
                                  const newItems = [...(section.items || [])];
                                  newItems[itemIdx].description = e.target.value;
                                  updateSectionField(section.id, "items", newItems);
                                }}
                                className="w-full text-[11px] text-slate-500 bg-transparent outline-none"
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const newItems = [...(section.items || []), { name: "New Add-on", price: 0, description: "Option description." }];
                            updateSectionField(section.id, "items", newItems);
                          }}
                          className="w-full py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1 hover:bg-slate-100 transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Option/Addon
                        </button>
                      </div>
                    )}
                    </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Inline Section Adder */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(SECTION_TEMPLATES).map((type) => (
                  <button key={type} onClick={() => addSection(type)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 text-[11px] font-medium text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span className="capitalize">{type.replace("_", " ")}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>


      {/* Settings Sliding Drawer Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl flex flex-col border-l border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" />
                Proposal Settings
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-slate-50 rounded-full text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Proposal URL slug */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">URL Slug</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:border-slate-350">
                  <span className="px-2.5 py-2 text-xs text-slate-500 select-none flex items-center font-medium bg-slate-100">/proposal/</span>
                  <input
                    required
                    type="text"
                    placeholder="url-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                    className="w-full px-2 py-2 bg-transparent outline-none text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold focus:border-slate-350 outline-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Valid Until */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold focus:border-slate-350 outline-none"
                />
              </div>

              {/* Password / Passcode */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Access Passcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold focus:border-slate-350 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                      let code = "";
                      for (let i = 0; i < 8; i++) {
                        code += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setPassword(code);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs whitespace-nowrap transition"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Passcode is automatically appended to links when sharing. Leave empty to auto-generate.</p>
              </div>

              {/* Cover Image */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cover Image</label>
                {coverImage ? (
                  <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-md"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="w-4 h-4 mb-1 text-slate-400" />
                      <p className="text-[10px] text-slate-500"><span className="font-bold text-slate-700">Upload Image</span> (Max 2MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-2.5 bg-slate-950 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className={`fixed inset-0 z-50 overflow-y-auto flex flex-col ${isPreviewDarkMode ? "dark bg-[#0F172A] text-slate-100" : "bg-[#FAF9F6] text-[#0F172A]"} transition-colors duration-300`}>
          {/* Header */}
          <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black tracking-wider text-xs uppercase text-slate-500">PROPOSAL PREVIEW</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreviewDarkMode(!isPreviewDarkMode)}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition"
                title="Toggle Theme"
              >
                {isPreviewDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-full text-xs transition"
              >
                Exit Preview
              </button>
            </div>
          </div>
                  {/* Proposal Render */}
          <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-4xl print:py-0 print:px-0 flex-1">
            <div className="proposal-paper bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-16 space-y-12 sm:space-y-16 transition-colors duration-300 print:shadow-none print:border-none print:p-0">
              
              {/* Cover Page */}
              <section className="min-h-[45vh] flex flex-col justify-between py-6 sm:py-12 border-b border-slate-150 dark:border-slate-800/50 print:border-slate-200 print:min-h-[85vh]">
                <div className="space-y-8 sm:space-y-12 text-center my-auto">
                  <div className="flex justify-center mb-6 sm:mb-8">
                    <img src={logo} alt="Advaita Designs" className="h-16 sm:h-24 w-auto dark:hidden" />
                    <img src={logo} alt="Advaita Designs" className="hidden h-16 sm:h-24 w-auto dark:block dark:invert" />
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-2xl mx-auto leading-tight px-2">
                    {title || "Untitled Proposal"}
                  </h1>
                  
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-500 tracking-widest block">PREPARED FOR</span>
                    {companyName ? (
                      <>
                        <p className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                          {companyName}
                        </p>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                          Contact: {clientName || "[Client Name]"}
                        </p>
                      </>
                    ) : (
                      <p className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        {clientName || "[Client Name]"}
                      </p>
                    )}
                  </div>

                  <div className="w-32 sm:w-48 h-px bg-slate-200 dark:bg-slate-700 mx-auto" />

                  {sections.find(s => s.type === "hero")?.content && (
                    <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed px-4">
                      {sections.find(s => s.type === "hero")?.content}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-6 sm:justify-between sm:items-end pt-8 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 sm:border-t-0 mt-8 sm:mt-0">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">Prepared by:</p>
                    <p>{settings.legal_name || "Sridhar Silver"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Visual Designer • UI/UX Designer • Digital Consultant</p>
                  </div>
                  {validUntil && (
                    <div className="sm:text-right">
                      <p className="font-semibold text-slate-950 dark:text-white">Date:</p>
                      <p>Valid until {validUntil}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Dynamic Document Sections */}
              {sections.filter(s => s.type !== "hero").map((section) => {
                const isBreakSection = ["pricing", "terms", "contact", "thankyou"].includes(section.type);
                
                return (
                  <section 
                    key={section.id} 
                    className={`space-y-4 sm:space-y-6 ${isBreakSection ? "print-break-before" : ""}`}
                  >
                    {/* Section Header */}
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                      {section.title}
                    </h2>

                    {/* Scope Lists */}
                    {section.type === "scope" && section.items && (
                      <ul className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs sm:text-sm list-none pl-0">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-slate-400 dark:text-slate-500 select-none">•</span>
                            <div>
                              <strong className="text-slate-900 dark:text-white">{item.title || item.name}</strong>
                              {item.description && <span className="text-slate-500 dark:text-slate-400"> — {item.description}</span>}
                              {item.detail && <span className="text-slate-500 dark:text-slate-400"> — {item.detail}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Goals & Deliverables lists */}
                    {["goals", "deliverables", "process"].includes(section.type) && section.items && (
                      <ul className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs sm:text-sm list-none pl-0">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-slate-400 dark:text-slate-500 select-none">•</span>
                            <div>
                              <strong className="text-slate-900 dark:text-white">{item.title || item.name || `Step ${item.step}`}</strong>
                              {(item.description || item.detail || item.desc) && (
                                <span className="text-slate-500 dark:text-slate-400"> — {item.description || item.detail || item.desc}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Text / HTML content */}
                    {["understanding", "terms", "thankyou", "about", "contact"].includes(section.type) && section.content && (
                      <div 
                        className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    )}

                    {/* Timeline display */}
                    {section.type === "timeline" && section.items && (
                      <ul className="space-y-2.5 text-slate-600 dark:text-slate-300 text-xs sm:text-sm list-none pl-0">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-slate-400 dark:text-slate-500 select-none">•</span>
                            <div>
                              <strong className="text-slate-900 dark:text-white">{item.milestone || item.title}</strong>
                              {(item.duration || item.desc) && (
                                <span className="text-slate-500 dark:text-slate-400"> — {item.duration || item.desc}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Pricing / Cost Table */}
                    {section.type === "pricing" && section.items && (
                      <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[300px]">
                            <thead>
                              <tr className="bg-slate-900 text-white dark:bg-slate-800">
                                <th className="p-2.5 sm:p-3 font-semibold">Item</th>
                                <th className="p-2.5 sm:p-3 font-semibold text-right">Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                              {(() => {
                                const items = section.items.filter(item => {
                                  const name = item.name.toLowerCase();
                                  return !name.includes("total") && !name.includes("overall") && !name.includes("gst");
                                });

                                const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
                                const hasGST = section.config?.showGST;
                                const gstRate = section.config?.gstRate || 18;
                                const gstAmount = hasGST ? (subtotal * gstRate) / 100 : 0;
                                const grandTotal = subtotal + gstAmount;

                                return (
                                  <>
                                    {items.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                        <td className="p-2.5 sm:p-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                        <td className="p-2.5 sm:p-3 text-right font-bold text-slate-900 dark:text-white">
                                          ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                        </td>
                                      </tr>
                                    ))}

                                    {hasGST && (
                                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                        <td className="p-2.5 sm:p-3 font-medium text-slate-500 dark:text-slate-400">{gstRate}% GST</td>
                                        <td className="p-2.5 sm:p-3 text-right font-bold text-slate-500 dark:text-slate-400">
                                          ₹{gstAmount.toLocaleString("en-IN")}
                                        </td>
                                      </tr>
                                    )}

                                    <tr className="bg-emerald-50 dark:bg-emerald-950/20 font-bold">
                                      <td className="p-2.5 sm:p-3 text-slate-900 dark:text-white">Overall Project Cost Summary</td>
                                      <td className="p-2.5 sm:p-3 text-right font-black text-slate-900 dark:text-white">
                                        ₹{grandTotal.toLocaleString("en-IN")}
                                      </td>
                                    </tr>
                                  </>
                                );
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Add-ons */}
                    {section.type === "addons" && section.items && (
                      <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[300px]">
                            <thead>
                              <tr className="bg-slate-900 text-white dark:bg-slate-800">
                                <th className="p-2.5 sm:p-3 font-semibold">Service</th>
                                <th className="p-2.5 sm:p-3 font-semibold text-right">Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                              {section.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                  <td className="p-2.5 sm:p-3">
                                    <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                                    {item.description && <span className="text-slate-500 dark:text-slate-400 block text-[10px] sm:text-xs mt-0.5">{item.description}</span>}
                                  </td>
                                  <td className="p-2.5 sm:p-3 text-right font-bold text-slate-900 dark:text-white">
                                    {item.price > 0 ? `₹${item.price.toLocaleString("en-IN")}` : "Extra"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}

              {/* Simple Signature Footer */}
              <section className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 print:border-slate-200">
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">{settings.legal_name || "Sridhar Silver"}</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Visual Designer • UI/UX Designer • Digital Consultant</p>
                </div>
                
                {/* Decison Actions */}
                <div className="flex flex-col xs:flex-row gap-2.5 no-print w-full sm:w-auto sm:justify-end items-stretch xs:items-center mt-2 sm:mt-0">
                  <button disabled className="px-6 py-2.5 border border-slate-250 text-xs sm:text-sm font-semibold rounded-full opacity-50">
                    Decline
                  </button>
                  <button disabled className="px-8 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold rounded-full opacity-50">
                    Accept Proposal
                  </button>
                </div>
              </section>
            </div>          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"                   onClick={() => { if (!aiGenerating) { setPreviewSections(null); setAiGeneratedTitle(null); setIsAiModalOpen(false); } }} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    {previewSections ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <h2 className="font-black text-sm">{previewSections ? "Review Generated Sections" : "AI Section Generator"}</h2>
                    <p className="text-[10px] text-slate-500">
                      {previewSections
                        ? `${previewSections.length} section${previewSections.length > 1 ? 's' : ''} generated — review then apply`
                        : "Paste your rough notes and let AI structure them into sections"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setPreviewSections(null); setAiGeneratedTitle(null); setIsAiModalOpen(false); }}
                  disabled={aiGenerating}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {previewSections ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {aiGeneratedTitle && (
                    <div className="border border-slate-200 rounded-xl p-3 bg-indigo-50/50 space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500">Proposal Title</span>
                      <p className="text-sm font-bold text-indigo-900">{aiGeneratedTitle}</p>
                    </div>
                  )}
                  {previewSections.map((sec, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{sec.type}</span>
                        {sec.title && <span className="text-xs font-bold text-slate-700 truncate">{sec.title}</span>}
                      </div>
                      {sec.content && (
                        <div className="text-[11px] text-slate-600 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: sec.content }} />
                      )}
                      {sec.items && sec.items.length > 0 && (
                        <div className="space-y-1">
                          {sec.items.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                              <span className="text-slate-400 mt-0.5">•</span>
                              <span>{item.title || item.name || item.milestone || item.step}</span>
                            </div>
                          ))}
                          {sec.items.length > 3 && (
                            <p className="text-[10px] text-slate-400 pl-4">+{sec.items.length - 3} more items</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6">
                  <textarea
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    placeholder={`Paste your raw notes here...\n\nExample:\nWe need a modern website redesign. Our current site is outdated. We want fast loading, better SEO, and a clean design. Budget is around 2-3 lakhs. Timeline is 6-8 weeks. We also need logo design and branding...`}
                    className="w-full h-64 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-slate-300 transition resize-none font-mono"
                    disabled={aiGenerating}
                  />
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    The AI will analyze your notes and automatically populate relevant sections (About, Project Understanding, Goals, Scope, Process, Timeline, Pricing, Terms, etc.).
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
                {previewSections ? (
                  <>
                    <button
                      onClick={() => setPreviewSections(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleApplySections}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:from-emerald-400 hover:to-green-500 transition text-xs shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Apply {previewSections.length} Section{previewSections.length > 1 ? 's' : ''}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsAiModalOpen(false)}
                      disabled={aiGenerating}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAiGenerate}
                      disabled={aiGenerating || !aiRawText.trim()}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-500 hover:to-purple-500 transition text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          Generate Sections
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
