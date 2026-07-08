import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  Globe2,
  UsersRound,
} from "lucide-react";

import { officialLinks } from "@/lib/systems";

export const metadata: Metadata = {
  title: "About Ganesh",
  description:
    "About Ganesh Chandrasekar, the researcher and engineer behind BioEvidence AI.",
};

const researchAreas = [
  "Biomedical question answering",
  "Information retrieval and RAG",
  "Evidence grounding",
  "LLM evaluation",
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <Image
          className="about-hero-image"
          src="/ganesh-chandrasekar.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="about-hero-shade" aria-hidden="true" />
        <div className="shell about-hero-content">
          <span className="section-kicker">Researcher and AI engineer</span>
          <h1>Ganesh Chandrasekar</h1>
          <p>
            I build and evaluate retrieval, RAG, and language-model systems
            where answers need to remain connected to their evidence.
          </p>
        </div>
      </section>

      <section className="about-profile">
        <div className="shell about-profile-grid">
          <div>
            <span className="section-kicker">Profile</span>
            <h2>Applied AI research with an engineering foundation.</h2>
          </div>
          <div className="about-profile-copy">
            <p>
              I am completing a Master of Computer Science thesis at Concordia
              University on evidence-grounded biomedical question answering.
              My work spans sparse and dense retrieval, sequence labeling,
              open-source LLM inference, and human and model-based evaluation.
            </p>
            <p>
              I care about systems that can be inspected: what they retrieved,
              what they answered, which evidence they used, and where they
              failed.
            </p>
          </div>
        </div>
        <div className="shell research-area-list" aria-label="Research areas">
          {researchAreas.map((area) => (
            <span key={area}>{area}</span>
          ))}
        </div>
      </section>

      <section className="about-demo">
        <div className="shell about-demo-grid">
          <div>
            <span className="section-kicker">This demo</span>
            <h2>From a 26.8-million-document corpus to five public runs.</h2>
          </div>
          <div>
            <p>
              For TREC BioGen 2025, I developed modular sparse and dense
              pipelines using BM25, Pyserini, MedCPT, cross-encoder reranking,
              TF-IDF/MMR, and Qwen. BioEvidence AI makes the submitted outputs
              and their PubMed citations easier to inspect.
            </p>
            <p>
              Thanks to my collaborators, CLaC Lab, the TREC BioGen organizers,
              and the shared-task evaluators. This site presents the public
              submission only; additional thesis work will follow after defense
              and publication.
            </p>
            <a
              className="paper-link"
              href={officialLinks.proceedings}
              target="_blank"
              rel="noreferrer"
            >
              Read the proceedings paper
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="about-connect" aria-labelledby="connect-heading">
        <div className="shell">
          <div>
            <span className="section-kicker">Continue exploring</span>
            <h2 id="connect-heading">Find my work and research online.</h2>
          </div>
          <div className="about-social-links">
            <a href="https://cbsag.me" target="_blank" rel="noreferrer">
              <Globe2 size={17} aria-hidden="true" />
              <span>
                <strong>Portfolio</strong>
                <small>cbsag.me</small>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <a
              href="https://github.com/cbsag"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={17} aria-hidden="true" />
              <span>
                <strong>GitHub</strong>
                <small>cbsag</small>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/in/cbsag/"
              target="_blank"
              rel="noreferrer"
            >
              <UsersRound size={17} aria-hidden="true" />
              <span>
                <strong>LinkedIn</strong>
                <small>Ganesh Chandrasekar</small>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
