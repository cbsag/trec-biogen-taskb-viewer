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

function normTopicId(x){
  if (x == null) return null;
  const t = String(x).trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

function unique(arr){ return Array.from(new Set(arr)); }

function loadSystemAnswers(fileName) {
  // Returns: { [topicId]: { text, sentences:[{text, pmids:[]}, ...], pmids_all:[] } }
  const p = path.join(DATA_DIR, fileName);
  const raw = safeRead(p);
  const out = {};
  if (!raw) return out;

  for (const line of raw.split(/\r?\n/).filter(Boolean)) {
    let obj = null; try { obj = JSON.parse(line); } catch { obj = null; }
    if (!obj) continue;

    // topic id
    const topicId = normTopicId(obj?.metadata?.topic_id ?? obj?.id);
    if (topicId == null) continue;

    // build text & sentence list
    let sentences = [];
    let fullText = "";

    if (Array.isArray(obj.responses) && obj.responses.length) {
      sentences = obj.responses.map(r => ({
        text: (r?.text || "").trim(),
        pmids: Array.isArray(r?.citations)
          ? r.citations.map(x => String(x).trim()).filter(s => /^\d{5,9}$/.test(s)).slice(0,3)
          : []
      })).filter(s => s.text);

      fullText = sentences.map(s => s.text).join(" ");

    } else if (typeof obj.answer === "string") {
      fullText = obj.answer.trim();
      sentences = fullText.split(/(?<=[.!?])\s+(?=[A-Z0-9])/g).map(t => ({ text: t, pmids: [] }));
    } else if (typeof obj.text === "string") {
      fullText = obj.text.trim();
      sentences = fullText.split(/(?<=[.!?])\s+(?=[A-Z0-9])/g).map(t => ({ text: t, pmids: [] }));
    }

    const pmids_all = unique(sentences.flatMap(s => s.pmids)).slice(0,50);

    out[topicId] = { text: fullText, sentences, pmids_all };
  }
  return out;
}

function loadSystemPMIDs(fileName) {
  // Kept for backwards compatibility (union per topic)
  const p = path.join(DATA_DIR, fileName);
  const raw = safeRead(p); const idsByTopic = {};
  if (!raw) return idsByTopic;
  for (const line of raw.split(/\r?\n/).filter(Boolean)) {
    let obj = null; try { obj = JSON.parse(line); } catch { obj = null; }
    if (!obj) continue;
    const topicId = normTopicId(obj?.metadata?.topic_id ?? obj?.id);
    if (topicId == null) continue;

    const inResponses = Array.isArray(obj.responses) ? obj.responses.flatMap(r => Array.isArray(r?.citations)? r.citations : []) : [];
    const arr = inResponses.map(x => String(x).trim()).filter(s => /^\d{5,9}$/.test(s));
    if (!arr.length) continue;
    if (!idsByTopic[topicId]) idsByTopic[topicId] = [];
    idsByTopic[topicId].push(...arr);
  }
  for (const k of Object.keys(idsByTopic)) {
    idsByTopic[k] = Array.from(new Set(idsByTopic[k])).slice(0,50);
  }
  return idsByTopic;
}

// Cache on cold start
const TASK_ITEMS = loadTaskB();
const SYSTEM_ANSWERS = Object.fromEntries(Object.entries(SYSTEMS).map(([name,file]) => [name, loadSystemAnswers(file)]));
const SYSTEM_PMIDS   = Object.fromEntries(Object.entries(SYSTEMS).map(([name,file]) => [name, loadSystemPMIDs(file)]));

function searchItems(query) {
  if (!query || !String(query).trim()) return [];
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
    "System A": "Baseline\n• BM25 retrieval\n• Cross-encoder re-ranking\n• Qwen2.5-Coder generation",
    "System B": "Three-stage\n• Query reformulation\n• Retrieval → cross-encoder re-ranking\n• Summarizer + Qwen2.5-Coder",
    "System C": "Two-stage\n• Reformulation\n• MedCPT bi-encoder retrieval\n• Qwen2.5-Coder",
    "System D": "Two-stage • broader corpus\n• Reformulation\n• MedCPT bi-encoder retrieval\n• Qwen2.5-Coder",
    "System E": "Three-stage • broader corpus\n• Reformulation\n• Retrieval → cross-encoder re-ranking\n• Summarizer + Qwen2.5-Coder"
  };
  const p = path.join(DATA_DIR, "system_descriptions.json");
  const raw = safeRead(p); if (!raw) return defaultDesc;
  try { const obj = JSON.parse(raw); return { ...defaultDesc, ...obj }; } catch { return defaultDesc; }
}

module.exports = { SYSTEMS, SYSTEM_ANSWERS, SYSTEM_PMIDS, TASK_ITEMS, searchItems, loadDescriptions };
