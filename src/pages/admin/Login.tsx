import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        toast.success("Welcome back, Sridhar!");
        window.location.href = "/admin";
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-[85vh] safe-bottom">
      <div className="w-full max-w-sm glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-border/80">
        <div className="absolute inset-0 bg-gradient-brand opacity-10 pointer-events-none" />
        
        <div className="relative">
          {/* Animated Lock Badge */}
          <div className="h-16 w-16 rounded-3xl bg-gradient-brand text-primary-foreground flex items-center justify-center mb-5 mx-auto shadow-lg shadow-primary/20 relative">
            <Lock className="h-7 w-7" />
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white">
              <ShieldCheck className="h-3 w-3" />
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Advaita Admin Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Security Check</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your admin passphrase to unlock
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-background/70 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 active:scale-90 transition-transform"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-96 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Unlock Dashboard"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/60 text-center">
            <p className="text-[11px] text-muted-foreground font-medium">
              Encrypted Session • Cloudflare D1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
