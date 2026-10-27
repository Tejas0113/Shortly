import { Link2Off, Plus } from "lucide-react";

interface NotFoundProps {
  onGoHome: () => void;
}

export function NotFound({ onGoHome }: NotFoundProps) {
  return (
    <div
      id="not-found-screen"
      className="min-h-[70vh] flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-md w-full text-center p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 shadow-2xl backdrop-blur-md">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Link2Off className="w-7 h-7" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/60 mb-3">
          404 Error
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight mb-2">
          Short link not found
        </h1>

        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          The link you&apos;re looking for doesn&apos;t exist, was deleted, or the alias was typed incorrectly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-404-create-link"
            type="button"
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create a short link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
