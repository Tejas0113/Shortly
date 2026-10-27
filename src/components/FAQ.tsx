import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do custom aliases work in Shortly?",
      answer:
        "When you provide a custom alias (like 'linkedin-tejas'), Shortly validates that it is 3–20 characters, uses allowed characters, and isn't already taken or a reserved keyword. When someone navigates to yourdomain.com/linkedin-tejas, our Express backend looks up the alias in the database and immediately returns an HTTP 302 redirect to your original URL.",
    },
    {
      question: "What characters and lengths are allowed for custom aliases?",
      answer:
        "Custom aliases must be between 3 and 20 characters long. Allowed characters include uppercase/lowercase English letters (A-Z, a-z), numbers (0-9), hyphens (-), and underscores (_). Spaces and special symbols like @, #, ?, and / are disallowed. System keywords like 'api', 'admin', and 'health' are reserved.",
    },
    {
      question: "How are automatic short codes generated?",
      answer:
        "If you don't supply a custom alias, Shortly generates a cryptographically random 6-character alphanumeric code (e.g. aB72xK). Before returning it to you, Shortly verifies uniqueness in the database. If a collision ever occurs, it automatically regenerates another code.",
    },
    {
      question: "Does Shortly crawl or inspect my original destination URL?",
      answer:
        "No. In compliance with security and privacy standards, Shortly never crawls, scrapes, or fetches destination web pages. It strictly stores the target URL string in the database and performs fast server-side HTTP 302 redirects.",
    },
    {
      question: "How does click tracking work?",
      answer:
        "Every time a visitor opens your shortened link, the backend endpoint handles the incoming GET request, increments the atomic clickCount in the database, and immediately returns the 302 redirect response with minimal latency.",
    },
    {
      question: "Where are my recent links stored?",
      answer:
        "For convenience without requiring user authentication or password management, your created links are stored in your browser's localStorage. You can view, copy, open, or clear your history at any time.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="w-full max-w-3xl mx-auto px-4 mt-24 mb-16 scroll-mt-20"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm">
          Everything you need to know about Shortly&apos;s architecture and usage.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden backdrop-blur-xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                aria-expanded={isOpen}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-200 hover:text-white focus:outline-none"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 mt-1 pt-3 animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
