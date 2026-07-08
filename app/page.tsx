import Link from "next/link";
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react";

import { officialResults } from "@/lib/results";
import { officialLinks } from "@/lib/systems";

export default function OverviewPage() {
  const denseWide = officialResults.find((result) => result.id === "D")!;
  const sparseWide = officialResults.find((result) => result.id === "E")!;
  const sparseNarrow = officialResults.find((result) => result.id === "B")!;

  return (
    <main className="quiet-home">
      <section className="quiet-hero">
        <div className="shell">
          <span className="section-kicker">
            AI research demo · Biomedical evidence
          </span>
          <h1>My AI system for biomedical questions with traceable evidence.</h1>
          <p>
            BioEvidence AI turns a clinical or biology question into a concise
            answer backed by PubMed citations. This public demo shows the five
            systems I submitted to the TREC BioGen 2025 shared task.
          </p>
          <div className="intro-actions">
            <Link className="primary-action" href="/shared-task">
              Search the submissions
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="text-action" href="#task-details">
              Task details
              <ChevronDown size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="quiet-facts" aria-label="Submission summary">
            <span><strong>30</strong> official questions</span>
            <span><strong>5</strong> submitted systems</span>
            <span><strong>150</strong> generated answers</span>
          </div>
        </div>
      </section>

      <section className="case-study-band" id="task-details">
        <div className="shell case-study-grid">
          <div>
            <span className="section-kicker">Task details</span>
            <h2>
              A shared-task demo for evidence-grounded biomedical answer
              generation.
            </h2>
          </div>
          <div className="case-study-copy">
            <p>
              TREC BioGen Task B asks systems to answer biomedical questions
              using retrieved evidence. This demo exposes the public submitted
              outputs, not a live model endpoint.
            </p>
            <p>
              The shared-task runs compare sparse BM25 retrieval with dense
              MedCPT reranking under narrow and wide evidence budgets.
            </p>
          </div>
        </div>
        <div className="shell shared-task-summary" aria-label="Shared-task summary">
          <div>
            <strong>Question set</strong>
            <span>30 official Task B topics with clinical-style narratives.</span>
          </div>
          <div>
            <strong>Systems</strong>
            <span>Five public runs varying retrieval method and evidence budget.</span>
          </div>
          <div>
            <strong>Evidence</strong>
            <span>Sentence-level citations link each answer back to PubMed.</span>
          </div>
          <div>
            <strong>Evaluation</strong>
            <span>Official answer and citation metrics are included for context.</span>
          </div>
        </div>
      </section>

      <section className="quiet-results">
        <div className="shell">
          <div className="quiet-section-heading">
            <div>
              <span className="section-kicker">Published evaluation</span>
              <h2>Three useful signals from the official results.</h2>
            </div>
            <Link href="/results">
              Full results
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="quiet-metrics">
            <div>
              <strong>{denseWide.answerPrecision.toFixed(2)}</strong>
              <span>Best answer precision</span>
              <small>System D · Dense wide</small>
            </div>
            <div>
              <strong>{sparseWide.citationCoverage.toFixed(2)}</strong>
              <span>Best citation coverage</span>
              <small>System E · Sparse wide</small>
            </div>
            <div>
              <strong>{sparseNarrow.citationContradiction.toFixed(2)}</strong>
              <span>Lowest contradiction</span>
              <small>System B · Sparse narrow</small>
            </div>
          </div>
        </div>
      </section>

      <section className="quiet-release">
        <div className="shell">
          <div>
            <span>Thank you</span>
            <p>
              Thanks to CLaC Lab, the TREC BioGen organizers, and the shared-task
              evaluators. Additional thesis systems will be added after defense
              and publication.
            </p>
          </div>
          <Link href="/thesis">
            Release status
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <a
            href={officialLinks.proceedings}
            target="_blank"
            rel="noreferrer"
          >
            Proceedings paper
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
