import { ArrowDown, Sparkles, ShieldCheck, Zap } from "lucide-react";

interface HeroProps {
  onScrollToShortener: () => void;
}

export function Hero({ onScrollToShortener }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative pt-16 pb-10 sm:pt-20 sm:pb-14 text-center max-w-4xl mx-auto px-4"
    >
      {/* Supporting Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-6 backdrop-blur-xs shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-medium">Free & Instant URL Shortener</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-400">No account required</span>
      </div>

      {/* Main Heading */}
      <h1
        id="hero-heading"
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-500 leading-[1.12] font-sans"
      >
        Short links. Simple sharing.
      </h1>

      {/* Subtitle */}
      <p
        id="hero-subtitle"
        className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed"
      >
        Turn long URLs into clean, memorable links in seconds. Professional-grade tool with instant 302 redirects, custom aliases, and zero friction.
      </p>

      {/* Hero Features Bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-zinc-400">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sub-50ms Redirects</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Custom Branded Aliases</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span>Live Click Metrics</span>
        </div>
      </div>
    </section>
  );
}
