import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2, Mail, CreditCard, Share2, Phone, MapPin, Building, Globe,
  Bell, BellOff, Send, Layout, User, MessageCircle, Instagram, Facebook,
  Linkedin, Twitter, Sun, Moon, Check, ChevronDown, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  isPushSupported,
  getPermissionStatus,
  getSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
} from "@/lib/pushNotifications";

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text", rows }: {
  icon: any; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; rows?: number;
}) {
  const Tag = rows ? "textarea" : "input";
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </label>
      <div className="relative">
        <Tag
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          rows={rows}
          type={rows ? undefined : type}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none transition-all focus:ring-4 focus:ring-primary/10 shadow-sm ${rows ? "resize-none" : ""}`}
        />
      </div>
    </div>
  );
}

export function SettingsManager() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("contact");

  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) setSettings(await res.json());
    } catch {
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const checkPushStatus = async () => {
    const supported = isPushSupported();
    setPushSupported(supported);
    setPushPermission(getPermissionStatus());
    if (supported) {
      const subscription = await getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  useEffect(() => {
    fetchData();
    checkPushStatus();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Settings saved successfully", { duration: 2000 });
      } else {
        const err = await res.text();
        toast.error(err || "Failed to save settings");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (isSubscribed) {
        const success = await unsubscribeFromPush();
        if (success) {
          setIsSubscribed(false);
          toast.success("Push notifications disabled");
        } else {
          toast.error("Failed to unsubscribe");
        }
      } else {
        const success = await subscribeToPush();
        if (success) {
          setIsSubscribed(true);
          toast.success("Push notifications enabled!");
        } else {
          const perm = getPermissionStatus();
          setPushPermission(perm);
          if (perm === "denied") {
            toast.error("Notification permission was denied. Please enable it in your browser settings.");
          } else {
            toast.error("Failed to enable push notifications");
          }
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPushLoading(false);
      checkPushStatus();
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        toast.success("Test notification sent!");
      } else {
        toast.error("Failed to send test notification");
      }
    } catch {
      toast.error("Failed to send test notification");
    } finally {
      setTestLoading(false);
    }
  };

  const s = (key: string) => settings[key] || "";
  const set = (key: string, val: string) => setSettings({ ...settings, [key]: val });

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-4xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded-2xl mt-8" />
          <div className="h-64 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  const tabContent = (key: string, children: React.ReactNode) => (
    <TabsContent value={key} className="mt-0 focus-visible:ring-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TabsContent>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-4xl pb-28">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your billing details, social accounts, and notifications.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full h-14 bg-background/50 border border-border p-1 rounded-2xl mb-6 shadow-sm">
            {[
              { value: "contact", icon: Phone, label: "Contact" },
              { value: "billing", icon: CreditCard, label: "Billing" },
              { value: "socials", icon: Share2, label: "Socials" },
              { value: "sections", icon: Layout, label: "Sections" },
              { value: "stats", icon: BarChart3, label: "Stats" },
              { value: "notifications", icon: Bell, label: "Notifs" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-xl flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabContent("contact", (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Phone className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Contact Details</h3>
              </div>
              <div className="space-y-4">
                <Field icon={Mail} label="Email Address" value={s("email")} onChange={v => set("email", v)} placeholder="hello@advaita.design" />
                <div>
                  <Field icon={Phone} label="Phone Number" value={s("phone")} onChange={v => set("phone", v)} placeholder="+91 00000 00000" />
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/30 mt-3">
                    <div>
                      <span className="text-sm font-medium block">Show Phone Number</span>
                      <span className="text-xs text-muted-foreground">Toggle visibility of the phone contact link</span>
                    </div>
                    <Switch checked={settings.show_phone !== "false"} onCheckedChange={c => set("show_phone", c ? "true" : "false")} />
                  </div>
                </div>
                <div>
                  <Field icon={MessageCircle} label="WhatsApp Number" value={s("whatsapp")} onChange={v => set("whatsapp", v)} placeholder="e.g. 910000000000" />
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/30 mt-3">
                    <div>
                      <span className="text-sm font-medium block">Show WhatsApp</span>
                      <span className="text-xs text-muted-foreground">Toggle visibility of the WhatsApp contact link</span>
                    </div>
                    <Switch checked={settings.show_whatsapp !== "false"} onCheckedChange={c => set("show_whatsapp", c ? "true" : "false")} />
                  </div>
                </div>
                <div>
                  <Field icon={MapPin} label="Physical Address (Contracts & Proposals)" value={s("address")} onChange={v => set("address", v)} placeholder="123 Street, City..." rows={3} />
                </div>
                <div>
                  <Field icon={Globe} label="Virtual Address (Homepage)" value={s("virtual_address")} onChange={v => set("virtual_address", v)} placeholder="e.g. Available for remote work worldwide" rows={3} />
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/30 mt-3">
                    <div>
                      <span className="text-sm font-medium block">Show Virtual Address</span>
                      <span className="text-xs text-muted-foreground">Toggle visibility of the virtual address on the homepage</span>
                    </div>
                    <Switch checked={settings.show_virtual_address !== "false"} onCheckedChange={c => set("show_virtual_address", c ? "true" : "false")} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {tabContent("billing", (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Building className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Billing & Legal</h3>
              </div>
              <div className="space-y-4">
                <Field icon={User} label="Legal Name (For Signatures)" value={s("legal_name")} onChange={v => set("legal_name", v)} placeholder="e.g. Sridhar Silver" />
                <Field icon={User} label="About Section Image Caption" value={s("about_image_caption")} onChange={v => set("about_image_caption", v)} placeholder="e.g. Sridhar Silver — Founder & Creative Director" />
                <Field icon={CreditCard} label="Payment Details / Bank Instructions" value={s("payment_instructions")} onChange={v => set("payment_instructions", v)} placeholder="Bank account details, UPI, PayPal..." rows={6} />
              </div>
            </div>
          ))}

          {tabContent("socials", (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Social Media & Review Links</h3>
              </div>
              <div className="space-y-4">
                <Field icon={Instagram} label="Instagram URL" value={s("instagram_url")} onChange={v => set("instagram_url", v)} placeholder="https://instagram.com/..." />
                <Field icon={Facebook} label="Facebook URL" value={s("facebook_url")} onChange={v => set("facebook_url", v)} placeholder="https://facebook.com/..." />
                <Field icon={Linkedin} label="LinkedIn URL" value={s("linkedin_url")} onChange={v => set("linkedin_url", v)} placeholder="https://linkedin.com/..." />
                <Field icon={Twitter} label="Twitter URL" value={s("twitter_url")} onChange={v => set("twitter_url", v)} placeholder="https://twitter.com/..." />
                
                <div className="border-t border-border/50 pt-6 mt-6 space-y-4">
                  <h4 className="text-sm font-bold text-foreground">Google Review Settings</h4>
                  <Field icon={MessageCircle} label="Google Review Share Text" value={s("google_review_text")} onChange={v => set("google_review_text", v)} placeholder="Hi! We loved working with you on your project. If you're happy with our services, would you mind leaving us a quick review on Google?" />
                  <Field icon={Globe} label="Google Review Link" value={s("google_review_link")} onChange={v => set("google_review_link", v)} placeholder="https://maps.app.goo.gl/q8YxR3xzhQY9hLZX6" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/30">
                <div>
                  <span className="text-sm font-medium block">Show Social Links</span>
                  <span className="text-xs text-muted-foreground">Display social media icons in the contact section</span>
                </div>
                <Switch checked={settings.show_social_links !== "false"} onCheckedChange={c => set("show_social_links", c ? "true" : "false")} />
              </div>
            </div>
          ))}

          {tabContent("sections", (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Layout className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Homepage Sections</h3>
              </div>
              <p className="text-sm text-muted-foreground">Toggle visibility of sections on the public homepage. <strong>Hero Section</strong> and <strong>About Section</strong> are always visible.</p>
              <div className="space-y-3">
                {[
                  { key: "show_stats", label: "Stats Section", desc: "Show/hide the statistics counters section" },
                  { key: "show_services", label: "Services Section", desc: "Show/hide the services/offerings section" },
                  { key: "show_portfolio", label: "Selected Work Section", desc: "Show/hide the portfolio/selected work grid on the homepage" },
                  { key: "show_fiverr_reviews", label: "Fiverr Reviews Section", desc: "Show/hide the Fiverr reviews carousel" },
                  { key: "show_experience", label: "Experience Section", desc: "Show/hide the experience/timeline section" },
                  { key: "show_process", label: "Process Section", desc: "Show/hide the workflow/process section" },
                  { key: "show_testimonials", label: "Testimonials Section", desc: "Show/hide the testimonials carousel on the homepage" },
                  { key: "show_marquee", label: "Marquee Section", desc: "Show/hide the scrolling brand logos marquee on the homepage" },
                  { key: "show_contact", label: "Contact Section", desc: "Show/hide the contact/form section at the bottom" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/30">
                    <div>
                      <span className="text-sm font-medium block">{label}</span>
                      <span className="text-xs text-muted-foreground">{desc}</span>
                    </div>
                    <Switch checked={settings[key] !== "false"} onCheckedChange={c => set(key, c ? "true" : "false")} />
                  </div>
                ))}
              </div>

            </div>
          ))}

          {tabContent("stats", (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Statistics Values</h3>
              </div>
              <p className="text-sm text-muted-foreground">Edit the values shown in the stats counter section and used across the site.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "stat_years_experience", label: "Years Exp.", desc: "e.g. 17+" },
                  { key: "stat_projects_delivered", label: "Projects Delivered", desc: "e.g. 100+" },
                  { key: "stat_happy_clients", label: "Happy Clients", desc: "e.g. 424+" },
                  { key: "stat_creative_support", label: "Support Availability", desc: "e.g. 24/7" },
                  { key: "stat_clients_served", label: "Total Clients Served", desc: "e.g. 424+" },
                  { key: "stat_countries_served", label: "Countries Served", desc: "e.g. 12" },
                  { key: "stat_brands_served", label: "Brands Served", desc: "e.g. 75+" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">{label}</label>
                    <input
                      value={s(key)}
                      onChange={e => set(key, e.target.value)}
                      placeholder={desc}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none transition-all focus:ring-4 focus:ring-primary/10 shadow-sm text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {tabContent("notifications", (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Push Notifications</h3>
              </div>

              {!pushSupported ? (
                <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center space-y-2">
                  <BellOff className="h-8 w-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-medium">Push notifications are not supported</p>
                  <p className="text-xs text-muted-foreground">Your browser or device doesn't support push notifications. Try using Chrome on Android or desktop.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {pushPermission === "denied" && (
                    <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-1">
                      <p className="text-sm font-medium text-red-500">Permission Blocked</p>
                      <p className="text-xs text-muted-foreground">
                        Notification permission has been blocked. To re-enable, click the lock icon in your browser's address bar and allow notifications.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-5 rounded-2xl border border-border bg-background/30">
                    <div className="space-y-1">
                      <span className="text-sm font-semibold block">Enable Push Notifications</span>
                      <span className="text-xs text-muted-foreground">Receive instant alerts for new inquiries, signed proposals, and testimonials.</span>
                    </div>
                    <Switch checked={isSubscribed} onCheckedChange={handleTogglePush} disabled={pushLoading || pushPermission === "denied"} />
                  </div>

                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium ${isSubscribed ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-muted/50 text-muted-foreground border border-border/50"}`}>
                    <span className={`h-2 w-2 rounded-full ${isSubscribed ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                    {isSubscribed ? "Subscribed — you will receive push notifications on this device" : "Not subscribed — notifications are disabled"}
                  </div>

                  <div className="p-4 rounded-2xl border border-border/50 bg-background/20 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">You'll be notified when:</p>
                    <div className="space-y-2">
                      {[
                        { icon: Mail, color: "amber", text: "A new client inquiry is submitted" },
                        { icon: CreditCard, color: "emerald", text: "A proposal is signed by a client" },
                        { icon: Globe, color: "indigo", text: "A new testimonial is submitted" },
                      ].map(({ icon: Icon, color, text }) => {
                        const bgClass = color === "amber" ? "bg-amber-500/10" : color === "emerald" ? "bg-emerald-500/10" : "bg-indigo-500/10";
                        const textClass = color === "amber" ? "text-amber-500" : color === "emerald" ? "text-emerald-500" : "text-indigo-500";
                        return (
                          <div key={text} className="flex items-center gap-3 text-sm">
                            <span className={`h-8 w-8 rounded-lg ${bgClass} flex items-center justify-center shrink-0`}>
                              <Icon className={`h-4 w-4 ${textClass}`} />
                            </span>
                            <span>{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {isSubscribed && (
                    <button type="button" onClick={handleTestNotification} disabled={testLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-background/50 hover:bg-muted text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Test Notification
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </Tabs>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
              {settings.default_dark_mode !== "false" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <div>
              <span className="text-sm font-medium block">Default Dark Mode</span>
              <span className="text-xs text-muted-foreground">New visitors see dark mode by default. They can still toggle it.</span>
            </div>
          </div>
          <Switch checked={settings.default_dark_mode !== "false"} onCheckedChange={c => set("default_dark_mode", c ? "true" : "false")} />
        </div>

        {/* Spacer for fixed save button */}
        <div className="h-16" />

        {/* Fixed save button */}
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border/50 z-50">
          <div className="max-w-4xl mx-auto">
            <button type="submit" disabled={saving}
              className="w-full py-4 rounded-xl bg-gradient-brand text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
