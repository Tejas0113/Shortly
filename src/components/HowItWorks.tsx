import { Link2, Sparkles, Send, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Link2,
      title: "Paste Long URL",
      description:
        "Enter any long destination link — articles, portfolio profiles, documents, or repositories.",
    },
    {
      number: "02",
      icon: Sparkles,
      title: "Customize Alias",
      description:
        "Choose an automatic unique 6-character short code or specify your own custom branded alias.",
    },
    {
      number: "03",
      icon: Send,
      title: "Share & Redirect",
      description:
        "Copy your clean short link. When visitors open it, our backend instantly redirects them with HTTP 302.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full max-w-5xl mx-auto px-4 mt-24 scroll-mt-20 text-center"
    >
      <div className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight mb-3">
          How It Works
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Shortening and sharing URLs with Shortly takes three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="relative p-6 sm:p-7 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 text-left shadow-xs hover:bg-zinc-900/50 hover:border-zinc-700/60 backdrop-blur-xs transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-xl font-bold text-zinc-600">
                  {step.number}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-zinc-700">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
