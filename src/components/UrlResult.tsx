import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Share2,
  Sparkles,
  Tag,
  MousePointerClick,
  RotateCcw,
  Globe,
  TrendingDown,
  Play,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { ShortenedUrl } from "../types.js";
import { DOMAIN_PRESETS, formatShortUrl, isLiveDomain } from "../utils/domains.js";

interface UrlResultProps {
  result: ShortenedUrl;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  onReset: () => void;
}

export function UrlResult({
  result,
  selectedDomain,
  setSelectedDomain,
  onReset,
}: UrlResultProps) {
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedLive, setCopiedLive] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Formatted short URL for sharing/display
  const shortDisplayUrl = formatShortUrl(result.shortCode, selectedDomain, result.shortUrl);
  
  // Guaranteed live working link that resolves locally and keeps "shortly" in domain name
  const liveDirectUrl = formatShortUrl(result.shortCode, "shortly.localhost", result.shortUrl);

  const isMock = !isLiveDomain(selectedDomain);

  // Calculate length reduction
  const originalLen = result.originalUrl.length;
  const shortLen = shortDisplayUrl.length;
  const reductionPercent =
    originalLen > 0
      ? Math.max(0, Math.round(((originalLen - shortLen) / originalLen) * 100))
      : 0;

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopyShort = async () => {
    const ok = await copyToClipboard(shortDisplayUrl);
    if (ok) {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2500);
    } else {
      setShareFeedback("Could not copy directly. Please select and copy manually.");
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const handleCopyLive = async () => {
    const ok = await copyToClipboard(liveDirectUrl);
    if (ok) {
      setCopiedLive(true);
      setTimeout(() => setCopiedLive(false), 2500);
    }
  };

  const handleShare = async () => {
    const shareTarget = isMock ? liveDirectUrl : shortDisplayUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shortly Short Link",
          text: `Check out this short link: ${shareTarget}`,
          url: shareTarget,
        });
      } catch {
        // user cancelled
      }
    } else {
      const ok = await copyToClipboard(shareTarget);
      if (ok) {
        setShareFeedback("Link copied to clipboard for sharing!");
        setTimeout(() => setShareFeedback(null), 3000);
      }
    }
  };

  return (
    <div
      id="url-result-card"
      className="w-full max-w-2xl mx-auto px-4 mt-8 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="relative rounded-3xl border border-indigo-500/30 bg-zinc-900/40 shadow-2xl backdrop-blur-md p-6 sm:p-8 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Short link ready!
              </h2>
              <p className="text-xs text-zinc-400">
                Created {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Mode & Savings Badges */}
          <div className="flex items-center gap-2">
            {reductionPercent > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <TrendingDown className="w-3 h-3" />
                {reductionPercent}% shorter
              </span>
            )}
            {result.customAlias ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <Tag className="w-3 h-3" />
                Custom
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {result.shortCode.length}-char code
              </span>
            )}
          </div>
        </div>

        {/* Domain Format Switcher */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 relative z-10">
          <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-zinc-400">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Domain Format:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {DOMAIN_PRESETS.map((preset) => {
              const isSelected = selectedDomain === preset.domain;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedDomain(preset.domain)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                  title={preset.badge}
                >
                  {preset.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Short URL Display Box */}
        <div className="mb-4 p-4 rounded-2xl border border-indigo-500/20 bg-zinc-950/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span
              id="short-url-text"
              className="font-mono text-base sm:text-lg font-bold text-white tracking-tight break-words select-all text-indigo-300"
            >
              {shortDisplayUrl}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* If Mock domain (short.ly), offer copy live link or copy mockup */}
            {isMock ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-copy-live-link"
                  type="button"
                  onClick={handleCopyLive}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    copiedLive
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  }`}
                  title="Copy working link that resolves locally in your browser"
                >
                  {copiedLive ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied Live Link!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current text-zinc-950" />
                      <span>Copy Live Link</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-copy-short-url"
                  type="button"
                  onClick={handleCopyShort}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-medium text-xs border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all ${
                    copiedShort ? "text-emerald-400" : ""
                  }`}
                  title="Copy branded preview URL (needs public domain in production)"
                >
                  {copiedShort ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedShort ? "Copied" : "Copy Mockup"}</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-copy-short-url"
                type="button"
                onClick={handleCopyShort}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  copiedShort
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                }`}
              >
                {copiedShort ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            )}

            {/* Test Live Redirect button */}
            <a
              id="btn-open-short-url"
              href={liveDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-white font-medium text-xs sm:text-sm transition-colors"
              title="Test real live 302 redirection in a new tab"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Test Live</span>
            </a>

            <button
              id="btn-share-short-url"
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Share short link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Callout when Mockup Domain (e.g. short.ly) is selected */}
        {isMock && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">
                  Why does &ldquo;{selectedDomain}&rdquo; say DNS address could not be found?
                </p>
                <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                  <span className="font-mono text-white">{selectedDomain}</span> is a mock domain. In local development, your browser cannot resolve unowned domains without public DNS.
                  Use the <strong>Live Link</strong> below (<span className="font-mono text-emerald-300">shortly.localhost:3000</span>) to test directly in your browser.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDomain("shortly.localhost")}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors"
            >
              Use shortly.localhost
            </button>
          </div>
        )}

        {/* Live Redirection Route with 'shortly' in host */}
        <div className="mb-5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
          <div className="text-zinc-400 flex items-center gap-1.5 truncate">
            <span className="font-semibold text-zinc-300 shrink-0">Live working link (with Shortly):</span>
            <span className="font-mono text-indigo-300 truncate" title={liveDirectUrl}>
              {liveDirectUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLive}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              {copiedLive ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLive ? "Copied" : "Copy live test URL"}</span>
            </button>
          </div>
        </div>

        {/* Share notification toast */}
        {shareFeedback && (
          <div className="mb-4 text-xs font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 px-3.5 py-2.5 rounded-xl relative z-10">
            {shareFeedback}
          </div>
        )}

        {/* Destination URL & Clicks details */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 overflow-hidden text-zinc-400">
            <span className="shrink-0 font-medium text-zinc-500 uppercase tracking-wider text-[11px]">Destination:</span>
            <span className="truncate max-w-sm sm:max-w-md font-mono text-zinc-300" title={result.originalUrl}>
              {result.originalUrl}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
              <span>Clicks: <strong className="text-white font-mono">{result.clickCount}</strong></span>
            </div>

            <button
              id="btn-shorten-another"
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-zinc-400 hover:text-white font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Shorten another</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
