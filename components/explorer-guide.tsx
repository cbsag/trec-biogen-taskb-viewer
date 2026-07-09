"use client";

import { CircleHelp, GitCompareArrows, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const guideStorageKey = "bioevidence-explorer-guide-seen";

const steps = [
  {
    icon: Search,
    title: "Find a question",
    copy: "Search a clinical term or choose one of the suggested examples.",
  },
  {
    icon: GitCompareArrows,
    title: "Compare systems",
    copy: "Switch between the five runs or place two answers side by side.",
  },
  {
    icon: CircleHelp,
    title: "Trace the evidence",
    copy: "Open the PMID links to inspect the PubMed records behind each sentence.",
  },
];

export function ExplorerGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.localStorage.getItem(guideStorageKey) !== "true") {
        setOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function closeGuide() {
    window.localStorage.setItem(guideStorageKey, "true");
    setOpen(false);
  }

  return (
    <>
      <button
        className="explorer-help"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="How to use the evidence explorer"
        title="How to use the evidence explorer"
      >
        <CircleHelp size={18} aria-hidden="true" />
      </button>

      {open && (
        <div className="guide-backdrop" role="presentation">
          <section
            className="explorer-guide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="explorer-guide-title"
          >
            <button
              className="guide-close"
              type="button"
              onClick={closeGuide}
              aria-label="Close guide"
              title="Close guide"
            >
              <X size={17} aria-hidden="true" />
            </button>
            <span className="section-kicker">Quick guide</span>
            <h2 id="explorer-guide-title">Explore a submitted answer.</h2>
            <p className="guide-intro">
              This viewer contains precomputed outputs from five official TREC
              BioGen runs.
            </p>
            <div className="guide-steps">
              {steps.map(({ icon: Icon, title, copy }, index) => (
                <div key={title}>
                  <span className="guide-step-number">0{index + 1}</span>
                  <Icon size={18} aria-hidden="true" />
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
            <button className="guide-start" type="button" onClick={closeGuide}>
              Start exploring
            </button>
          </section>
        </div>
      )}
    </>
  );
}
