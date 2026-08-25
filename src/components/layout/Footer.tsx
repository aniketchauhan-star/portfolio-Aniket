"use client";

import { profile } from "@/data/profile";
import { scrollToTop } from "./SmoothScroll";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="content-layer relative border-t border-[var(--color-line-soft)]">
      <div className="shell flex flex-col gap-10 pt-12 pb-[calc(3rem+var(--safe-b))] md:flex-row md:items-end md:justify-between md:pt-14 md:pb-[calc(3.5rem+var(--safe-b))]">
        <div>
          <p className="font-display text-[1.4rem] leading-none tracking-[-0.03em]">
            {profile.name.toUpperCase()}
          </p>
          <p className="label mt-5 leading-[1.9]">
            {profile.footer.tagline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <div className="flex items-end justify-between gap-10 md:flex-col md:items-end">
          <span className="label">© {year}</span>
          <button
            onClick={scrollToTop}
            data-cursor="link"
            aria-label="Back to top"
            className="group inline-flex min-h-[44px] items-center gap-2"
          >
            <span className="label label-bright transition-colors duration-400 group-hover:text-[var(--color-ink)]">
              BACK TO TOP
            </span>
            <span className="text-[var(--color-cyan)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
