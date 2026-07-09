import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BioEvidence AI",
    template: "%s · BioEvidence AI",
  },
  description:
    "Interactive demonstration of evidence-grounded biomedical question answering systems evaluated on TREC BioGen 2025.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="paper" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="shell footer-inner">
            <div>
              <strong>BioEvidence AI</strong>
              <span>Evidence-grounded biomedical question answering</span>
            </div>
            <p>
              Research demo by Ganesh Chandrasekar using precomputed TREC
              BioGen runs with PubMed-linked evidence.
              <span>For exploration only, not clinical guidance.</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
