import { useState } from "react";
import { Link2, Menu, X, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle.js";
import { Theme } from "../types.js";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
}

export function Header({ theme, onToggleTheme, onNavigateHome }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#hero", onClick: onNavigateHome },
    { label: "Shortener", href: "#shortener" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      id="site-header"
      className="sticky top-0 z-40 w-full border-b border-zinc-800/50 bg-zinc-950/40 backdrop-blur-md transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          id="brand-logo-link"
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
        >
          <div className="bg-indigo-600 p-1.5 rounded-md text-white shadow-md shadow-indigo-600/25 transition-transform group-hover:scale-105 flex items-center justify-center">
            <Link2 className="w-4 h-4 -rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            Shortly
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={link.onClick}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <div className="hidden sm:block h-4 w-[1px] bg-zinc-800"></div>

          <a
            id="btn-nav-cta"
            href="#shortener"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all shadow-xs"
          >
            Create Link
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Button */}
          <button
            id="btn-mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                if (link.onClick) link.onClick();
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-base font-medium rounded-md text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-zinc-800">
            <a
              href="#shortener"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-white text-zinc-950"
            >
              Create Short Link
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
