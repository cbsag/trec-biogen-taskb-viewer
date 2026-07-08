import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { ResultsChart } from "@/components/results-chart";
import { officialResults } from "@/lib/results";
import { officialLinks } from "@/lib/systems";

export const metadata: Metadata = {
  title: "Official results",
};

function AnswerTable() {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Run</th>
            <th>Precision</th>
            <th>Recall</th>
            <th>Completeness</th>
            <th>Correctness</th>
          </tr>
        </thead>
        <tbody>
          {officialResults.map((result) => (
            <tr key={result.id}>
              <th>
                <span className={`system-key system-${result.id.toLowerCase()}`}>
                  {result.id}
                </span>
                {result.label}
              </th>
              <td className={result.id === "D" ? "best" : ""}>
                {result.answerPrecision.toFixed(2)}
              </td>
              <td className={result.id === "D" ? "best" : ""}>
                {result.answerRecall.toFixed(2)}
              </td>
              <td className={result.id === "A" ? "best" : ""}>
                {result.answerCompleteness.toFixed(2)}
              </td>
              <td className={result.id === "D" ? "best" : ""}>
                {result.answerCorrectness.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CitationTable() {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Run</th>
            <th>Coverage</th>
            <th>Support rate</th>
            <th>Contradiction rate</th>
          </tr>
        </thead>
        <tbody>
          {officialResults.map((result) => (
            <tr key={result.id}>
              <th>
                <span className={`system-key system-${result.id.toLowerCase()}`}>
                  {result.id}
                </span>
                {result.label}
              </th>
              <td className={result.id === "E" ? "best" : ""}>
                {result.citationCoverage.toFixed(2)}
              </td>
              <td className={result.id === "A" ? "best" : ""}>
                {result.citationSupport.toFixed(2)}
              </td>
              <td className={result.id === "B" ? "best" : ""}>
                {result.citationContradiction.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <main className="quiet-results-page">
      <section className="page-intro compact">
        <div className="shell">
          <span className="section-kicker">Published TREC evaluation</span>
          <h1>Official results</h1>
          <p>
            Explore one metric at a time. Complete result tables remain
            available below for verification.
          </p>
        </div>
      </section>

      <section className="results-focus">
        <div className="shell results-shell">
          <ResultsChart results={officialResults} />

          <details className="full-results-disclosure">
            <summary>Show complete official tables</summary>
            <div className="disclosed-tables">
              <section>
                <div>
                  <span className="section-kicker">Table 3</span>
                  <h2>Answer quality</h2>
                </div>
                <AnswerTable />
              </section>
              <section>
                <div>
                  <span className="section-kicker">Table 4</span>
                  <h2>Citation quality</h2>
                </div>
                <CitationTable />
              </section>
            </div>
          </details>

          <div className="results-sources">
            <span>Official sources</span>
            <a
              href={officialLinks.proceedings}
              target="_blank"
              rel="noreferrer"
            >
              Proceedings paper
              <ExternalLink size={13} aria-hidden="true" />
            </a>
            <a href={officialLinks.runs} target="_blank" rel="noreferrer">
              NIST run registry
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
