import React, { useState, useRef } from "react";
import {
  Link2,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
  ClipboardPaste,
  X,
  Globe,
} from "lucide-react";
import { validateUrl, validateCustomAliasClient } from "../utils/validation.js";
import { DOMAIN_PRESETS, getShortDomainLabel } from "../utils/domains.js";

interface UrlShortenerProps {
  originalUrl: string;
  setOriginalUrl: (url: string) => void;
  customAlias: string;
  setCustomAlias: (alias: string) => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  onShorten: (url?: string, alias?: string) => Promise<any>;
}

export function UrlShortener({
  originalUrl,
  setOriginalUrl,
  customAlias,
  setCustomAlias,
  selectedDomain,
  setSelectedDomain,
  isLoading,
  error,
  setError,
  onShorten,
}: UrlShortenerProps) {
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [urlTouched, setUrlTouched] = useState(false);
  const [isCustomDomainOpen, setIsCustomDomainOpen] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayDomain = getShortDomainLabel(selectedDomain);

  // Handle custom alias typing and live validation
  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAlias(val);
    if (error) setError(null);

    if (val.trim()) {
      const check = validateCustomAliasClient(val);
      setAliasError(check.valid ? null : check.error || "Invalid alias");
    } else {
      setAliasError(null);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setOriginalUrl(text);
          setError(null);
          setUrlTouched(true);
        }
      }
    } catch {
      // ignore clipboard permission rejection
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlTouched(true);

    const urlCheck = validateUrl(originalUrl);
    if (!urlCheck.valid || !urlCheck.normalizedUrl) {
      setError(urlCheck.error || "Please enter a valid destination URL.");
      inputRef.current?.focus();
      return;
    }

    if (customAlias) {
      const aliasCheck = validateCustomAliasClient(customAlias);
      if (!aliasCheck.valid) {
        setAliasError(aliasCheck.error || "Invalid custom alias.");
        return;
      }
    }

    setOriginalUrl(urlCheck.normalizedUrl);
    await onShorten(urlCheck.normalizedUrl, customAlias);
  };

  const handleSampleClick = (sampleUrl: string, sampleAlias = "") => {
    setOriginalUrl(sampleUrl);
    setCustomAlias(sampleAlias);
    setError(null);
    setAliasError(null);
  };

  const handleSetCustomDomain = () => {
    if (customDomainInput.trim()) {
      const clean = customDomainInput.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
      setSelectedDomain(clean);
      setIsCustomDomainOpen(false);
    }
  };

  return (
    <div
      id="shortener"
      className="w-full max-w-2xl mx-auto px-4 scroll-mt-24"
    >
      <div className="w-full bg-zinc-900/40 border border-zinc-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden transition-colors">
        {/* Domain Selector Bar */}
        <div className="mb-6 pb-4 border-b border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Short Domain:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {DOMAIN_PRESETS.map((preset) => {
              const isSelected = selectedDomain === preset.domain;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedDomain(preset.domain);
                    setIsCustomDomainOpen(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                      : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/40"
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

            <button
              type="button"
              onClick={() => setIsCustomDomainOpen(!isCustomDomainOpen)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isCustomDomainOpen || (!DOMAIN_PRESETS.some(p => p.domain === selectedDomain))
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border border-zinc-700/40"
              }`}
            >
              Custom...
            </button>
          </div>
        </div>

        {/* Custom Domain Input Field if expanded */}
        {isCustomDomainOpen && (
          <div className="mb-6 p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
            <input
              type="text"
              placeholder="e.g. go.mywebsite.com or bio.link"
              value={customDomainInput}
              onChange={(e) => setCustomDomainInput(e.target.value)}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSetCustomDomain}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
            >
              Apply
            </button>
          </div>
        )}

        <form id="url-shorten-form" onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Main URL Input Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-original-url"
                className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1"
              >
                Destination URL <span className="text-rose-400">*</span>
              </label>
              {originalUrl ? (
                <button
                  id="btn-clear-url-input"
                  type="button"
                  onClick={() => {
                    setOriginalUrl("");
                    setError(null);
                    setAliasError(null);
                  }}
                  title="Clear input"
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              ) : (
                <button
                  id="btn-paste-clipboard"
                  type="button"
                  onClick={handlePasteClipboard}
                  title="Paste from clipboard"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Paste from clipboard</span>
                </button>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-4 text-zinc-500 pointer-events-none">
                <Link2 className="w-4 h-4" />
              </div>

              <input
                id="input-original-url"
                ref={inputRef}
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                required
                placeholder="https://example.com/page or google.com"
                value={originalUrl}
                onChange={(e) => {
                  setOriginalUrl(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => {
                  setUrlTouched(true);
                  if (originalUrl.trim()) {
                    const check = validateUrl(originalUrl);
                    if (check.valid && check.normalizedUrl && check.normalizedUrl !== originalUrl) {
                      setOriginalUrl(check.normalizedUrl);
                    }
                  }
                }}
                className={`w-full bg-zinc-950/80 border rounded-xl pl-11 pr-4 py-4 text-zinc-200 placeholder:text-zinc-600 text-sm focus:outline-none transition-all ${
                  error && urlTouched
                    ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                    : "border-zinc-800 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                }`}
              />
            </div>
          </div>

          {/* Custom Alias & Submit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="input-custom-alias"
                className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1"
              >
                Custom Alias (Optional)
              </label>
              <div className="flex items-center bg-zinc-950/80 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 transition-all">
                <span className="pl-3.5 pr-1 text-zinc-500 text-xs font-mono select-none shrink-0" title={displayDomain}>
                  {displayDomain}/
                </span>
                <input
                  id="input-custom-alias"
                  type="text"
                  maxLength={20}
                  placeholder="profile"
                  value={customAlias}
                  onChange={handleAliasChange}
                  className="w-full bg-transparent border-none px-1 py-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none text-sm font-mono"
                />
                {customAlias && (
                  <button
                    id="btn-clear-alias"
                    type="button"
                    onClick={() => {
                      setCustomAlias("");
                      setAliasError(null);
                    }}
                    className="pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {aliasError && (
                <p id="custom-alias-error" className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {aliasError}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <button
                id="btn-submit-shorten"
                type="submit"
                disabled={isLoading || !originalUrl.trim()}
                className="w-full bg-white text-zinc-950 font-bold py-4 px-6 rounded-xl hover:bg-zinc-200 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.12)] disabled:opacity-40 disabled:pointer-events-none text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Shortening...</span>
                  </>
                ) : (
                  <>
                    <span>Shorten URL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Level Error Banner */}
          {error && (
            <div
              id="shortener-error-banner"
              className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <div className="flex-1">{error}</div>
            </div>
          )}
        </form>

        {/* Quick Sample Links helper */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1 text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick sample:
          </span>
          <button
            type="button"
            onClick={() =>
              handleSampleClick(
                "https://www.linkedin.com/in/tejas-namde-portfolio-2026",
                `linkedin-${Math.floor(100 + Math.random() * 900)}`
              )
            }
            className="px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[11px] border border-zinc-700/50 transition-colors"
          >
            linkedin (custom)
          </button>
          <button
            type="button"
            onClick={() =>
              handleSampleClick(
                "https://github.com/torvalds/linux/blob/master/README.md",
                ""
              )
            }
            className="px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[11px] border border-zinc-700/50 transition-colors"
          >
            github (auto-code)
          </button>
        </div>
      </div>
    </div>
  );
}
