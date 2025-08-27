// /api/_data.js
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const SYSTEMS = {
  "System A": "System_A_output.jsonl",
  "System B": "System_B_output.jsonl",
  "System C": "System_C_output.jsonl",
  "System D": "System_D_output.jsonl",
  "System E": "System_E_output.jsonl",
};

function safeRead(p) { try { return fs.readFileSync(p, "utf-8"); } catch { return null; } }

function loadTaskB() {
  const raw = safeRead(path.join(DATA_DIR, "task_b.json"));
  if (!raw) return {};
  let items = [];
  try { items = JSON.parse(raw); } catch { items = []; }
  const byId = {};
  for (const obj of items) {
    const qid = obj?.id; if (qid == null) continue;
    byId[qid] = { id: qid, question: obj?.question || "", topic: obj?.topic || "", narrative: obj?.narrative || "" };
  }
  return byId;
}

function extractAnswer(obj) {
  let topicId = null, answerText = "";
  if (obj && typeof obj === "object") {
    const md = obj.metadata || {};
    if (md && md.topic_id != null) {
      const t = String(md.topic_id).trim(); if (/^\d+$/.test(t)) topicId = Number(t);
    }

    if (topicId == null && obj.topic_id != null) {
      const t = String(obj.topic_id).trim(); if (/^\d+$/.test(t)) topicId = Number(t);
    }
    if (topicId == null && obj.qid != null) {
      const t = String(obj.qid).trim(); if (/^\d+$/.test(t)) topicId = Number(t);
    }
    if (topicId == null && obj.id != null) {
      const t = String(obj.id).trim(); if (/^\d+$/.test(t)) topicId = Number(t);
    }
    if (Array.isArray(obj.responses) && obj.responses.length) {
      const parts = [];
      for (const r of obj.responses) if (r && typeof r.text === "string" && r.text.trim()) parts.push(r.text.trim());
      answerText = parts.join("\n• ");
    } else if (typeof obj.answer === "string") answerText = obj.answer;
    else if (typeof obj.text === "string") answerText = obj.text;
  }
  return { topicId, answerText: (answerText || "").trim() };
}

function extractPMIDs(obj) {
  const set = new Set();

  // Common shapes
  if (Array.isArray(obj.pmids)) obj.pmids.forEach(x => { const s = String(x).trim(); if (/^\d{5,9}$/.test(s)) set.add(s); });
  if (obj.metadata && Array.isArray(obj.metadata.pmids)) obj.metadata.pmids.forEach(x => { const s = String(x).trim(); if (/^\d{5,9}$/.test(s)) set.add(s); });
  if (Array.isArray(obj.citations)) obj.citations.forEach(c => { const s = String(c?.pmid || c?.PMID || "").trim(); if (/^\d{5,9}$/.test(s)) set.add(s); });
  if (Array.isArray(obj.references)) obj.references.forEach(x => { const s = String(x?.pmid || x).trim(); if (/^\d{5,9}$/.test(s)) set.add(s); });
  if (Array.isArray(obj.evidence)) obj.evidence.forEach(x => { const s = String(x?.pmid || x?.PMID || "").trim(); if (/^\d{5,9}$/.test(s)) set.add(s); });
  // Pull from text if present: “PMID: 12345678”
  function scanText(s) {
    if (!s) return;
    const re = /PMID[:\s]*([0-9]{5,9})/gi; let m;
    while ((m = re.exec(s))) set.add(m[1]);
  }
  if (typeof obj.answer === "string") scanText(obj.answer);
  if (typeof obj.text === "string") scanText(obj.text);
  if (Array.isArray(obj.responses)) for (const r of obj.responses) if (r && typeof r.text === "string") scanText(r.text);

  return Array.from(set);
}

function loadSystemAnswers(fileName) {
  const p = path.join(DATA_DIR, fileName);
  const raw = safeRead(p); const answers = {};
  if (!raw) return answers;
  for (const line of raw.split(/\r?\n/).filter(Boolean)) {
    let obj = null; try { obj = JSON.parse(line); } catch { obj = null; }
    if (!obj) continue;
    const { topicId, answerText } = extractAnswer(obj);
    if (topicId == null || !answerText) continue;
    answers[topicId] = answers[topicId] ? (answers[topicId] + "\n• " + answerText) : answerText;
  }
  return answers;
}

function loadSystemPMIDs(fileName) {
  const p = path.join(DATA_DIR, fileName);
  const raw = safeRead(p); const idsByTopic = {};
  if (!raw) return idsByTopic;
  for (const line of raw.split(/\r?\n/).filter(Boolean)) {
    let obj = null; try { obj = JSON.parse(line); } catch { obj = null; }
    if (!obj) continue;
    const { topicId } = extractAnswer(obj);
    if (topicId == null) continue;
    const ids = extractPMIDs(obj);
    if (!ids.length) continue;
    if (!idsByTopic[topicId]) idsByTopic[topicId] = [];
    idsByTopic[topicId].push(...ids);
  }
  // unique + normalized
  for (const k of Object.keys(idsByTopic)) {
    idsByTopic[k] = Array.from(new Set(idsByTopic[k].map(x => String(x).trim()))).slice(0, 50);
  }
  return idsByTopic;
}

// Cache on cold start
const TASK_ITEMS = loadTaskB();
const SYSTEM_ANSWERS = Object.fromEntries(Object.entries(SYSTEMS).map(([name,file]) => [name, loadSystemAnswers(file)]));
const SYSTEM_PMIDS   = Object.fromEntries(Object.entries(SYSTEMS).map(([name,file]) => [name, loadSystemPMIDs(file)]));

function searchItems(query) {
  if (!query || !String(query).trim()) return Object.values(TASK_ITEMS).sort((a,b)=>(a.id||0)-(b.id||0));
  const q = String(query).toLowerCase().trim(); const toks = q.split(/\s+/g);
  const res = [];
  for (const item of Object.values(TASK_ITEMS)) {
    const hay = [String(item.id||""), item.question||"", item.topic||"", item.narrative||""].join(" ").toLowerCase();
    if (toks.every(tok => hay.includes(tok))) res.push(item);
  }
  res.sort((a,b)=>(a.id||0)-(b.id||0)); return res;
}

function loadDescriptions() {
  const defaultDesc = {
    "System A": "Baseline + Qwen (placeholder).",
    "System B": "Placeholder.",
    "System C": "BM25 + reformulations; MedCPT bi-encoder + cross-encoder rerank.",
    "System D": "BM25 original; keep top-30 after rerank; MedCPT bi+cross encoder.",
    "System E": "Placeholder.",
  };
  const p = path.join(DATA_DIR, "system_descriptions.json");
  const raw = safeRead(p); if (!raw) return defaultDesc;
  try { const obj = JSON.parse(raw); return { ...defaultDesc, ...obj }; } catch { return defaultDesc; }
}

module.exports = { SYSTEMS, SYSTEM_ANSWERS, SYSTEM_PMIDS, TASK_ITEMS, searchItems, loadDescriptions };
