import { useState } from "react";
import {
  History,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  RefreshCw,
  MousePointerClick,
  Tag,
  Sparkles,
  Link2,
  Play,
  TrendingDown,
} from "lucide-react";
import { RecentLinkItem } from "../types.js";
import { formatShortUrl } from "../utils/domains.js";

interface RecentLinksProps {
  links: RecentLinkItem[];
  selectedDomain: string;
  onDeleteLink: (shortCode: string) => void;
  onClearAll: () => void;
  onRefreshStats: () => Promise<void>;
}

export function RecentLinks({
  links,
  selectedDomain,
  onDeleteLink,
  onClearAll,
  onRefreshStats,
}: RecentLinksProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = async (text: string, shortCode: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedCode(shortCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback ignore
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (links.length === 0) {
    return null;
  }

  return (
    <section id="recent-links" className="w-full max-w-4xl mx-auto px-4 mt-20 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">
              Recent Activity
            </h2>
            <span className="text-xs text-zinc-500">Local History • {links.length} {links.length === 1 ? "link" : "links"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-stats"
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title="Refresh click counts from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            <span>Refresh clicks</span>
          </button>

          <button
            id="btn-clear-recent-links"
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Clear all browser local history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Links List Cards */}
      <div className="grid grid-cols-1 gap-3">
        {links.map((item) => {
          const isCopied = copiedCode === item.shortCode;
          const displayShort = formatShortUrl(item.shortCode, selectedDomain, item.shortUrl);
          const origLen = item.originalUrl.length;
          const shortLen = displayShort.length;
          const reduction = origLen > 0 ? Math.max(0, Math.round(((origLen - shortLen) / origLen) * 100)) : 0;

          const formattedDate = new Date(item.createdAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.shortCode}
              id={`recent-link-${item.shortCode}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl hover:bg-zinc-800/40 hover:border-zinc-700/60 transition-all gap-4 backdrop-blur-xs"
            >
              {/* Left Column: Short link & Original URL */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Link2 className="w-4 h-4 -rotate-45" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-bold text-indigo-300">
                      {displayShort}
                    </span>

                    {reduction > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <TrendingDown className="w-2.5 h-2.5" />
                        -{reduction}%
                      </span>
                    )}

                    {item.customAlias ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <Tag className="w-2.5 h-2.5" />
                        Custom
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                        <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                        {item.shortCode}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 truncate max-w-[280px] sm:max-w-[420px] font-mono mt-0.5" title={item.originalUrl}>
                    {item.originalUrl}
                  </p>
                </div>
              </div>

              {/* Right Column: Stats & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-zinc-300 font-mono flex items-center sm:justify-end gap-1">
                    <MousePointerClick className="w-3 h-3 text-indigo-400" />
                    <span>{item.clickCount} clicks</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tight font-mono">
                    {formattedDate}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Copy Short Link */}
                  <button
                    type="button"
                    onClick={() => handleCopy(displayShort, item.shortCode)}
                    className={`p-2 rounded-xl transition-colors ${
                      isCopied
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700"
                    }`}
                    title="Copy short link"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* Test Live Redirect */}
                  <a
                    href={formatShortUrl(item.shortCode, "shortly.localhost", item.shortUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-indigo-500/10 text-indigo-300 hover:text-white hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors flex items-center gap-1 text-xs"
                    title="Test live redirect"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </a>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteLink(item.shortCode)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
