import React, { useState, useEffect } from "react";
import { Loader2, Shield, Eye, CheckCircle, ExternalLink, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function AgreementsManager() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgreements = async () => {
    try {
      const res = await fetch("/api/admin/agreements");
      if (res.ok) {
        setAgreements(await res.json());
      } else {
        toast.error("Failed to load agreements");
      }
    } catch (e) {
      toast.error("Error loading agreements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const handleUploadPDF = async (id: number) => {
    const url = prompt("Enter URL of the signed PDF:");
    if (url) {
      try {
        const res = await fetch("/api/admin/agreements", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, pdf_url: url, status: "Signed" }),
        });
        if (res.ok) {
          toast.success("PDF URL uploaded and agreement marked as signed.");
          fetchAgreements();
        }
      } catch (e) {
        toast.error("Failed to upload PDF");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Service Agreements</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage pending and signed client agreements.</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {agreements.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-3">
            <Shield className="h-10 w-10 text-muted" />
            <p>No agreements found. When a proposal is approved, an agreement will be generated automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 font-semibold">Client / Company</th>
                  <th className="p-4 font-semibold">Project</th>
                  <th className="p-4 font-semibold">Value</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-muted/30 transition">
                    <td className="p-4">
                      <p className="font-semibold text-sm">{agreement.client_name}</p>
                      <p className="text-xs text-muted-foreground">{agreement.company_name || "N/A"}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{agreement.project_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> {new Date(agreement.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {agreement.project_value}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        agreement.status === "Signed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {agreement.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <a href={`/agreement/${agreement.id}/sign`} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition" title="View Agreement">
                        <Eye className="h-4 w-4" />
                      </a>
                      {agreement.status === "Pending" && (
                        <button onClick={() => handleUploadPDF(agreement.id)} className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition" title="Upload Signed PDF (Local Client)">
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                      {agreement.pdf_url && (
                        <a href={agreement.pdf_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg transition" title="Download Signed PDF">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
