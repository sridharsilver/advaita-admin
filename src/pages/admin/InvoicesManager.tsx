import React, { useState, useEffect } from "react";
import { Loader2, DollarSign, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function InvoicesManager() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/admin/invoices");
      if (res.ok) {
        setInvoices(await res.json());
      } else {
        toast.error("Failed to load invoices");
      }
    } catch (e) {
      toast.error("Error loading invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkAsPaid = async (id: number) => {
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Paid" }),
      });
      if (res.ok) {
        toast.success("Invoice marked as Paid");
        fetchInvoices();
      }
    } catch (e) {
      toast.error("Failed to update status");
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage project invoices and payments.</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-3">
            <DollarSign className="h-10 w-10 text-muted" />
            <p>No invoices found. Invoices are generated automatically during the project lifecycle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 font-semibold">Client / Project</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/30 transition">
                    <td className="p-4">
                      <p className="font-semibold text-sm">{invoice.client_name}</p>
                      <p className="text-xs text-muted-foreground">{invoice.project_name}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded text-xs font-semibold">
                        {invoice.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium">{invoice.amount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        invoice.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {invoice.status !== "Paid" && (
                        <button 
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          Mark Paid
                        </button>
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
