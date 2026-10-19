import React, { useState, useEffect } from "react";
import { Loader2, Layers, Calendar, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function ProjectsManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        setProjects(await res.json());
      } else {
        toast.error("Failed to load projects");
      }
    } catch (e) {
      toast.error("Error loading projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success(`Project marked as ${status}`);
        fetchProjects();
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage active and closed projects.</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-3">
            <Layers className="h-10 w-10 text-muted" />
            <p>No projects found. Projects are automatically created when an agreement is signed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 font-semibold">Project Name</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Budget</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/30 transition">
                    <td className="p-4">
                      <p className="font-semibold text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{project.client_name}</p>
                      <p className="text-xs text-muted-foreground">{project.company_name}</p>
                    </td>
                    <td className="p-4 text-sm font-medium">{project.budget}</td>
                    <td className="p-4">
                      <select 
                        value={project.status} 
                        onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                        className="text-xs font-bold bg-transparent border border-border rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-xs font-bold text-primary hover:underline flex items-center justify-end gap-1 w-full">
                        Manage <ArrowRight className="h-3 w-3" />
                      </button>
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
