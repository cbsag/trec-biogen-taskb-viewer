# TREC BioGen 2025 — Task B Viewer (Vercel)

A Vercel-ready project with a static frontend and Node.js serverless APIs that search your Task B questions and compare answers across systems.

## What’s included
- `/public/index.html` — static UI
- `/api/search.js` & `/api/systems.js` — serverless endpoints
- `/data/` — your data files:
  - `task_b.json`
  - `System_A_output.jsonl` … `System_E_output.jsonl`
  - `system_descriptions.json` (edit this to change the tooltip text in the UI)

## Local preview (with Vercel CLI)
1. Install the CLI: `npm i -g vercel`
2. From this folder: `vercel dev`
3. Open http://localhost:3000

## Deploy to Vercel
1. Create a new GitHub repo and push these files.
2. On vercel.com: “New Project” → import your repo → deploy with defaults.
   - `vercel.json` is already set up.
   - No framework build needed; static + serverless only.
3. Visit your project URL.

## Notes
- Search is token-based across `id`, `question`, `topic`, `narrative`.
- JSONL parsing is flexible: it supports lines with
  - `{"metadata":{"topic_id":181}, "responses":[{"text":"..."}]}`
  - or `{"id":181, "answer":"..."}`
  - or `{"id":181, "text":"..."}`
- If multiple lines exist for the same topic in a system file, texts are concatenated with bullets.


## PubMed citation search
- The UI now shows a *Find PubMed cites* button next to each sentence.
- Serverless endpoint: `/api/cite?sentence=...&retmax=5`
- Optional environment variables (Vercel → Settings → Environment Variables):
  - `PUBMED_API_KEY` (NCBI E-utilities key) to raise rate limits
  - `CONTACT_EMAIL` (your email) for polite User-Agent tagging


## Auto‑cite sentences (toggle)
- A toggle appears beside the system chips. When enabled, the UI will automatically fetch PubMed citations for the first few sentences (default 5) of each system answer.
- You can still click the button next to any sentence to fetch citations on demand.
- Tune limits by editing `AUTO_CITE_PER_ANSWER_LIMIT` and `AUTO_CITE_RETMAX` in `/public/index.html`.

## Vercel deployment steps
1. **Unzip** this project and run `git init`, then commit and push to **GitHub**.
2. On **vercel.com**: click **New Project → Import** your GitHub repo.
3. Use defaults (the provided `vercel.json` routes static `/public` and `/api/*`).
4. In **Project → Settings → Environment Variables**, set optional:
   - `PUBMED_API_KEY` → your NCBI E-utilities key (recommended to increase limits)
   - `CONTACT_EMAIL` → an email for polite `User-Agent` identification
5. **Deploy**. Your app URL will be live; `/api/cite` will be callable from the UI.

### Local preview
```bash
npm i -g vercel
vercel dev
```

# trec-biogen-taskb-viewer