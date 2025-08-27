// /api/search.js
const { SYSTEMS, SYSTEM_ANSWERS, SYSTEM_PMIDS, searchItems } = require("./_data");

module.exports = async (req, res) => {
  try {
    const q = (req.query?.q ?? "").toString();
    const sysParam = (req.query?.systems ?? "").toString();
    let selected = Object.keys(SYSTEMS);
    if (sysParam.trim()) {
      const reqList = sysParam.split(",").map(s => s.trim()).filter(Boolean);
      selected = reqList.filter(s => SYSTEMS[s]);
      if (!selected.length) selected = Object.keys(SYSTEMS);
    }
    const items = searchItems(q);
    const payload = items.map(it => {
      const row = { id: it.id, question: it.question || "", topic: it.topic || "", narrative: it.narrative || "", answers: {}, pmids: {} };
      for (const s of selected) {
        const obj = SYSTEM_ANSWERS[s]?.[it.id];
        if (obj) {
          row.answers[s] = { text: obj.text || "", sentences: obj.sentences || [], pmids_all: obj.pmids_all || [] };
        } else {
          row.answers[s] = { text: "", sentences: [], pmids_all: [] };
        }
        row.pmids[s]   = (SYSTEM_PMIDS[s] && SYSTEM_PMIDS[s][it.id]) || [];
      }
      return row;
    });
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send(JSON.stringify({ results: payload, count: payload.length, systems: selected }));
  } catch (e) {
    res.status(500).send({ error: e?.message || "Internal error" });
  }
};
