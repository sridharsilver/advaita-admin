import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import logo from "@/assets/advaita-logo.webp";
import logoDark from "@/assets/logo-dark.webp";

const linkConfig: { href: string; label: string; settingKey: string }[] = [
  { href: "/", label: "Home", settingKey: "show_home" },
  { href: "#about", label: "About", settingKey: "show_about" },
  { href: "#services", label: "Services", settingKey: "show_services" },
  { href: "#portfolio", label: "Work", settingKey: "show_portfolio" },
  { href: "#fiverr-reviews", label: "Reviews", settingKey: "show_fiverr_reviews" },
  { href: "#experience", label: "Experience", settingKey: "show_experience" },
  { href: "#process", label: "Process", settingKey: "show_process" },
  { href: "#testimonials", label: "Testimonials", settingKey: "show_testimonials" },
  { href: "#contact", label: "Contact", settingKey: "show_contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const isVisible = (key: string) => settings !== null && settings[key] !== "false";

  const links = linkConfig.filter((l) => isVisible(l.settingKey));
  const contactVisible = isVisible("show_contact");

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setOpen(false)} 
        />
      )}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
      <div className="container mx-auto px-6">
        <nav
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
            scrolled ? "glass-strong shadow-[var(--shadow-elegant)]" : ""
          }`}
        >
          <Link
            to="/"
            onClick={() => { if (location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2"
          >
            <img src={logo} alt="Advaita Designs" className="h-12 w-auto dark:hidden" />
            <img src={logoDark} alt="Advaita Designs" className="hidden h-12 w-auto dark:block" />
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => { if (l.href === "/" && location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
            {contactVisible && (
              <a
                href="#contact"
                className="inline-flex items-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                Start a project
              </a>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <button
              className="text-foreground"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>

        </nav>

        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-6 space-y-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => { setOpen(false); if (l.href === "/" && location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="block text-lg font-medium text-foreground/90"
              >
                {l.label}
              </a>
            ))}
            {contactVisible && (
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="block text-center rounded-full bg-gradient-brand px-5 py-3 text-primary-foreground"
              >
                Start a project
              </a>
            )}
          </div>
        )}
      </div>
    </header>
    </>
  );
}
