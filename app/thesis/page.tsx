import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookLock,
  Check,
  FileText,
  GraduationCap,
  LockKeyhole,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Thesis release",
};

export default function ThesisPage() {
  return (
    <main>
      <section className="thesis-page">
        <div className="shell thesis-layout">
          <div className="thesis-intro">
            <span className="section-kicker">Publication status</span>
            <LockKeyhole size={36} aria-hidden="true" />
            <h1>Thesis systems are not public yet.</h1>
            <p>
              Additional retrieval strategies, experiments, and analyses are
              part of ongoing thesis work. Their details will be added here only
              after the defense and associated publication process.
            </p>
            <Link className="secondary-action" href="/shared-task">
              <ArrowLeft size={15} aria-hidden="true" />
              Return to public systems
            </Link>
          </div>

          <div className="release-status">
            <h2>Release policy</h2>
            <div className="status-row complete">
              <span><Check size={16} aria-hidden="true" /></span>
              <div>
                <strong>Public shared-task systems</strong>
                <p>Five public TREC BioGen 2025 runs are available in the explorer.</p>
              </div>
              <small>Available</small>
            </div>
            <div className="status-row">
              <span><GraduationCap size={16} aria-hidden="true" /></span>
              <div>
                <strong>Thesis defense</strong>
                <p>Research details remain restricted until the defense.</p>
              </div>
              <small>Pending</small>
            </div>
            <div className="status-row">
              <span><FileText size={16} aria-hidden="true" /></span>
              <div>
                <strong>Associated publications</strong>
                <p>Methods and results will be released in publication order.</p>
              </div>
              <small>Pending</small>
            </div>
            <div className="status-row">
              <span><BookLock size={16} aria-hidden="true" /></span>
              <div>
                <strong>Expanded interactive demo</strong>
                <p>BioEvidence AI will grow with new systems after public release.</p>
              </div>
              <small>Reserved</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
