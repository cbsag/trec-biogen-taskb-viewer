"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/shared-task", label: "Explorer" },
  { href: "/case-study", label: "Study" },
  { href: "/results", label: "Results" },
  { href: "/thesis", label: "Thesis" },
  { href: "/about", label: "About" },
];

type ColorMode = "paper" | "focus";

const themeStorageKey = "bioevidence-theme";
const themeChangeEvent = "bioevidence-theme-change";

function getClientColorMode(): ColorMode {
  if (typeof window === "undefined") return "paper";
  return window.localStorage.getItem(themeStorageKey) === "focus" ? "focus" : "paper";
}

function getServerColorMode(): ColorMode {
  return "paper";
}

function subscribeColorMode(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(themeChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(themeChangeEvent, onStoreChange);
  };
}

function saveColorMode(nextMode: ColorMode) {
  document.documentElement.dataset.theme = nextMode;
  window.localStorage.setItem(themeStorageKey, nextMode);
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function SiteHeader() {
  const pathname = usePathname();
  const colorMode = useSyncExternalStore(
    subscribeColorMode,
    getClientColorMode,
    getServerColorMode,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = colorMode;
  }, [colorMode]);

  function toggleColorMode() {
    const nextMode = colorMode === "paper" ? "focus" : "paper";
    saveColorMode(nextMode);
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="site-brand" href="/" aria-label="BioEvidence AI home">
          <span>
            <strong>BioEvidence AI</strong>
            <small>PubMed-grounded answers</small>
          </span>
        </Link>

        <nav className="primary-nav" aria-label="BioEvidence AI sections">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                className={active ? "active" : ""}
                href={item.href}
                key={item.href}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <a
            className="header-link"
            href="https://cbsag.me"
            target="_blank"
            rel="noreferrer"
            aria-label="Open Ganesh Chandrasekar portfolio"
          >
            <span>Portfolio</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleColorMode}
            aria-label={
              colorMode === "paper"
                ? "Switch to focus color mode"
                : "Switch to paper color mode"
            }
            title={
              colorMode === "paper"
                ? "Switch to focus color mode"
                : "Switch to paper color mode"
            }
          >
            {colorMode === "paper" ? (
              <Moon size={14} aria-hidden="true" />
            ) : (
              <Sun size={14} aria-hidden="true" />
            )}
            <span>{colorMode === "paper" ? "Focus" : "Paper"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
