// Serverless function: find PubMed citations for a sentence using NCBI E-utilities.
const fetch = global.fetch;
const API_KEY = process.env.PUBMED_API_KEY || ""; // optional
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || ""; // optional, good etiquette with E-utilities

function sanitizeSentence(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function buildQuery(sentence) {
  // If sentence is short enough, try exact phrase in Title/Abstract first.
  const s = sanitizeSentence(sentence);
  const quoted = `"${s}"[tiab]`;

  // Token-based fallback for longer sentences: remove stopwords and punctuation.
  const toks = s.toLowerCase()
    .replace(/[^\p{L}\p{N}\s\-]/gu, " ")
    .split(/\s+/g)
    .filter(Boolean);

  const stop = new Set([
    "the","a","an","and","or","but","if","then","else","when","while","for","to","of","in","on","by","with",
    "is","are","was","were","be","been","being","this","that","these","those","it","its","as","at","from",
    "we","you","they","he","she","them","his","her","their","our","my","your","not","no","yes","do","does",
    "did","done","than","such"
  ]);

  const content = toks.filter(t => !stop.has(t) && t.length > 2).slice(0, 14); // keep top ~14 tokens
  const andQuery = content.map(t => `${t}[tiab]`).join(" AND ");

  if (s.length <= 160 && content.length) {
    return `(${quoted}) OR (${andQuery})`;
  }
  return andQuery || quoted;
}

async function esearch(term, retmax=5) {
  const params = new URLSearchParams({
    db: "pubmed",
    retmode: "json",
    // add the rest (term/retmax for esearch; id for esummary)
  });
  // include API key
  if (API_KEY) params.set("api_key", API_KEY);
  // include email + tool for etiquette/compliance
  if (CONTACT_EMAIL) params.set("email", CONTACT_EMAIL);
  params.set("tool", process.env.TOOL_NAME || "trec-biogen-viewer");
  if (!r.ok) throw new Error(`esearch failed: ${r.status}`);
  const j = await r.json();
  const ids = j?.esearchresult?.idlist || [];
  return ids;
}

async function esummary(ids) {
  if (!ids.length) return {};
  const params = new URLSearchParams({
    db: "pubmed",
    retmode: "json",
    id: ids.join(",")
  });
  if (API_KEY) params.set("api_key", API_KEY);
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${params.toString()}`;
  const ua = CONTACT_EMAIL ? { "User-Agent": `mailto:${CONTACT_EMAIL}` } : {};
  const r = await fetch(url, { headers: ua });
  if (!r.ok) throw new Error(`esummary failed: ${r.status}`);
  const j = await r.json();
  return j?.result || {};
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

    const out = [];
    for (const id of ids) {
      const doc = summary?.[id];
      if (!doc) continue;
      const title = doc.title || "";
      const journal = doc.fulljournalname || doc.source || "";
      const year = extractYear(doc.sortpubdate || doc.pubdate);
      const eloc = doc.elocationid || "";
      const doi = tryExtractDOI(eloc);
      out.push({
        pmid: id,
        title,
        journal,
        year,
        doi,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send(JSON.stringify({ query: term, pmids: ids, citations: out }));
  } catch (e) {
    res.status(500).json({ error: e?.message || "Internal error" });
  }
};
