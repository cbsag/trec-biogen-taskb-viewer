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

## Data

The current public demo is fully static/precomputed. It does not require private
API keys, PubMed API access, model checkpoints, GPU inference, or a live
generation backend.

The Next.js app reads:

- `data/shared-task/topics.json`
- `data/shared-task/system-a.jsonl`
- `data/shared-task/system-b.jsonl`
- `data/shared-task/system-c.jsonl`
- `data/shared-task/system-d.jsonl`
- `data/shared-task/system-e.jsonl`

Legacy serverless API files from the earlier static viewer are not required for
this version and are not included in the new app path.

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
- Environment variables: none required

For production, merge the preview branch into `main` after reviewing the Vercel
preview deployment.
