// /api/cite.js
const fetch = global.fetch;

// Env (set in Vercel → Project → Settings → Environment Variables)
const API_KEY = process.env.PUBMED_API_KEY || "";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || ""; // recommended by NCBI
const TOOL_NAME = process.env.TOOL_NAME || "trec-biogen-viewer";

// --- helpers ---
function sanitizeSentence(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function buildQuery(sentence) {
  const s = sanitizeSentence(sentence);
  const quoted = `"${s}"[tiab]`;
  const toks = s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s\-]/gu, " ")
    .split(/\s+/g)
    .filter(Boolean);
  const stop = new Set([
    "the","a","an","and","or","but","if","then","else","when","while","for","to","of","in","on","by","with",
    "is","are","was","were","be","been","being","this","that","these","those","it","its","as","at","from",
    "we","you","they","he","she","them","his","her","their","our","my","your","not","no","yes","do","does",
    "did","done","than","such"
  ]);
  const content = toks.filter(t => !stop.has(t) && t.length > 2).slice(0, 14);
  const andQuery = content.map(t => `${t}[tiab]`).join(" AND ");
  if (s.length <= 160 && content.length) return `(${quoted}) OR (${andQuery})`;
  return andQuery || quoted;
}

function extractYear(pubdate) {
  const m = String(pubdate || "").match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : "";
}

function tryExtractDOI(elocationid) {
  const s = String(elocationid || "");
  const m = s.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  return m ? m[0] : "";
}

function uaHeaders() {
  return CONTACT_EMAIL ? { "User-Agent": `mailto:${CONTACT_EMAIL}` } : {};
}

// --- E-utilities ---
async function esearch(term, retmax = 5) {
  const params = new URLSearchParams({
    db: "pubmed",
    retmode: "json",
    sort: "relevance",
    retmax: String(retmax),
    term,
    tool: TOOL_NAME
  });
  if (API_KEY) params.set("api_key", API_KEY);
  if (CONTACT_EMAIL) params.set("email", CONTACT_EMAIL);

  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params.toString()}`;
  const r = await fetch(url, { headers: uaHeaders() });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`esearch ${r.status}: ${text.slice(0,200)}`);
  }
  const j = await r.json();
  return j?.esearchresult?.idlist || [];
}

async function esummary(ids) {
  if (!ids.length) return {};
  const params = new URLSearchParams({
    db: "pubmed",
    retmode: "json",
    id: ids.join(","),
    tool: TOOL_NAME
  });
  if (API_KEY) params.set("api_key", API_KEY);
  if (CONTACT_EMAIL) params.set("email", CONTACT_EMAIL);

  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${params.toString()}`;
  const r = await fetch(url, { headers: uaHeaders() });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`esummary ${r.status}: ${text.slice(0,200)}`);
  }
  const j = await r.json();
  return j?.result || {};
}

// --- handler ---
module.exports = async (req, res) => {
  try {
    const sentence = (req.query?.sentence ?? "").toString().trim();
    const retmax = Math.min(Math.max(parseInt(req.query?.retmax ?? "5", 10) || 5, 1), 20);
    if (!sentence) {
      res.status(400).json({ error: "Missing ?sentence=" });
      return;
    }

    const term = buildQuery(sentence);
    const ids = await esearch(term, retmax);
    const summary = await esummary(ids);

    const citations = [];
    for (const id of ids) {
      const doc = summary?.[id];
      if (!doc) continue;
      citations.push({
        pmid: id,
        title: doc.title || "",
        journal: doc.fulljournalname || doc.source || "",
        year: extractYear(doc.sortpubdate || doc.pubdate),
        doi: tryExtractDOI(doc.elocationid || ""),
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300"); // edge cache 5 min
    res.status(200).json({ query: term, pmids: ids, citations });
  } catch (e) {
    res.status(200).json({ error: String(e?.message || e) });
  }
};
