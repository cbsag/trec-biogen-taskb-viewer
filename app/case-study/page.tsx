import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  FileCheck2,
  GitCompareArrows,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { officialResults } from "@/lib/results";
import { officialLinks, systems } from "@/lib/systems";

export const metadata: Metadata = {
  title: "Technical case study",
  description:
    "Architecture, experiments, failure analysis, and official results for the BioEvidence AI TREC BioGen system.",
};

const pipelineStages = [
  {
    icon: Search,
    label: "01 · Reformulate",
    title: "Four views of one information need",
    copy: "The original question is joined by three controlled reformulations to broaden lexical and semantic coverage.",
  },
  {
    icon: Database,
    label: "02 · Retrieve",
    title: "Build a PMID candidate pool",
    copy: "BM25 searches indexed PubMed titles and abstracts per query branch, then candidates are deduplicated by PMID.",
  },
  {
    icon: Network,
    label: "03 · Rank and select",
    title: "Test sparse and dense evidence routes",
    copy: "Sparse runs use cross-encoder scores, TF-IDF, and MMR. Dense runs add MedCPT bi-encoder rescoring and cross-encoder reranking.",
  },
  {
    icon: Sparkles,
    label: "04 · Generate",
    title: "Answer only from selected evidence",
    copy: "Qwen2.5 receives an indexed evidence block and produces one concise paragraph with evidence-index citations.",
  },
  {
    icon: ShieldCheck,
    label: "05 · Control citations",
    title: "Map every citation back to PubMed",
    copy: "Deterministic post-processing maps evidence indices to PMIDs, removes invalid citations, and enforces task limits.",
  },
];

const lessons = [
  {
    title: "More evidence was not automatically better.",
    copy: "Wide retrieval slightly improved answer recall, but citation support fell in both sparse and dense routes. The widest dense run also produced the highest contradiction rate.",
  },
  {
    title: "Strict citation control has a measurable cost.",
    copy: "Sentences without valid evidence-index citations were removed. That protected traceability, but could discard useful content and reduce recall or completeness.",
  },
  {
    title: "Question-only reformulation left context unused.",
    copy: "The submitted reformulations used only the original question, not the topic narrative. Under-specified questions could therefore drift from the full information need.",
  },
  {
    title: "Compression can erase useful detail.",
    copy: "Sparse-route summaries were split and truncated to fit the generation budget. This kept prompts focused, but sometimes weakened recall-oriented evidence.",
  },
];

export default function CaseStudyPage() {
  return (
    <main className="technical-study">
      <section className="study-hero">
        <div className="shell">
          <span className="section-kicker">Technical case study · 5 min read</span>
          <h1>
            Designing biomedical answers that remain traceable to PubMed.
          </h1>
          <p>
            For TREC BioGen 2025, I built and evaluated five modular retrieval
            systems around one constraint: every claim that survives generation
            must remain connected to evidence the system actually retrieved.
          </p>
          <div className="intro-actions">
            <Link className="primary-action" href="/shared-task">
              Open the evidence explorer
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              className="text-action"
              href={officialLinks.proceedings}
              target="_blank"
              rel="noreferrer"
            >
              Read the paper
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
          <div className="study-meta" aria-label="Project summary">
            <span><strong>Role</strong> Pipeline implementation and evaluation</span>
            <span><strong>Stack</strong> Pyserini, MedCPT, Qwen, vLLM</span>
            <span><strong>Compute</strong> Single NVIDIA A100</span>
          </div>
        </div>
      </section>

      <section className="study-motivation">
        <div className="shell study-split">
          <div>
            <span className="section-kicker">The motivation</span>
            <h2>A fluent medical answer is not enough.</h2>
          </div>
          <div className="study-reading">
            <p>
              Biomedical retrieval systems must do more than produce plausible
              prose. A useful answer needs relevant evidence, citations that
              support the surrounding claim, and a path back to the source.
            </p>
            <p>
              Task B made that requirement concrete: return one paragraph of no
              more than 250 words, attach at most three citations per sentence,
              and cite explicit PubMed identifiers. I used those constraints to
              compare how retrieval depth and evidence selection affect answer
              quality and citation reliability.
            </p>
          </div>
        </div>
        <div className="shell study-constraints" aria-label="Task constraints">
          <div><strong>30</strong><span>official topics</span></div>
          <div><strong>5</strong><span>submitted runs</span></div>
          <div><strong>250</strong><span>word maximum</span></div>
          <div><strong>3</strong><span>citations per sentence</span></div>
        </div>
      </section>

      <section className="study-architecture" id="architecture">
        <div className="shell">
          <div className="study-section-heading">
            <div>
              <span className="section-kicker">System architecture</span>
              <h2>One controlled pipeline, with two evidence routes.</h2>
            </div>
            <p>
              The experiment keeps generation and citation enforcement stable
              while changing retrieval family and evidence budget.
            </p>
          </div>

          <div className="pipeline-diagram" aria-label="BioEvidence pipeline">
            {pipelineStages.map(({ icon: Icon, label, title, copy }, index) => (
              <article key={title}>
                <div className="pipeline-marker">
                  <Icon size={19} aria-hidden="true" />
                </div>
                <div>
                  <span>{label}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                {index < pipelineStages.length - 1 && (
                  <ArrowRight
                    className="pipeline-arrow"
                    size={18}
                    aria-hidden="true"
                  />
                )}
              </article>
            ))}
          </div>

          <div className="route-comparison">
            <div className="route-label">
              <span>Sparse route</span>
              <strong>Runs B and E</strong>
            </div>
            <div className="route-flow">
              <span>BM25</span>
              <ArrowRight size={14} aria-hidden="true" />
              <span>Cross-encoder</span>
              <ArrowRight size={14} aria-hidden="true" />
              <span>Qwen summaries</span>
              <ArrowRight size={14} aria-hidden="true" />
              <span>TF-IDF + MMR</span>
            </div>
            <div className="route-label">
              <span>Dense route</span>
              <strong>Runs C and D</strong>
            </div>
            <div className="route-flow">
              <span>BM25 pool</span>
              <ArrowRight size={14} aria-hidden="true" />
              <span>MedCPT bi-encoder</span>
              <ArrowRight size={14} aria-hidden="true" />
              <span>MedCPT cross-encoder</span>
            </div>
          </div>
        </div>
      </section>

      <section className="study-runs">
        <div className="shell">
          <div className="study-section-heading">
            <div>
              <span className="section-kicker">Experimental design</span>
              <h2>Five runs isolate retrieval and budget choices.</h2>
            </div>
            <p>
              Run A establishes an original-question baseline. Runs B–E add
              reformulation and compare sparse versus dense ranking at narrow
              and wide retrieval budgets.
            </p>
          </div>
          <div className="run-list">
            {systems.map((system) => (
              <article key={system.id}>
                <span className={`system-key system-${system.id.toLowerCase()}`}>
                  {system.id}
                </span>
                <div>
                  <h3>{system.name}</h3>
                  <p>{system.summary}</p>
                </div>
                <div className="run-tags">
                  {system.stages.map((stage) => (
                    <span key={stage}>{stage}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="study-contribution">
        <div className="shell study-split">
          <div>
            <span className="section-kicker">My implementation work</span>
            <h2>From retrieval experiments to a public inspection tool.</h2>
          </div>
          <div className="contribution-list">
            {[
              "Adapted the official starter kit into a modular experiment pipeline.",
              "Implemented query reformulation, BM25 retrieval, pooling, sparse selection, and MedCPT reranking.",
              "Built deterministic PMID mapping and post-processing for citation and length constraints.",
              "Ran the five A100 experiments, prepared the submissions, and analyzed official metrics.",
              "Built this viewer for answer comparison and sentence-level evidence inspection.",
            ].map((item) => (
              <p key={item}>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="study-lessons">
        <div className="shell">
          <div className="study-section-heading">
            <div>
              <span className="section-kicker">What failed and what I learned</span>
              <h2>The strongest system depends on what “strong” means.</h2>
            </div>
            <p>
              Precision, coverage, and citation support moved in different
              directions. The useful result was the trade-off, not a single
              universal winner.
            </p>
          </div>
          <div className="lesson-list">
            {lessons.map((lesson, index) => (
              <article key={lesson.title}>
                <span>0{index + 1}</span>
                <h3>{lesson.title}</h3>
                <p>{lesson.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="study-results">
        <div className="shell">
          <div className="study-section-heading">
            <div>
              <span className="section-kicker">Official evaluation</span>
              <h2>Dense ranking improved answers; sparse selection protected coverage.</h2>
            </div>
            <p>
              Run D achieved the strongest answer precision and correctness.
              Run E produced the highest citation coverage, while Run B had the
              lowest contradiction rate.
            </p>
          </div>
          <div className="study-results-table" role="region" aria-label="Selected official results" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Answer precision</th>
                  <th>Answer correctness</th>
                  <th>Citation coverage</th>
                  <th>Contradiction</th>
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
                    <td>{result.answerPrecision.toFixed(2)}</td>
                    <td>{result.answerCorrectness.toFixed(2)}</td>
                    <td>{result.citationCoverage.toFixed(2)}</td>
                    <td>{result.citationContradiction.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="result-interpretation">
            <FileCheck2 size={20} aria-hidden="true" />
            <p>
              Widening retrieval created small recall gains, but it also made
              citation support harder to maintain. The result argues for
              deliberate evidence selection rather than simply increasing the
              number of retrieved documents.
            </p>
            <Link href="/results">
              Explore every metric
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="study-cta">
        <div className="shell">
          <div>
            <span className="section-kicker">Inspect the output</span>
            <h2>Compare what each retrieval decision changed.</h2>
            <p>
              Search the official questions, compare two runs, and follow the
              sentence-level PMID citations into PubMed.
            </p>
          </div>
          <Link className="primary-action" href="/shared-task">
            Launch explorer
            <GitCompareArrows size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
