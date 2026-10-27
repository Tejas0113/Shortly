import {
  Zap,
  Tag,
  MousePointerClick,
  ShieldAlert,
  Layers,
  Sparkles,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Sub-50ms HTTP 302 Redirects",
      description:
        "Fast response times powered by indexed database lookups in SQLite/Prisma with zero crawling overhead.",
    },
    {
      icon: Tag,
      title: "Custom Branded Aliases",
      description:
        "Personalize your links with memorable keywords like /linkedin-tejas or /portfolio-2026 for resumes and socials.",
    },
    {
      icon: MousePointerClick,
      title: "Live Click Analytics",
      description:
        "Track engagement whenever your short links are accessed, with automatic click counters stored securely.",
    },
    {
      icon: ShieldAlert,
      title: "Built-In Rate Limiting",
      description:
        "Server-side IP rate limiting shields the system against abusive high-frequency request bursts.",
    },
    {
      icon: Sparkles,
      title: "Zero Account Friction",
      description:
        "No signup forms or passwords required. Shorten links immediately with browser-local session history.",
    },
    {
      icon: Layers,
      title: "Production-Grade Full Stack",
      description:
        "Clean modular codebase featuring Express.js, TypeScript, Prisma ORM, and modern React 19.",
    },
  ];

  return (
    <section
      id="features"
      className="w-full max-w-5xl mx-auto px-4 mt-24 scroll-mt-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight mb-3">
          Engineered for Simplicity & Speed
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Everything you need in a URL shortener, without bloated complexity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="p-6 sm:p-7 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 shadow-xs hover:bg-zinc-900/50 hover:border-zinc-700/60 backdrop-blur-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
