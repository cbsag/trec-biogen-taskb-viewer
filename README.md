# BioEvidence AI

Interactive demo for Ganesh Chandrasekar's public TREC BioGen 2025 Task B
systems.

The site lets reviewers search the official biomedical questions, inspect the
five submitted answers, compare systems side by side, and trace sentence-level
citations back to PubMed. It also includes the official shared-task metrics and
a reserved thesis-release page for systems that are not public yet.

## Demo Contents

- Search-first explorer for the 30 official Task B questions.
- Five public system outputs from the submitted TREC BioGen runs.
- PubMed-linked citation chips for generated answer sentences.
- Side-by-side comparison mode across systems.
- Official answer-quality and citation-quality result tables.
- Release-status page for future thesis systems after defense/publication.

## Data and API

The system outputs are static and precomputed. They do not require model
checkpoints, GPU inference, or a live generation backend. Optional server-side
PubMed requests supply article metadata and citation search without exposing
credentials to the browser.

The Next.js app reads:

- `data/shared-task/topics.json`
- `data/shared-task/system-a.jsonl`
- `data/shared-task/system-b.jsonl`
- `data/shared-task/system-c.jsonl`
- `data/shared-task/system-d.jsonl`
- `data/shared-task/system-e.jsonl`

The app exposes these serverless routes:

- `GET /api/health`
- `GET /api/systems`
- `GET /api/search?q=statin&systems=System%20A,System%20D`
- `GET /api/pubmed?pmids=12345678,23456789`
- `GET /api/cite?sentence=...&retmax=5`

The search and systems endpoints preserve the response shape used by the
original viewer. PubMed endpoints call the official NCBI E-utilities service.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run build
```

## Deployment

This repository is intended to deploy directly on Vercel.

Recommended Vercel settings:

- Framework preset: Next.js
- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: Next.js default
- Environment variables: `PUBMED_API_KEY` optional, `CONTACT_EMAIL`
  recommended, and `TOOL_NAME` optional

The app works without a PubMed API key, subject to NCBI's lower unauthenticated
request rate. Environment variables must be configured in Vercel, never
committed to this repository.

For production, merge the preview branch into `main` after reviewing the Vercel
preview deployment.
