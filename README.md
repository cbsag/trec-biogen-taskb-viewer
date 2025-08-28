# TREC BioGen 2025 — Task B Viewer

A lightweight, Vercel-friendly viewer to **search topics** and **compare sentence-level, cited answers** across systems for **BioGen 2025 (Task B: Reference Attribution)**. It supports dark/light theme, tabs/columns layouts, inline PMID chips, and on-demand PubMed details.

---

## What’s inside
- `/public/index.html` — single-page UI (Home / Task / Viewer / Team)
- `/api/systems.js` — list of systems + descriptions
- `/api/search.js` — search topics and return answers by system
- `/api/pubmed.js` — batch PMID → details (title, journal, year, doi, url, abstract)
- `/data/`
  - `task_b.json` — topics (`id`, `question`, `topic`, `narrative`)
  - `System_A_output.jsonl` … `System_E_output.jsonl` — system outputs
  - `system_descriptions.json` — tooltip text for system chips

> **Tip:** You do **not** need `vercel.json`. Enter via `/` and use the in-app navigation. If you want deep links (e.g., `/viewer`) to work on cold loads, you can add a rewrite later.

---

## Quick start (local)
```bash
npm i -g vercel
vercel dev
# open http://localhost:3000
```

The UI calls `/api/systems`, `/api/search`, and `/api/pubmed`. With `/data` in place, you’ll see results immediately.

---

## Deploy to Vercel (no build step)
1. Push the project to a new GitHub repo.
2. On https://vercel.com → **New Project** → import the repo → **Deploy** (defaults are fine).

### Optional: clean URLs
If you need direct links like `/viewer` or `/task` to work when loaded fresh, add a `vercel.json` rewrite to route all paths to `/public/index.html`.

---

## Data formats

### `/data/task_b.json`
```json
[
  { "id": "181", "question": "...", "topic": "...", "narrative": "..." }
]
```

### `/data/System_X_output.jsonl`
Each line = one topic. Any of these shapes are accepted:
```json
{"metadata":{"topic_id":"181"},"responses":[
  { "text": "Sentence 1.", "citations": ["31604329","22802756"] },
  { "text": "Sentence 2.", "citations": ["30508923"] }
]}
```
```json
{"id":"181","text":"Full answer text…"}        // UI auto-splits into sentences (no PMIDs)
```
```json
{"id":"181","answer":"Full answer text…"}      // alias for "text"
```
If multiple lines exist for the same topic in a system file, the viewer concatenates them as bullets.

---

## API (serverless)

- `GET /api/systems` → `{"systems":[...],"descriptions":{...}}`
- `GET /api/search?q=<query>&systems=<comma_list>` → matches `id`, `question`, `topic`, `narrative`
- `GET /api/pubmed?pmids=<comma_list>` → details for PMIDs (title, journal, year, doi, url, abstract)

---

## Team
- **Ganesh Chandrasekar (cbsag)** — <https://www.linkedin.com/in/cbsag/>
- **Benjamin Lofo** — <https://www.linkedin.com/in/lamungu/>
- **Aleksandr Vinokhodov** — <https://www.linkedin.com/in/aleksandr-vinokhodov/>

(Also listed on the in-app **Team** page.)

---

## License
**MIT License** — you’re free to adapt and redistribute this viewer. Replace the license if your project requires a different one.

---

## Acknowledgments
Huge thanks to the **TREC BioGen organizers** and **NIST** for the task specification, datasets, and evaluation framework that made this viewer useful.
