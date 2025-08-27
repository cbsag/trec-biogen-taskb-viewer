// Shared data loader for serverless functions
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

function safeRead(p) {
  try { return fs.readFileSync(p, "utf-8"); } catch { return null; }
}

function loadTaskB() {
  const raw = safeRead(path.join(DATA_DIR, "task_b.json"));
  if (!raw) return {};
  let items = [];
  try {
    items = JSON.parse(raw);
  } catch {
    items = [];
  }
  const byId = {};
  for (const obj of items) {
    const qid = obj?.id;
    if (qid == null) continue;
    byId[qid] = {
      id: qid,
      question: obj?.question || "",
      topic: obj?.topic || "",
      narrative: obj?.narrative || "",
    };
  }
  return byId;
}

function extractAnswer(obj) {
  let topicId = null;
  let answerText = "";

  if (obj && typeof obj === "object") {
    const md = obj.metadata || {};
    if (md && md.topic_id != null) {
      const t = String(md.topic_id).trim();
      if (/^\d+$/.test(t)) topicId = Number(t);
    }
    if (topicId == null && obj.id != null) {
      const t = String(obj.id).trim();
      if (/^\d+$/.test(t)) topicId = Number(t);
    }
    if (Array.isArray(obj.responses) && obj.responses.length) {
      const parts = [];
      for (const r of obj.responses) {
        if (r && typeof r.text === "string" && r.text.trim()) {
          parts.push(r.text.trim());
        }
      }
      answerText = parts.join("\n• ");
    } else if (typeof obj.answer === "string") {
      answerText = obj.answer;
    } else if (typeof obj.text === "string") {
      answerText = obj.text;
    }
  }
  return { topicId, answerText: (answerText || "").trim() };
}

function loadSystemAnswers(fileName) {
  const p = path.join(DATA_DIR, fileName);
  const raw = safeRead(p);
  const answers = {};
  if (!raw) return answers;

  const lines = raw.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    let obj = null;
    try { obj = JSON.parse(line); } catch { obj = null; }
    if (!obj) continue;
    const { topicId, answerText } = extractAnswer(obj);
    if (topicId == null || !answerText) continue;
    if (answers[topicId]) {
      answers[topicId] += "\n• " + answerText;
    } else {
      answers[topicId] = answerText;
    }
  }
  return answers;
}

// Cache on cold start
const TASK_ITEMS = loadTaskB();
const SYSTEM_ANSWERS = Object.fromEntries(
  Object.entries(SYSTEMS).map(([name, file]) => [name, loadSystemAnswers(file)])
);

function searchItems(query) {
  if (!query || !String(query).trim()) {
    return Object.values(TASK_ITEMS).sort((a, b) => (a.id || 0) - (b.id || 0));
  }
  const q = String(query).toLowerCase().trim();
  const toks = q.split(/\s+/g);
  const res = [];
  for (const item of Object.values(TASK_ITEMS)) {
    const hay = [
      String(item.id || ""),
      item.question || "",
      item.topic || "",
      item.narrative || ""
    ].join(" ").toLowerCase();
    const ok = toks.every(tok => hay.includes(tok));
    if (ok) res.push(item);
  }
  res.sort((a, b) => (a.id || 0) - (b.id || 0));
  return res;
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
  const raw = safeRead(p);
  if (!raw) return defaultDesc;
  try {
    const obj = JSON.parse(raw);
    return { ...defaultDesc, ...obj };
  } catch {
    return defaultDesc;
  }
}

module.exports = {
  SYSTEMS,
  SYSTEM_ANSWERS,
  TASK_ITEMS,
  searchItems,
  loadDescriptions
};
