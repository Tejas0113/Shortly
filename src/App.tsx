import { useState, useEffect } from "react";
import { Header } from "./components/Header.js";
import { Hero } from "./components/Hero.js";
import { UrlShortener } from "./components/UrlShortener.js";
import { UrlResult } from "./components/UrlResult.js";
import { RecentLinks } from "./components/RecentLinks.js";
import { HowItWorks } from "./components/HowItWorks.js";
import { Features } from "./components/Features.js";
import { FAQ } from "./components/FAQ.js";
import { Footer } from "./components/Footer.js";
import { NotFound } from "./components/NotFound.js";
import { useUrlShortener } from "./hooks/useUrlShortener.js";
import { getInitialTheme, saveThemePreference } from "./utils/storage.js";
import { Theme } from "./types.js";

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [is404Route, setIs404Route] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("shortly.localhost");

  const {
    originalUrl,
    setOriginalUrl,
    customAlias,
    setCustomAlias,
    isLoading,
    error,
    setError,
    result,
    recentLinks,
    handleShorten,
    resetForm,
    deleteRecentLink,
    clearRecent,
    refreshStats,
  } = useUrlShortener();

  // Initialize theme and check window pathname for 404
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Check if the user navigated to a non-root path that did not redirect (i.e. invalid short link)
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path && path !== "/" && path !== "/index.html") {
        // Unmatched path in client
        setIs404Route(true);
      }
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    saveThemePreference(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleScrollToShortener = () => {
    setIs404Route(false);
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
    const elem = document.getElementById("shortener");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigateHome = () => {
    setIs404Route(false);
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden transition-colors duration-200">
      {/* Immersive Ambient Glow Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[450px] h-[450px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[35%] right-[-80px] w-[380px] h-[380px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-60px] left-[15%] w-[320px] h-[320px] bg-indigo-600/10 blur-[110px] rounded-full pointer-events-none -z-10" />

      {/* Top Navigation Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-20 relative z-10">
        {is404Route ? (
          <NotFound onGoHome={handleNavigateHome} />
        ) : (
          <>
            {/* Hero Header Section */}
            <Hero onScrollToShortener={handleScrollToShortener} />

            {/* Core URL Shortening Interactive Form */}
            <UrlShortener
              originalUrl={originalUrl}
              setOriginalUrl={setOriginalUrl}
              customAlias={customAlias}
              setCustomAlias={setCustomAlias}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              isLoading={isLoading}
              error={error}
              setError={setError}
              onShorten={handleShorten}
            />

            {/* Result Card on Successful Shortening */}
            {result && (
              <UrlResult
                result={result}
                selectedDomain={selectedDomain}
                setSelectedDomain={setSelectedDomain}
                onReset={resetForm}
              />
            )}

            {/* Recent Links Browser History */}
            <RecentLinks
              links={recentLinks}
              selectedDomain={selectedDomain}
              onDeleteLink={deleteRecentLink}
              onClearAll={clearRecent}
              onRefreshStats={refreshStats}
            />

            {/* How It Works Educational Section */}
            <HowItWorks />

            {/* Features Grid Section */}
            <Features />

            {/* FAQ Interactive Accordion Section */}
            <FAQ />
          </>
        )}
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
