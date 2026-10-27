import { Link2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md text-zinc-400 text-xs transition-colors mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                <Link2 className="w-4 h-4 -rotate-45" />
              </div>
              <span className="text-base font-bold text-white font-sans tracking-tight">
                Shortly<span className="text-indigo-400">.</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Short links. Simple sharing. A modern, production-grade URL shortening web application with custom aliases and sub-50ms instant HTTP 302 redirects.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-zinc-400">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">React 19</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">TypeScript</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">Node/Express</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">Prisma ORM</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">SQLite</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#shortener" className="hover:text-white transition-colors">
                  URL Shortener
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* API Endpoints Info */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">
              REST API
            </h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li className="flex items-center gap-1.5 text-zinc-300">
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-bold text-[10px] border border-indigo-500/20">POST</span>
                <span>/api/urls</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-bold text-[10px] border border-indigo-500/20">GET</span>
                <span>/api/urls/:code</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-bold text-[10px] border border-indigo-500/20">GET</span>
                <span>/:shortCode</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold text-[10px] border border-zinc-700">GET</span>
                <span>/api/health</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500">
          <p>© {new Date().getFullYear()} Shortly. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Production-ready GitHub Portfolio Project</span>
            <span>•</span>
            <span className="text-indigo-400 font-mono font-medium">Full-Stack Live</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
