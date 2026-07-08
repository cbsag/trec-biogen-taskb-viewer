import type { Metadata } from "next";
import { SystemExplorer } from "@/components/system-explorer";
import { loadSharedTaskTopics } from "@/lib/data";

export const metadata: Metadata = {
  title: "Evidence explorer",
};

export default function SharedTaskPage() {
  const topics = loadSharedTaskTopics();

  return (
    <main>
      <section className="page-intro compact">
        <div className="shell">
          <div>
            <span className="section-kicker">Interactive submission viewer</span>
            <h1>Search the evidence systems</h1>
            <p>
              Search the official Task B questions, then inspect or compare my
              five public TREC BioGen 2025 outputs.
            </p>
          </div>
        </div>
      </section>

      <section className="explorer-section">
        <div className="shell viewer-shell">
          <SystemExplorer topics={topics} />
        </div>
      </section>
    </main>
  );
}
